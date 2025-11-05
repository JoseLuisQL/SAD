import { Request } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import prisma from '../config/database';
import { log } from './audit.service';
import * as storageService from './storage.service';

const versionsDir = path.join(process.cwd(), 'uploads', 'versions');

if (!fs.existsSync(versionsDir)) {
  fs.mkdirSync(versionsDir, { recursive: true });
}

export const createVersion = async (
  documentId: string,
  filePath: string,
  description: string,
  userId: string,
  req: Request
) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: { versions: true }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  if (!storageService.fileExists(filePath)) {
    throw new Error('El archivo no existe');
  }

  const nextVersion = document.currentVersion + 1;
  
  const versionFileName = `${documentId}-v${nextVersion}-${Date.now()}.pdf`;
  const versionPath = path.join(versionsDir, versionFileName);

  fs.copyFileSync(filePath, versionPath);

  const version = await prisma.documentVersion.create({
    data: {
      documentId,
      versionNumber: nextVersion,
      filePath: versionPath,
      fileName: versionFileName,
      changeDescription: description,
      createdBy: userId
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await prisma.document.update({
    where: { id: documentId },
    data: { currentVersion: nextVersion }
  });

  await log({
    userId,
    action: 'VERSION_CREATED',
    module: 'versions',
    entityType: 'DocumentVersion',
    entityId: version.id,
    newValue: {
      documentId,
      versionNumber: nextVersion,
      description
    },
    req
  });

  return version;
};

export const getAllVersions = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      signatures: {
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
          }
        }
      }
    },
    orderBy: { versionNumber: 'desc' }
  });

  const versionsWithMetadata = versions.map(version => {
    const fileSize = storageService.fileExists(version.filePath) 
      ? fs.statSync(version.filePath).size 
      : 0;
    
    const activeSignatures = version.signatures.filter(sig => !sig.isReverted);
    const revertedSignatures = version.signatures.filter(sig => sig.isReverted);

    return {
      ...version,
      fileSize,
      hasSignatures: version.signatures.length > 0,
      activeSignaturesCount: activeSignatures.length,
      revertedSignaturesCount: revertedSignatures.length,
      isCurrent: version.versionNumber === document.currentVersion
    };
  });

  // Agregar versión actual del documento si no está en las versiones guardadas
  const currentVersionExists = versionsWithMetadata.some(v => v.versionNumber === document.currentVersion);
  
  if (!currentVersionExists) {
    const currentFileSize = storageService.fileExists(document.filePath)
      ? fs.statSync(document.filePath).size
      : 0;

    // Obtener firmas de la versión actual
    const currentSignatures = await prisma.signature.findMany({
      where: {
        documentId: documentId,
        isReverted: false,
        // Firmas que no están asociadas a una versión específica o son de versiones guardadas
        OR: [
          { documentVersionId: null },
          { 
            documentVersionId: {
              notIn: versionsWithMetadata.map(v => v.id)
            }
          }
        ]
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
        }
      }
    });

    const activeCurrentSignatures = currentSignatures.filter(sig => !sig.isReverted);

    // Determinar descripción basada en si hay firmas
    let changeDescription = 'Versión original';
    if (document.currentVersion === 1) {
      changeDescription = 'Versión original';
    } else if (document.signatureStatus === 'SIGNED') {
      changeDescription = 'Documento firmado digitalmente';
    } else {
      changeDescription = `Versión ${document.currentVersion}`;
    }

    const currentVersion = {
      id: `current-${documentId}`,
      documentId: document.id,
      versionNumber: document.currentVersion,
      filePath: document.filePath,
      fileName: document.fileName,
      changeDescription: changeDescription,
      createdAt: document.updatedAt, // Usar updatedAt para la versión actual
      creator: document.creator,
      createdBy: document.createdBy,
      signatures: currentSignatures,
      fileSize: currentFileSize,
      hasSignatures: currentSignatures.length > 0,
      activeSignaturesCount: activeCurrentSignatures.length,
      revertedSignaturesCount: currentSignatures.length - activeCurrentSignatures.length,
      isCurrent: true
    };

    versionsWithMetadata.push(currentVersion);
  }

  // Ordenar por versión descendente
  versionsWithMetadata.sort((a, b) => b.versionNumber - a.versionNumber);

  // NOTA: Ya no necesitamos la lógica de versión virtual para v1 
  // porque ahora siempre agregamos la versión actual si no existe
  const shouldCreateVirtualVersion = false;

  if (shouldCreateVirtualVersion) {
    const currentFileSize = storageService.fileExists(document.filePath)
      ? fs.statSync(document.filePath).size
      : 0;

    // Obtener firmas activas del documento actual
    const currentSignatures = await prisma.signature.findMany({
      where: {
        documentId: documentId,
        documentVersionId: null // Firmas sin versión específica o de la versión actual
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
        }
      }
    });

    const activeCurrentSignatures = currentSignatures.filter(sig => !sig.isReverted);

    const currentVersion = {
      id: `current-${documentId}`,
      documentId: document.id,
      versionNumber: 1,
      filePath: document.filePath,
      fileName: document.fileName,
      changeDescription: 'Versión original',
      createdAt: document.createdAt,
      creator: document.creator,
      createdBy: document.createdBy,
      signatures: currentSignatures,
      fileSize: currentFileSize,
      hasSignatures: currentSignatures.length > 0,
      activeSignaturesCount: activeCurrentSignatures.length,
      revertedSignaturesCount: currentSignatures.length - activeCurrentSignatures.length,
      isCurrent: true
    };

    versionsWithMetadata.push(currentVersion);
    versionsWithMetadata.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  return versionsWithMetadata;
};

