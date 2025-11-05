import prisma from '../config/database';

interface TimelineEvent {
  id: string;
  type: string;
  action: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: Date;
  metadata?: any;
}

interface PaginatedTimeline {
  events: TimelineEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const getArchivadorTimeline = async (
  archivadorId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTimeline> => {
  const archivador = await prisma.archivador.findUnique({
    where: { id: archivadorId }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  const skip = (page - 1) * limit;

  const auditLogs = await prisma.auditLog.findMany({
    where: {
      OR: [
        {
          entityType: 'Archivador',
          entityId: archivadorId
        },
        {
          entityType: 'Document',
          action: {
            in: ['DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED']
          },
          newValue: {
            path: ['archivadorId'] as any,
            equals: archivadorId
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  const totalCount = await prisma.auditLog.count({
    where: {
      OR: [
        {
          entityType: 'Archivador',
          entityId: archivadorId
        },
        {
          entityType: 'Document',
          action: {
            in: ['DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED']
          },
          newValue: {
            path: ['archivadorId'] as any,
            equals: archivadorId
          }
        }
      ]
    }
  });

  const events: TimelineEvent[] = auditLogs.map(log => {
    const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Usuario desconocido';
    
    let description = '';
    const metadata: any = {};

    switch (log.action) {
      case 'ARCHIVADOR_CREATED':
        description = `Creó el archivador`;
        metadata.code = (log.newValue as any)?.code;
        metadata.name = (log.newValue as any)?.name;
        break;
      case 'ARCHIVADOR_UPDATED':
        description = `Actualizó el archivador`;
        metadata.oldName = (log.oldValue as any)?.name;
        metadata.newName = (log.newValue as any)?.name;
        break;
      case 'ARCHIVADOR_DELETED':
        description = `Eliminó el archivador`;
        break;
      case 'DOCUMENT_CREATED':
        description = `Agregó un documento al archivador`;
        metadata.documentNumber = (log.newValue as any)?.documentNumber;
        break;
      case 'DOCUMENT_UPDATED':
        description = `Actualizó un documento del archivador`;
        break;
      case 'DOCUMENT_DELETED':
        description = `Eliminó un documento del archivador`;
        break;
      default:
        description = log.action.replace(/_/g, ' ').toLowerCase();
    }

    return {
      id: log.id,
      type: log.entityType,
      action: log.action,
      description,
      userId: log.userId,
      userName,
      timestamp: log.createdAt,
      metadata
    };
  });

  return {
    events,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export const getDocumentTimeline = async (
  documentId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTimeline> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const skip = (page - 1) * limit;

  const [auditLogs, versions, signatures] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        entityType: 'Document',
        entityId: documentId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    }),
    prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    }),
    prisma.signature.findMany({
      where: { documentId },
      include: {
        signer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        },
        revertedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    })
  ]);

  const allEvents: TimelineEvent[] = [];

  auditLogs.forEach(log => {
    const userName = `${log.user.firstName} ${log.user.lastName}`;
    
    let description = '';
    const metadata: any = {};

    switch (log.action) {
      case 'DOCUMENT_CREATED':
        description = `Creó el documento`;
        metadata.documentNumber = (log.newValue as any)?.documentNumber;
        break;
      case 'DOCUMENT_UPDATED':
        description = `Actualizó el documento`;
        break;
      case 'DOCUMENT_DELETED':
        description = `Eliminó el documento`;
        break;
      default:
        description = log.action.replace(/_/g, ' ').toLowerCase();
    }

    allEvents.push({
      id: log.id,
      type: 'audit',
      action: log.action,
      description,
      userId: log.userId,
      userName,
      timestamp: log.createdAt,
      metadata
    });
  });

  versions.forEach(version => {
    const userName = `${version.creator.firstName} ${version.creator.lastName}`;
    
    allEvents.push({
      id: version.id,
      type: 'version',
      action: 'VERSION_CREATED',
      description: `Creó la versión ${version.versionNumber}`,
      userId: version.createdBy,
      userName,
      timestamp: version.createdAt,
      metadata: {
        versionNumber: version.versionNumber,
        changeDescription: version.changeDescription
      }
    });
  });

  signatures.forEach(signature => {
    const userName = `${signature.signer.firstName} ${signature.signer.lastName}`;
    
    if (signature.isReverted && signature.revertedBy && signature.revertedByUser) {
      allEvents.push({
        id: `${signature.id}-reverted`,
        type: 'signature',
        action: 'SIGNATURE_REVERTED',
        description: `La firma fue revertida`,
        userId: signature.revertedBy,
        userName: `${signature.revertedByUser.firstName} ${signature.revertedByUser.lastName}`,
        timestamp: signature.revertedAt!,
        metadata: {
          signatureId: signature.id,
          revertReason: signature.revertReason,
          originalSigner: userName
        }
      });
    } else {
      allEvents.push({
        id: signature.id,
        type: 'signature',
        action: 'SIGNATURE_ADDED',
        description: `Firmó el documento`,
        userId: signature.signerId,
        userName,
        timestamp: signature.timestamp,
        metadata: {
          status: signature.status,
          isValid: signature.isValid
        }
      });
    }
  });

  allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const paginatedEvents = allEvents.slice(skip, skip + limit);

  return {
    events: paginatedEvents,
    pagination: {
      page,
      limit,
      total: allEvents.length,
      pages: Math.ceil(allEvents.length / limit)
    }
  };
};

export const getExpedienteTimeline = async (
  expedienteId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTimeline> => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const skip = (page - 1) * limit;

  const [auditLogs, documents] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        OR: [
          {
            entityType: 'Expediente',
            entityId: expedienteId
          },
          {
            entityType: 'Document',
            action: {
              in: ['DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED']
            },
            newValue: {
              path: ['expedienteId'] as any,
              equals: expedienteId
            }
          }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    }),
    prisma.document.findMany({
      where: { expedienteId },
      select: {
        id: true,
        documentNumber: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      }
    })
  ]);

  const allEvents: TimelineEvent[] = [];

  auditLogs.forEach(log => {
    const userName = log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Usuario desconocido';
    
    let description = '';
    const metadata: any = {};

    switch (log.action) {
      case 'EXPEDIENTE_CREATED':
        description = `Creó el expediente`;
        metadata.code = (log.newValue as any)?.code;
        metadata.name = (log.newValue as any)?.name;
        break;
      case 'EXPEDIENTE_UPDATED':
        description = `Actualizó el expediente`;
        break;
      case 'EXPEDIENTE_DELETED':
        description = `Eliminó el expediente`;
        break;
      case 'DOCUMENT_CREATED':
        description = `Agregó un documento al expediente`;
        metadata.documentNumber = (log.newValue as any)?.documentNumber;
        break;
      case 'DOCUMENT_UPDATED':
        description = `Actualizó un documento del expediente`;
        break;
      case 'DOCUMENT_DELETED':
        description = `Eliminó un documento del expediente`;
        break;
      default:
        description = log.action.replace(/_/g, ' ').toLowerCase();
    }

    allEvents.push({
      id: log.id,
      type: 'audit',
      action: log.action,
      description,
      userId: log.userId,
      userName,
      timestamp: log.createdAt,
      metadata
    });
  });

  documents.forEach(doc => {
    const userName = `${doc.creator.firstName} ${doc.creator.lastName}`;
    
    allEvents.push({
      id: `doc-${doc.id}`,
      type: 'document',
      action: 'DOCUMENT_ADDED',
      description: `Agregó el documento ${doc.documentNumber}`,
      userId: doc.creator.id,
      userName,
      timestamp: doc.createdAt,
      metadata: {
        documentId: doc.id,
        documentNumber: doc.documentNumber
      }
    });
  });

  allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const paginatedEvents = allEvents.slice(skip, skip + limit);

  return {
    events: paginatedEvents,
    pagination: {
      page,
      limit,
      total: allEvents.length,
      pages: Math.ceil(allEvents.length / limit)
    }
  };
};

export const getUserTimeline = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedTimeline> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const skip = (page - 1) * limit;

  const auditLogs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true
        }
      }
    }
  });

  const totalCount = await prisma.auditLog.count({
    where: { userId }
  });

  const events: TimelineEvent[] = auditLogs.map(log => {
    const userName = `${log.user.firstName} ${log.user.lastName}`;
    
    return {
      id: log.id,
      type: log.entityType,
      action: log.action,
      description: log.action.replace(/_/g, ' ').toLowerCase(),
      userId: log.userId,
      userName,
      timestamp: log.createdAt,
      metadata: {
        module: log.module,
        entityId: log.entityId
      }
    };
  });

  return {
    events,
    pagination: {
      page,
      limit,
      total: totalCount,
      pages: Math.ceil(totalCount / limit)
    }
  };
};

export default {
  getArchivadorTimeline,
  getDocumentTimeline,
  getExpedienteTimeline,
  getUserTimeline
};
