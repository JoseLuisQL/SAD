import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';
import * as signatureService from './signature.service';
import * as notificationService from './notification.service';
import * as notificationsService from './notifications.service';

interface SignerData {
  userId: string;
  order: number;
  signedAt?: Date | null;
  status: string;
}

interface CreateSignatureFlowParams {
  documentId: string;
  name: string;
  signers: Array<{ userId: string; order: number }>;
  createdById: string;
  req: Request;
}

interface GetAllSignatureFlowsFilters {
  documentId?: string;
  status?: string;
  signerId?: string;
  documentTypeId?: string;
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

interface AdvanceSignatureFlowParams {
  flowId: string;
  signedDocumentBuffer: Buffer;
  signerId: string;
  documentExtension: string;
  req: Request;
}

export const createSignatureFlow = async (params: CreateSignatureFlowParams) => {
  const { documentId, name, signers, createdById, req } = params;

  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('El documento especificado no existe');
  }

  const userIds = signers.map(s => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } }
  });

  if (users.length !== userIds.length) {
    throw new Error('Uno o más usuarios firmantes no existen');
  }

  const sortedSigners = [...signers].sort((a, b) => a.order - b.order);

  const signersData: SignerData[] = sortedSigners.map(signer => ({
    userId: signer.userId,
    order: signer.order,
    signedAt: null,
    status: 'PENDING'
  }));

  const signatureFlow = await prisma.signatureFlow.create({
    data: {
      name,
      documentId,
      signers: signersData as any,
      currentStep: 0,
      status: 'PENDING',
      createdBy: createdById
    },
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Marcar el documento como IN_FLOW cuando se crea el flujo
  await prisma.document.update({
    where: { id: documentId },
    data: {
      signatureStatus: 'IN_FLOW'
    }
  });
  console.log(`✅ Documento ${documentId} marcado como IN_FLOW`);

  await log({
    userId: createdById,
    action: 'DOCUMENT_SIGN_ATTEMPT',
    module: 'signature_flows',
    entityType: 'SignatureFlow',
    entityId: signatureFlow.id,
    newValue: {
      flowId: signatureFlow.id,
      documentId,
      name,
      signersCount: signers.length
    },
    req
  });

  if (signersData.length > 0) {
    const firstSigner = users.find(u => u.id === signersData[0].userId);
    if (firstSigner) {
      await notificationService.sendEmail({
        to: firstSigner.email,
        subject: `Nuevo flujo de firma: ${name}`,
        body: `Hola ${firstSigner.firstName}, tienes un nuevo documento para firmar en el flujo "${name}".`
      });

      await notificationsService.createFlowAdvanceNotification(
        firstSigner.id,
        signatureFlow.id,
        name,
        document.fileName,
        documentId
      );
    }
  }

  // Map 'creator' to 'createdBy' to match frontend expectations
  return {
    ...signatureFlow,
    createdBy: (signatureFlow as any).creator
  };
};

export const getSignatureFlowById = async (id: string) => {
  const flow = await prisma.signatureFlow.findUnique({
    where: { id },
    include: {
      document: {
        include: {
          archivador: true,
          documentType: true,
          office: true
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!flow) {
    throw new Error('Flujo de firma no encontrado');
  }

  const signersData = flow.signers as unknown as SignerData[];
  const userIds = signersData.map(s => s.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true
    }
  });

  const signersWithUserData = signersData.map(signer => {
    const user = users.find(u => u.id === signer.userId);
    return {
      ...signer,
      user
    };
  });

  return {
    ...flow,
    createdBy: (flow as any).creator, // Map 'creator' to 'createdBy' to match frontend expectations
    signers: signersWithUserData
  };
};

export const getAllSignatureFlows = async (filters: GetAllSignatureFlowsFilters) => {
  const {
    documentId,
    status,
    signerId,
    documentTypeId,
    createdById,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (documentId) {
    where.documentId = documentId;
  }

  if (status) {
    where.status = status;
  }

  if (signerId) {
    where.signers = {
      path: '$[*].userId',
      array_contains: signerId
    };
  }

  if (createdById) {
    where.createdBy = createdById;
  }

  if (documentTypeId) {
    where.document = {
      documentTypeId
    };
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.createdAt.lte = new Date(dateTo);
    }
  }

  const [flows, total, statusCounts] = await Promise.all([
    prisma.signatureFlow.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        document: {
          select: {
            id: true,
            documentNumber: true,
            fileName: true,
            documentTypeId: true,
            documentType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.signatureFlow.count({ where }),
    prisma.signatureFlow.groupBy({
      by: ['status'],
      where,
      _count: {
        status: true
      }
    })
  ]);

  const totalPages = Math.ceil(total / limit);

  const metadata = {
    totalByStatus: statusCounts.reduce((acc: any, curr: any) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, {}),
    totalFlows: total
  };

  const flowsWithProgress = flows.map(flow => {
    const signersData = flow.signers as unknown as SignerData[];
    const signedCount = signersData.filter(s => s.status === 'SIGNED').length;
    const totalSigners = signersData.length;
    const progressPercent = totalSigners > 0 ? Math.round((signedCount / totalSigners) * 100) : 0;

    return {
      ...flow,
      createdBy: (flow as any).creator, // Map 'creator' to 'createdBy' to match frontend expectations
      progressPercent,
      signedCount,
      totalSigners
    };
  });

  return {
    flows: flowsWithProgress,
    total,
    page,
    limit,
    totalPages,
    metadata
  };
};

export const advanceSignatureFlow = async (params: AdvanceSignatureFlowParams) => {
  const { flowId, signedDocumentBuffer, signerId, documentExtension, req } = params;

  const flow = await prisma.signatureFlow.findUnique({
    where: { id: flowId },
    include: {
      document: true
    }
  });

  if (!flow) {
    throw new Error('Flujo de firma no encontrado');
  }

  if (flow.status === 'COMPLETED') {
    throw new Error('El flujo de firma ya ha sido completado');
  }

  if (flow.status === 'CANCELLED') {
    throw new Error('El flujo de firma ha sido cancelado');
  }

  const signersData = flow.signers as unknown as SignerData[];
  
  if (flow.currentStep >= signersData.length) {
    throw new Error('El flujo de firma ya ha sido completado');
  }

  const currentSigner = signersData[flow.currentStep];

  if (currentSigner.userId !== signerId) {
    throw new Error('No es tu turno para firmar este documento');
  }

  const signResult = await signatureService.signDocument({
    documentId: flow.documentId,
    signerId,
    documentExtension,
    signedFileBuffer: signedDocumentBuffer,
    req
  });

  if (signResult.status === 'error') {
    throw new Error(signResult.error || 'Error al procesar firma del documento');
  }

  currentSigner.signedAt = new Date();
  currentSigner.status = 'SIGNED';

  const nextStep = flow.currentStep + 1;
  const isCompleted = nextStep >= signersData.length;

  const updatedFlow = await prisma.signatureFlow.update({
    where: { id: flowId },
    data: {
      signers: signersData as any,
      currentStep: nextStep,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
    },
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await log({
    userId: signerId,
    action: 'DOCUMENT_SIGNED',
    module: 'signature_flows',
    entityType: 'SignatureFlow',
    entityId: flowId,
    newValue: {
      flowId,
      documentId: flow.documentId,
      currentStep: nextStep,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
    },
    req
  });

  if (isCompleted) {
    await notificationService.sendEmail({
      to: updatedFlow.creator.email,
      subject: `Flujo de firma completado: ${flow.name}`,
      body: `El flujo de firma "${flow.name}" ha sido completado. Todos los firmantes han firmado el documento.`
    });

    const allSignerIds = signersData.map(s => s.userId);
    await notificationsService.createFlowCompletedNotification(
      [flow.createdBy, ...allSignerIds],
      flowId,
      flow.name,
      flow.document.fileName,
      flow.documentId
    );
  } else {
    const nextSigner = signersData[nextStep];
    const nextUser = await prisma.user.findUnique({
      where: { id: nextSigner.userId }
    });

    if (nextUser) {
      await notificationService.sendEmail({
        to: nextUser.email,
        subject: `Tu turno para firmar: ${flow.name}`,
        body: `Hola ${nextUser.firstName}, es tu turno para firmar el documento en el flujo "${flow.name}".`
      });

      await notificationsService.createFlowAdvanceNotification(
        nextUser.id,
        flowId,
        flow.name,
        flow.document.fileName,
        flow.documentId
      );
    }
  }

  // Map 'creator' to 'createdBy' to match frontend expectations
  return {
    ...updatedFlow,
    createdBy: (updatedFlow as any).creator
  };
};

export const cancelSignatureFlow = async (flowId: string, userId: string, req: Request) => {
  const flow = await prisma.signatureFlow.findUnique({
    where: { id: flowId }
  });

  if (!flow) {
    throw new Error('Flujo de firma no encontrado');
  }

  if (flow.createdBy !== userId) {
    throw new Error('Solo el creador del flujo puede cancelarlo');
  }

  if (flow.status === 'CANCELLED') {
    throw new Error('El flujo de firma ya está cancelado');
  }

  if (flow.status === 'COMPLETED') {
    throw new Error('No se puede cancelar un flujo de firma completado');
  }

  const updatedFlow = await prisma.signatureFlow.update({
    where: { id: flowId },
    data: {
      status: 'CANCELLED'
    },
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  // Actualizar el estado del documento al cancelar el flujo
  // Si no se ha firmado ninguna vez, volver a UNSIGNED
  // Si se ha firmado al menos una vez, dejar como PARTIALLY_SIGNED
  const newDocumentStatus = flow.currentStep === 0 ? 'UNSIGNED' : 'PARTIALLY_SIGNED';
  await prisma.document.update({
    where: { id: flow.documentId },
    data: {
      signatureStatus: newDocumentStatus
    }
  });
  console.log(`✅ Documento ${flow.documentId} marcado como ${newDocumentStatus} tras cancelar flujo`);

  await log({
    userId,
    action: 'DOCUMENT_SIGN_FAILED',
    module: 'signature_flows',
    entityType: 'SignatureFlow',
    entityId: flowId,
    newValue: {
      flowId,
      status: 'CANCELLED',
      cancelledBy: userId
    },
    req
  });

  const signersData = flow.signers as unknown as SignerData[];
  const userIds = signersData.map(s => s.userId);
  const signerUsers = await prisma.user.findMany({
    where: { id: { in: userIds } }
  });

  for (const signer of signerUsers) {
    await notificationService.sendEmail({
      to: signer.email,
      subject: `Flujo de firma cancelado: ${flow.name}`,
      body: `El flujo de firma "${flow.name}" ha sido cancelado.`
    });
  }

  // Map 'creator' to 'createdBy' to match frontend expectations
  return {
    ...updatedFlow,
    createdBy: (updatedFlow as any).creator
  };
};

export const getPendingSignatureFlows = async (userId: string) => {
  const flows = await prisma.signatureFlow.findMany({
    where: {
      status: {
        in: ['PENDING', 'IN_PROGRESS']
      }
    },
    include: {
      document: {
        select: {
          id: true,
          documentNumber: true,
          fileName: true
        }
      },
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const pendingForUser = flows.filter(flow => {
    const signersData = flow.signers as unknown as SignerData[];
    if (flow.currentStep >= signersData.length) {
      return false;
    }
    const currentSigner = signersData[flow.currentStep];
    return currentSigner.userId === userId;
  });

  // Map 'creator' to 'createdBy' to match frontend expectations
  const mappedFlows = pendingForUser.map(flow => ({
    ...flow,
    createdBy: (flow as any).creator
  }));

  return mappedFlows;
};

interface AdvanceSignatureFlowFromComponentParams {
  flowId: string;
  signerId: string;
  signatureId: string;
  req: Request;
}

/**
 * Avanza un flujo de firma después de que el componente web de Firma Perú ha procesado el documento.
 * Esta función solo actualiza el estado del flujo, no procesa el documento firmado
 * (eso ya lo hizo processSignedDocument).
 */
export const advanceSignatureFlowFromComponent = async (
  params: AdvanceSignatureFlowFromComponentParams
) => {
  const { flowId, signerId, signatureId, req } = params;
  // signatureId se recibe para tracking pero ya fue registrado por processSignedDocument
  console.log('📝 Avanzando flujo de firma:', { flowId, signerId, signatureId });

  const flow = await prisma.signatureFlow.findUnique({
    where: { id: flowId },
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!flow) {
    throw new Error('Flujo de firma no encontrado');
  }

  if (flow.status === 'COMPLETED') {
    throw new Error('El flujo de firma ya ha sido completado');
  }

  if (flow.status === 'CANCELLED') {
    throw new Error('El flujo de firma ha sido cancelado');
  }

  const signersData = flow.signers as unknown as SignerData[];
  
  if (flow.currentStep >= signersData.length) {
    throw new Error('El flujo de firma ya ha sido completado');
  }

  const currentSigner = signersData[flow.currentStep];

  if (currentSigner.userId !== signerId) {
    throw new Error('No es el turno de este usuario para firmar');
  }

  // Actualizar el estado del firmante actual
  currentSigner.signedAt = new Date();
  currentSigner.status = 'SIGNED';

  const nextStep = flow.currentStep + 1;
  const isCompleted = nextStep >= signersData.length;

  const updatedFlow = await prisma.signatureFlow.update({
    where: { id: flowId },
    data: {
      signers: signersData as any,
      currentStep: nextStep,
      status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS'
    }
  });

  // Actualizar el estado del documento según el estado del flujo
  const newDocumentStatus = isCompleted ? 'SIGNED' : (nextStep === 1 ? 'IN_FLOW' : 'PARTIALLY_SIGNED');
  await prisma.document.update({
    where: { id: flow.documentId },
    data: {
      signatureStatus: newDocumentStatus
    }
  });
  console.log(`✅ Estado del documento actualizado a: ${newDocumentStatus}`);

  await log({
    userId: signerId,
    action: 'SIGNATURE_FLOW_ADVANCED',
    module: 'Firma Digital',
    entityType: 'SignatureFlow',
    entityId: flowId,
    oldValue: flow,
    newValue: updatedFlow,
    req
  });

  // Notificar al siguiente firmante o al creador si el flujo ha terminado
  if (isCompleted) {
    await notificationService.sendEmail({
      to: flow.creator.email,
      subject: `Flujo de firma completado: ${flow.name}`,
      body: `El flujo de firma "${flow.name}" ha sido completado. Todos los firmantes han firmado el documento.`
    });

    const allSignerIds = signersData.map(s => s.userId);
    await notificationsService.createFlowCompletedNotification(
      [flow.createdBy, ...allSignerIds],
      flowId,
      flow.name,
      flow.document.fileName,
      flow.documentId
    );
  } else {
    const nextSigner = signersData[nextStep];
    const nextUser = await prisma.user.findUnique({
      where: { id: nextSigner.userId }
    });

    if (nextUser) {
      await notificationService.sendEmail({
        to: nextUser.email,
        subject: `Tu turno para firmar: ${flow.name}`,
        body: `Hola ${nextUser.firstName}, es tu turno para firmar el documento en el flujo "${flow.name}".`
      });

      await notificationsService.createFlowAdvanceNotification(
        nextUser.id,
        flowId,
        flow.name,
        flow.document.fileName,
        flow.documentId
      );
    }
  }

  // Map 'creator' to 'createdBy' to match frontend expectations
  return {
    ...updatedFlow,
    createdBy: (updatedFlow as any).creator
  };
};

export default {
  createSignatureFlow,
  getSignatureFlowById,
  getAllSignatureFlows,
  advanceSignatureFlow,
  advanceSignatureFlowFromComponent,
  cancelSignatureFlow,
  getPendingSignatureFlows
};