export const getVersions = getAllVersions;

export const getVersionById = async (versionId: string) => {
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!version) {
    throw new Error('Versión no encontrada');
  }

  return version;
};

export const restoreVersion = async (
  documentId: string,
  versionId: string,
  userId: string,
  req: Request
) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      signatures: {
        where: { isReverted: false }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      signatures: true
    }
  });

  if (!version) {
    throw new Error('Versión no encontrada');
  }

  if (version.documentId !== documentId) {
    throw new Error('La versión no pertenece a este documento');
  }

  if (!storageService.fileExists(version.filePath)) {
    throw new Error('El archivo de la versión no existe');
  }

  const restoredFileName = storageService.generateUniqueName(document.fileName);
  const restoredPath = path.join(process.cwd(), 'uploads', 'documents', restoredFileName);

  fs.copyFileSync(version.filePath, restoredPath);

  // Si el documento tiene firmas activas y la versión restaurada no las tiene,
  // revertir las firmas actuales
  if (document.signatures.length > 0 && version.signatures.length === 0) {
    const now = new Date();
    
    // Revertir todas las firmas activas
    await prisma.signature.updateMany({
      where: {
        documentId: documentId,
        isReverted: false
      },
      data: {
        isReverted: true,
        revertedAt: now,
        revertedBy: userId,
        revertReason: `Reversión a versión ${version.versionNumber} sin firmas`
      }
    });

    // Log de la reversión de firmas
    await log({
      userId,
      action: 'SIGNATURES_REVERTED',
      module: 'versions',
      entityType: 'Document',
      entityId: documentId,
      oldValue: {
        signatureStatus: document.signatureStatus,
        activeSignaturesCount: document.signatures.length
      },
      newValue: {
        signatureStatus: 'REVERTED',
        revertedSignaturesCount: document.signatures.length,
        reason: `Reversión a versión ${version.versionNumber}`
      },
      req
    });
  }

  const newVersion = await createVersion(
    documentId,
    restoredPath,
    `Restauración desde versión ${version.versionNumber}`,
    userId,
    req
  );

  // Determinar el nuevo estado de firma basado en la versión restaurada
  let newSignatureStatus: string = 'UNSIGNED';
  
  if (version.signatures.length > 0) {
    const activeVersionSignatures = version.signatures.filter(sig => !sig.isReverted);
    if (activeVersionSignatures.length > 0) {
      newSignatureStatus = 'SIGNED';
    } else if (version.signatures.some(sig => sig.isReverted)) {
      newSignatureStatus = 'REVERTED';
    }
  } else if (document.signatures.length > 0) {
    // Si tenía firmas pero se revirtieron
    newSignatureStatus = 'REVERTED';
  }

  // Actualizar el documento con el nuevo archivo y estado
  await prisma.document.update({
    where: { id: documentId },
    data: {
      filePath: restoredPath,
      fileName: restoredFileName,
      signatureStatus: newSignatureStatus,
      currentVersion: newVersion.versionNumber
    }
  });

  await log({
    userId,
    action: 'VERSION_RESTORED',
    module: 'versions',
    entityType: 'Document',
    entityId: documentId,
    oldValue: {
      currentVersion: document.currentVersion,
      signatureStatus: document.signatureStatus
    },
    newValue: {
      currentVersion: newVersion.versionNumber,
      restoredFrom: version.versionNumber,
      signatureStatus: newSignatureStatus
    },
    req
  });

  return newVersion;
};

