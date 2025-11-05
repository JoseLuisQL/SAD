import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';
import * as versionsService from './versions.service';
// import * as notificationsService from './notifications.service';

interface RevertOptions {
  notifySigners?: boolean;
}

interface ReversionSummary {
  documentId: string;
  revertedSignaturesCount: number;
  affectedUsers: string[];
  revertedAt: Date;
  revertedBy: string;
  reason: string;
}

export const revertDocumentSignatures = async (
  documentId: string,
  userId: string,
  reason: string,
  req: Request,
  options: RevertOptions = {}
): Promise<ReversionSummary> => {
  const { notifySigners = true } = options;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true
    }
  });

  if (!user || user.role.name !== 'Administrador') {
    throw new Error('Solo los administradores pueden revertir firmas');
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      signatures: {
        where: {
          isReverted: false
        },
        include: {
          signer: true
        }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  if (document.signatures.length === 0) {
    throw new Error('El documento no tiene firmas activas para revertir');
  }

  const now = new Date();
  const affectedUsers: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const signature of document.signatures) {
      await tx.signature.update({
        where: { id: signature.id },
        data: {
          isReverted: true,
          revertedAt: now,
          revertedBy: userId,
          revertReason: reason
        }
      });

      affectedUsers.push(signature.signerId);

      if (notifySigners && signature.signer.email) {
        console.log(`📧 Notificación de reversión enviada a: ${signature.signer.email}`);
        console.log(`   Documento: ${document.documentNumber}`);
        console.log(`   Razón: ${reason}`);
      }
    }

    await tx.document.update({
      where: { id: documentId },
      data: {
        signatureStatus: 'REVERTED',
        lastSignedAt: null,
        signedBy: null
      }
    });
  });

  await log({
    userId,
    action: 'SIGNATURES_REVERTED',
    module: 'signatures',
    entityType: 'Document',
    entityId: documentId,
    oldValue: {
      signatureStatus: document.signatureStatus,
      activeSignatures: document.signatures.length
    },
    newValue: {
      signatureStatus: 'REVERTED',
      revertedSignatures: document.signatures.length,
      reason,
      affectedUsers
    },
    req
  });

  // if (notifySigners && affectedUsers.length > 0) {
  //   await notificationsService.createSignatureRevertedNotification(
  //     affectedUsers,
  //     documentId,
  //     document.fileName,
  //     reason
  //   );
  // }

  return {
    documentId,
    revertedSignaturesCount: document.signatures.length,
    affectedUsers,
    revertedAt: now,
    revertedBy: userId,
    reason
  };
};

export const revertToVersion = async (
  documentId: string,
  versionId: string,
  userId: string,
  reason: string,
  req: Request
): Promise<{
  reversionSummary: ReversionSummary | null;
  restoredVersion: any;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true
    }
  });

  if (!user || user.role.name !== 'Administrador') {
    throw new Error('Solo los administradores pueden revertir a versiones anteriores');
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      signatures: {
        where: {
          isReverted: false
        }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const version = await versionsService.getVersionById(versionId);

  if (version.documentId !== documentId) {
    throw new Error('La versión no pertenece a este documento');
  }

  let reversionSummary: ReversionSummary | null = null;

  if (document.signatures.length > 0) {
    reversionSummary = await revertDocumentSignatures(
      documentId,
      userId,
      `Reversión a versión ${version.versionNumber}: ${reason}`,
      req,
      { notifySigners: true }
    );
  }

  const restoredVersion = await versionsService.restoreVersion(
    documentId,
    versionId,
    userId,
    req
  );

  await log({
    userId,
    action: 'REVERTED_TO_VERSION',
    module: 'versions',
    entityType: 'Document',
    entityId: documentId,
    oldValue: {
      currentVersion: document.currentVersion,
      signatureStatus: document.signatureStatus
    },
    newValue: {
      restoredVersion: version.versionNumber,
      newVersion: restoredVersion.versionNumber,
      reason
    },
    req
  });

  return {
    reversionSummary,
    restoredVersion
  };
};

export const getReversionHistory = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const revertedSignatures = await prisma.signature.findMany({
    where: {
      documentId,
      isReverted: true
    },
    include: {
      signer: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      revertedByUser: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      version: {
        select: {
          id: true,
          versionNumber: true
        }
      }
    },
    orderBy: {
      revertedAt: 'desc'
    }
  });

  const groupedByReversion = revertedSignatures.reduce((acc, sig) => {
    const key = `${sig.revertedAt?.toISOString()}_${sig.revertedBy}`;
    if (!acc[key]) {
      acc[key] = {
        revertedAt: sig.revertedAt,
        revertedBy: sig.revertedByUser,
        reason: sig.revertReason,
        signatures: []
      };
    }
    acc[key].signatures.push(sig);
    return acc;
  }, {} as Record<string, any>);

  return Object.values(groupedByReversion);
};

export const canRevert = async (documentId: string, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: true
    }
  });

  if (!user) {
    return {
      canRevert: false,
      reason: 'Usuario no encontrado'
    };
  }

  if (user.role.name !== 'Administrador') {
    return {
      canRevert: false,
      reason: 'Solo los administradores pueden revertir firmas'
    };
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      signatures: {
        where: {
          isReverted: false
        }
      }
    }
  });

  if (!document) {
    return {
      canRevert: false,
      reason: 'Documento no encontrado'
    };
  }

  if (document.signatures.length === 0) {
    return {
      canRevert: false,
      reason: 'El documento no tiene firmas activas'
    };
  }

  return {
    canRevert: true,
    activeSignatures: document.signatures.length,
    documentStatus: document.signatureStatus
  };
};

export default {
  revertDocumentSignatures,
  revertToVersion,
  getReversionHistory,
  canRevert
};
