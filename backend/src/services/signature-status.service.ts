import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { log } from './audit.service';

const prisma = new PrismaClient();

export type SignatureStatus = 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';

interface SignerInfo {
  id: string;
  name: string;
  email: string;
  signedAt: Date;
  status: string;
  isReverted: boolean;
}

interface ActiveFlow {
  id: string;
  name: string;
  currentStep: number;
  totalSteps: number;
  status: string;
  nextSigner?: string;
}

interface DocumentSignatureStatus {
  documentId: string;
  status: SignatureStatus;
  totalSignatures: number;
  activeSignatures: number;
  revertedSignatures: number;
  activeFlows: ActiveFlow[];
  lastSignedAt: Date | null;
  lastSignedBy: string | null;
  signersInfo: SignerInfo[];
  hasActiveFlows: boolean;
}

interface SignatureMetadata {
  signatureId: string;
  signer: {
    id: string;
    name: string;
    email: string;
  };
  timestamp: Date;
  status: string;
  isValid: boolean;
  signatureData: {
    signer: string;
    date: string;
    format: string;
    signatureAlgorithm: string;
    serial: string;
    subjectDN: string;
    issuerDN: string;
  };
  certificateData: {
    notBeFore: string;
    notAfter: string;
    rootInTsl: boolean;
    chain: string[];
  };
  trustChain: {
    isValid: boolean;
    rootInTsl: boolean;
    chainLength: number;
  };
  validations: {
    indications: string[];
    warnings: string[];
    errors: string[];
    notes: string[];
  };
  isReverted: boolean;
  revertedAt: Date | null;
  revertedBy: string | null;
  revertReason: string | null;
}

interface BatchSignatureStatus {
  documentId: string;
  status: SignatureStatus;
  totalSignatures: number;
  lastSignedAt: Date | null;
}

interface SignatureStatistics {
  totalDocuments: number;
  totalDocumentsSigned: number;
  totalDocumentsUnsigned: number;
  totalDocumentsInFlow: number;
  totalDocumentsReverted: number;
  totalSignatures: number;
  totalActiveSignatures: number;
  totalRevertedSignatures: number;
  totalActiveFlows: number;
  signaturesByUser: Array<{
    userId: string;
    userName: string;
    count: number;
  }>;
  signaturesTrend: Array<{
    date: string;
    count: number;
  }>;
  statusDistribution: {
    unsigned: number;
    signed: number;
    partialSigned: number;
    reverted: number;
    inFlow: number;
  };
}