export const downloadVersion = async (versionId: string, req: Request) => {
  // Si es una versión "current-{documentId}", obtener del documento actual
  if (versionId.startsWith('current-')) {
    const documentId = versionId.replace('current-', '');
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    if (!storageService.fileExists(document.filePath)) {
      throw new Error('El archivo del documento no existe');
    }

    await log({
      userId: req.user!.id,
      action: 'VERSION_DOWNLOADED',
      module: 'versions',
      entityType: 'Document',
      entityId: documentId,
      newValue: {
        documentId: document.id,
        versionNumber: 1,
        description: 'Versión original'
      },
      req
    });

    return {
      filePath: document.filePath,
      fileName: document.fileName,
      mimeType: 'application/pdf',
      fileStream: storageService.getFileStream(document.filePath)
    };
  }

  // Versión normal de la base de datos
  const version = await prisma.documentVersion.findUnique({
    where: { id: versionId },
    include: {
      document: true
    }
  });

  if (!version) {
    throw new Error('Versión no encontrada');
  }

  if (!storageService.fileExists(version.filePath)) {
    throw new Error('El archivo de la versión no existe');
  }

  await log({
    userId: req.user!.id,
    action: 'VERSION_DOWNLOADED',
    module: 'versions',
    entityType: 'DocumentVersion',
    entityId: versionId,
    newValue: {
      documentId: version.documentId,
      versionNumber: version.versionNumber
    },
    req
  });

  return {
    filePath: version.filePath,
    fileName: version.fileName,
    mimeType: 'application/pdf',
    fileStream: storageService.getFileStream(version.filePath)
  };
};

export const compareVersions = async (versionId1: string, versionId2: string) => {
  // Función auxiliar para obtener datos de versión
  const getVersionData = async (versionId: string) => {
    // Si es una versión "current-{documentId}", obtener del documento actual
    if (versionId.startsWith('current-')) {
      const documentId = versionId.replace('current-', '');
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (!document) {
        throw new Error('Documento no encontrado');
      }

      // Obtener firmas activas del documento
      const signatures = await prisma.signature.findMany({
        where: {
          documentId: documentId,
          isReverted: false,
          documentVersionId: null
        },
        include: {
          signer: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Determinar descripción basada en el estado
      let changeDescription = 'Versión original';
      if (document.currentVersion === 1) {
        changeDescription = 'Versión original';
      } else if (document.signatureStatus === 'SIGNED') {
        changeDescription = 'Documento firmado digitalmente';
      } else {
        changeDescription = `Versión ${document.currentVersion}`;
      }

      return {
        id: versionId,
        documentId: document.id,
        versionNumber: document.currentVersion, // Usar versión actual del documento
        filePath: document.filePath,
        fileName: document.fileName,
        changeDescription: changeDescription, // Descripción dinámica
        createdAt: document.updatedAt, // Usar updatedAt para versión actual
        createdBy: document.createdBy,
        creator: document.creator,
        signatures: signatures
      };
    }

    // Versión normal de la base de datos
    return await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        signatures: {
          include: {
            signer: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true
              }
            }
          },
          where: {
            isReverted: false
          }
        }
      }
    });
  };

  const version1 = await getVersionData(versionId1);
  const version2 = await getVersionData(versionId2);

  if (!version1 || !version2) {
    throw new Error('Una o ambas versiones no fueron encontradas');
  }

  if (version1.documentId !== version2.documentId) {
    throw new Error('Las versiones pertenecen a documentos diferentes');
  }

  const file1Size = storageService.fileExists(version1.filePath) 
    ? fs.statSync(version1.filePath).size 
    : 0;
  const file2Size = storageService.fileExists(version2.filePath) 
    ? fs.statSync(version2.filePath).size 
    : 0;

  return {
    version1: {
      ...version1,
      fileSize: file1Size
    },
    version2: {
      ...version2,
      fileSize: file2Size
    },
    differences: {
      versionNumber: version2.versionNumber - version1.versionNumber,
      sizeChange: file2Size - file1Size,
      timeElapsed: version2.createdAt.getTime() - version1.createdAt.getTime(),
      signaturesAdded: version2.signatures.length - version1.signatures.length,
      creatorChanged: version1.createdBy !== version2.createdBy
    }
  };
};

export const getLatestUnsignedVersion = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const versions = await prisma.documentVersion.findMany({
    where: { documentId },
    include: {
      signatures: {
        where: {
          isReverted: false
        }
      }
    },
    orderBy: { versionNumber: 'desc' }
  });

  const unsignedVersion = versions.find(v => v.signatures.length === 0);

  return unsignedVersion || null;
};

export default {
  createVersion,
  getVersions,
  getAllVersions,
  getVersionById,
  compareVersions,
  getLatestUnsignedVersion,
  restoreVersion,
  downloadVersion
};