export const getDocumentSignatureStatus = async (
  documentId: string
): Promise<DocumentSignatureStatus> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      signatures: {
        include: {
          signer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      },
      signatureFlows: {
        where: {
          status: {
            in: ['PENDING', 'IN_PROGRESS']
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const totalSignatures = document.signatures.length;
  const activeSignatures = document.signatures.filter(s => !s.isReverted).length;
  const revertedSignatures = document.signatures.filter(s => s.isReverted).length;
  const hasActiveFlows = document.signatureFlows.length > 0;

  const signersInfo: SignerInfo[] = document.signatures.map(sig => ({
    id: sig.signer.id,
    name: `${sig.signer.firstName} ${sig.signer.lastName}`,
    email: sig.signer.email,
    signedAt: sig.timestamp,
    status: sig.status,
    isReverted: sig.isReverted
  }));

  const activeFlows: ActiveFlow[] = document.signatureFlows.map(flow => {
    const signers = flow.signers as any[];
    const totalSteps = signers.length;
    const nextSigner = signers[flow.currentStep]?.name;

    return {
      id: flow.id,
      name: flow.name,
      currentStep: flow.currentStep,
      totalSteps,
      status: flow.status,
      nextSigner
    };
  });

  let status: SignatureStatus = 'UNSIGNED';
  
  if (hasActiveFlows) {
    status = 'IN_FLOW';
  } else if (revertedSignatures > 0 && activeSignatures === 0) {
    status = 'REVERTED';
  } else if (activeSignatures > 0) {
    if (hasActiveFlows && activeSignatures < activeFlows[0]?.totalSteps) {
      status = 'PARTIALLY_SIGNED';
    } else {
      status = 'SIGNED';
    }
  }

  const lastSignature = document.signatures.find(s => !s.isReverted);
  const lastSigner = lastSignature 
    ? `${lastSignature.signer.firstName} ${lastSignature.signer.lastName}`
    : null;

  return {
    documentId: document.id,
    status,
    totalSignatures,
    activeSignatures,
    revertedSignatures,
    activeFlows,
    lastSignedAt: lastSignature?.timestamp || null,
    lastSignedBy: lastSigner,
    signersInfo,
    hasActiveFlows
  };
};

export const updateDocumentSignatureStatus = async (
  documentId: string,
  req?: Request
): Promise<DocumentSignatureStatus> => {
  const statusInfo = await getDocumentSignatureStatus(documentId);

  await prisma.document.update({
    where: { id: documentId },
    data: {
      signatureStatus: statusInfo.status,
      lastSignedAt: statusInfo.lastSignedAt,
      signedBy: statusInfo.lastSignedBy
    }
  });

  if (req) {
    await log({
      userId: req.user?.id || 'system',
      action: 'DOCUMENT_UPDATED',
      module: 'signatures',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        status: statusInfo.status,
        totalSignatures: statusInfo.totalSignatures,
        activeSignatures: statusInfo.activeSignatures
      },
      req
    });
  }

  return statusInfo;
};

export const getSignatureMetadata = async (
  signatureId: string
): Promise<SignatureMetadata> => {
  const signature = await prisma.signature.findUnique({
    where: { id: signatureId },
    include: {
      signer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      revertedByUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!signature) {
    throw new Error('Signature not found');
  }

  const signatureData = signature.signatureData as any;
  const certificateData = signature.certificateData as any;

  const metadata: SignatureMetadata = {
    signatureId: signature.id,
    signer: {
      id: signature.signer.id,
      name: `${signature.signer.firstName} ${signature.signer.lastName}`,
      email: signature.signer.email
    },
    timestamp: signature.timestamp,
    status: signature.status,
    isValid: signature.isValid,
    signatureData: {
      signer: signatureData.signer || '',
      date: signatureData.date || '',
      format: signatureData.format || '',
      signatureAlgorithm: signatureData.signatureAlgorithm || '',
      serial: signatureData.serial || '',
      subjectDN: signatureData.subjectDN || '',
      issuerDN: signatureData.issuerDN || ''
    },
    certificateData: {
      notBeFore: certificateData.notBeFore || '',
      notAfter: certificateData.notAfter || '',
      rootInTsl: certificateData.rootInTsl || false,
      chain: certificateData.chain || []
    },
    trustChain: {
      isValid: certificateData.rootInTsl || false,
      rootInTsl: certificateData.rootInTsl || false,
      chainLength: (certificateData.chain || []).length
    },
    validations: {
      indications: signatureData.indications || [],
      warnings: signatureData.warnings || [],
      errors: signatureData.errors || [],
      notes: signatureData.notes || []
    },
    isReverted: signature.isReverted,
    revertedAt: signature.revertedAt,
    revertedBy: signature.revertedByUser 
      ? `${signature.revertedByUser.firstName} ${signature.revertedByUser.lastName}`
      : null,
    revertReason: signature.revertReason
  };

  return metadata;
};

export const getBatchSignatureStatus = async (
  documentIds: string[]
): Promise<BatchSignatureStatus[]> => {
  const documents = await prisma.document.findMany({
    where: {
      id: {
        in: documentIds
      }
    },
    select: {
      id: true,
      signatureStatus: true,
      lastSignedAt: true,
      signatures: {
        select: {
          id: true
        }
      }
    }
  });

  return documents.map(doc => ({
    documentId: doc.id,
    status: doc.signatureStatus as SignatureStatus,
    totalSignatures: doc.signatures.length,
    lastSignedAt: doc.lastSignedAt
  }));
};

export const getSignatureStatistics = async (): Promise<SignatureStatistics> => {
  const [
    totalDocuments,
    totalDocumentsSigned,
    totalDocumentsUnsigned,
    totalDocumentsInFlow,
    totalDocumentsReverted,
    allSignatures,
    activeFlows,
    signaturesByUser,
    recentSignatures
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({ where: { signatureStatus: 'SIGNED' } }),
    prisma.document.count({ where: { signatureStatus: 'UNSIGNED' } }),
    prisma.document.count({ where: { signatureStatus: 'IN_FLOW' } }),
    prisma.document.count({ where: { signatureStatus: 'REVERTED' } }),
    prisma.signature.findMany(),
    prisma.signatureFlow.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
    prisma.signature.groupBy({
      by: ['signerId'],
      where: { isReverted: false },
      _count: { id: true }
    }),
    prisma.signature.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        timestamp: true
      }
    })
  ]);

  const totalSignatures = allSignatures.length;
  const totalActiveSignatures = allSignatures.filter(s => !s.isReverted).length;
  const totalRevertedSignatures = allSignatures.filter(s => s.isReverted).length;

  const userIds = signaturesByUser.map(s => s.signerId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true }
  });

  const signaturesByUserWithNames = signaturesByUser.map(sig => {
    const user = users.find(u => u.id === sig.signerId);
    return {
      userId: sig.signerId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      count: sig._count.id
    };
  });

  const signaturesTrendMap = new Map<string, number>();
  recentSignatures.forEach(sig => {
    const dateKey = sig.timestamp.toISOString().split('T')[0];
    signaturesTrendMap.set(dateKey, (signaturesTrendMap.get(dateKey) || 0) + 1);
  });

  const signaturesTrend = Array.from(signaturesTrendMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const partialSignedCount = await prisma.document.count({
    where: { signatureStatus: 'PARTIALLY_SIGNED' }
  });

  return {
    totalDocuments,
    totalDocumentsSigned,
    totalDocumentsUnsigned,
    totalDocumentsInFlow,
    totalDocumentsReverted,
    totalSignatures,
    totalActiveSignatures,
    totalRevertedSignatures,
    totalActiveFlows: activeFlows,
    signaturesByUser: signaturesByUserWithNames.sort((a, b) => b.count - a.count),
    signaturesTrend,
    statusDistribution: {
      unsigned: totalDocumentsUnsigned,
      signed: totalDocumentsSigned,
      partialSigned: partialSignedCount,
      reverted: totalDocumentsReverted,
      inFlow: totalDocumentsInFlow
    }
  };
};

export default {
  getDocumentSignatureStatus,
  updateDocumentSignatureStatus,
  getSignatureMetadata,
  getBatchSignatureStatus,
  getSignatureStatistics
};
