import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';
import * as storageService from './storage.service';
import { queueService } from './queue.service';
import * as fs from 'fs';
import * as path from 'path';

interface DocumentMetadata {
  archivadorId: string;
  documentTypeId: string;
  officeId: string;
  documentNumber: string;
  documentDate: Date;
  sender: string;
  folioCount: number;
  annotations?: string;
}

interface DocumentFilters {
  archivadorId?: string;
  documentTypeId?: string;
  officeId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  signatureStatus?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

interface BatchDocumentMetadata {
  documentTypeId?: string;
  officeId?: string;
  documentNumber: string;
  documentDate: Date;
  sender: string;
  folioCount: number;
  annotations?: string;
}

export const createDocument = async (
  file: Express.Multer.File,
  metadata: DocumentMetadata,
  req: Request
) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id: metadata.archivadorId }
  });

  if (!archivador) {
    await storageService.deleteFile(file.path);
    throw new Error('El archivador especificado no existe');
  }

  const documentType = await prisma.documentType.findUnique({
    where: { id: metadata.documentTypeId }
  });

  if (!documentType) {
    await storageService.deleteFile(file.path);
    throw new Error('El tipo de documento especificado no existe');
  }

  const office = await prisma.office.findUnique({
    where: { id: metadata.officeId }
  });

  if (!office) {
    await storageService.deleteFile(file.path);
    throw new Error('La oficina especificada no existe');
  }

  if (!storageService.validatePDF(file)) {
    await storageService.deleteFile(file.path);
    throw new Error('El archivo no es un PDF válido');
  }

  const fileData = await storageService.saveFile(file);

  const document = await prisma.document.create({
    data: {
      archivadorId: metadata.archivadorId,
      documentTypeId: metadata.documentTypeId,
      officeId: metadata.officeId,
      documentNumber: metadata.documentNumber,
      documentDate: new Date(metadata.documentDate),
      sender: metadata.sender,
      folioCount: metadata.folioCount,
      annotations: metadata.annotations || '',
      filePath: fileData.path,
      fileName: fileData.filename,
      fileSize: fileData.size,
      mimeType: fileData.mimetype,
      createdBy: req.user!.id
    },
    include: {
      archivador: {
        include: {
          period: true
        }
      },
      documentType: true,
      office: true,
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

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_CREATED',
    module: 'documents',
    entityType: 'Document',
    entityId: document.id,
    newValue: {
      documentNumber: document.documentNumber,
      archivadorId: document.archivadorId,
      documentTypeId: document.documentTypeId,
      officeId: document.officeId,
      fileName: document.fileName
    },
    req
  });

  await queueService.addToQueue(document.id);

  return document;
};

export const createDocumentsBatch = async (
  files: Express.Multer.File[],
  commonMetadata: Omit<DocumentMetadata, 'documentNumber' | 'documentDate' | 'sender' | 'folioCount' | 'annotations'>,
  specificMetadata: BatchDocumentMetadata[],
  req: Request
) => {
  if (files.length !== specificMetadata.length) {
    for (const file of files) {
      await storageService.deleteFile(file.path);
    }
    throw new Error('El número de archivos no coincide con los metadatos proporcionados');
  }

  const archivador = await prisma.archivador.findUnique({
    where: { id: commonMetadata.archivadorId }
  });

  if (!archivador) {
    for (const file of files) {
      await storageService.deleteFile(file.path);
    }
    throw new Error('El archivador especificado no existe');
  }

  // Validar documentTypeId y officeId si están en commonMetadata
  if (commonMetadata.documentTypeId) {
    const documentType = await prisma.documentType.findUnique({
      where: { id: commonMetadata.documentTypeId }
    });

    if (!documentType) {
      for (const file of files) {
        await storageService.deleteFile(file.path);
      }
      throw new Error('El tipo de documento especificado no existe');
    }
  }

  if (commonMetadata.officeId) {
    const office = await prisma.office.findUnique({
      where: { id: commonMetadata.officeId }
    });

    if (!office) {
      for (const file of files) {
        await storageService.deleteFile(file.path);
      }
      throw new Error('La oficina especificada no existe');
    }
  }

  const successful: string[] = [];
  const failed: Array<{ fileName: string; error: string }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const metadata = specificMetadata[i];

    try {
      if (!storageService.validatePDF(file)) {
        throw new Error('El archivo no es un PDF válido');
      }

      const fileData = await storageService.saveFile(file);

      // Usar metadatos específicos con fallback a comunes
      const documentTypeId = metadata.documentTypeId || commonMetadata.documentTypeId;
      const officeId = metadata.officeId || commonMetadata.officeId;

      if (!documentTypeId || !officeId) {
        throw new Error('Faltan documentTypeId u officeId para este archivo');
      }

      const document = await prisma.document.create({
        data: {
          archivadorId: commonMetadata.archivadorId,
          documentTypeId: documentTypeId,
          officeId: officeId,
          documentNumber: metadata.documentNumber,
          documentDate: new Date(metadata.documentDate),
          sender: metadata.sender,
          folioCount: metadata.folioCount,
          annotations: metadata.annotations || '',
          filePath: fileData.path,
          fileName: fileData.filename,
          fileSize: fileData.size,
          mimeType: fileData.mimetype,
          createdBy: req.user!.id
        }
      });

      successful.push(document.id);

      await log({
        userId: req.user!.id,
        action: 'DOCUMENT_CREATED',
        module: 'documents',
        entityType: 'Document',
        entityId: document.id,
        newValue: {
          documentNumber: document.documentNumber,
          archivadorId: document.archivadorId,
          batch: true
        },
        req
      });

      await queueService.addToQueue(document.id);
    } catch (error) {
      failed.push({
        fileName: file.originalname,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });

      await storageService.deleteFile(file.path).catch(() => {});
    }
  }

  return {
    total: files.length,
    successful: successful.length,
    failed: failed.length,
    successfulIds: successful,
    errors: failed
  };
};

export const getDocumentById = async (id: string) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      archivador: {
        include: {
          period: true
        }
      },
      documentType: true,
      office: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      versions: {
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { versionNumber: 'desc' }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  return document;
};

export const getAllDocuments = async (
  filters: DocumentFilters = {},
  pagination: PaginationParams = {}
) => {
  const { archivadorId, documentTypeId, officeId, dateFrom, dateTo, search, signatureStatus } = filters;
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (archivadorId) {
    where.archivadorId = archivadorId;
  }

  if (documentTypeId) {
    where.documentTypeId = documentTypeId;
  }

  if (officeId) {
    where.officeId = officeId;
  }

  if (signatureStatus) {
    where.signatureStatus = signatureStatus;
  }

  if (dateFrom || dateTo) {
    where.documentDate = {};
    if (dateFrom) {
      where.documentDate.gte = new Date(dateFrom);
    }
    if (dateTo) {
      where.documentDate.lte = new Date(dateTo);
    }
  }

  if (search) {
    where.OR = [
      { documentNumber: { contains: search } },
      { sender: { contains: search } },
      { annotations: { contains: search } }
    ];
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      skip,
      take: limit,
      orderBy: { documentDate: 'desc' },
      include: {
        archivador: {
          include: {
            period: true
          }
        },
        documentType: true,
        office: true,
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
    prisma.document.count({ where })
  ]);

  return {
    data: documents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const updateDocument = async (
  id: string,
  metadata: Partial<DocumentMetadata>,
  req: Request
) => {
  const existingDocument = await prisma.document.findUnique({
    where: { id }
  });

  if (!existingDocument) {
    throw new Error('Documento no encontrado');
  }

  if (metadata.archivadorId && metadata.archivadorId !== existingDocument.archivadorId) {
    const archivador = await prisma.archivador.findUnique({
      where: { id: metadata.archivadorId }
    });

    if (!archivador) {
      throw new Error('El archivador especificado no existe');
    }
  }

  if (metadata.documentTypeId && metadata.documentTypeId !== existingDocument.documentTypeId) {
    const documentType = await prisma.documentType.findUnique({
      where: { id: metadata.documentTypeId }
    });

    if (!documentType) {
      throw new Error('El tipo de documento especificado no existe');
    }
  }

  if (metadata.officeId && metadata.officeId !== existingDocument.officeId) {
    const office = await prisma.office.findUnique({
      where: { id: metadata.officeId }
    });

    if (!office) {
      throw new Error('La oficina especificada no existe');
    }
  }

  const dataToUpdate: any = {
    archivadorId: metadata.archivadorId,
    documentTypeId: metadata.documentTypeId,
    officeId: metadata.officeId,
    documentNumber: metadata.documentNumber,
    documentDate: metadata.documentDate ? new Date(metadata.documentDate) : undefined,
    sender: metadata.sender,
    folioCount: metadata.folioCount,
    annotations: metadata.annotations
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedDocument = await prisma.document.update({
    where: { id },
    data: dataToUpdate,
    include: {
      archivador: {
        include: {
          period: true
        }
      },
      documentType: true,
      office: true,
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

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_UPDATED',
    module: 'documents',
    entityType: 'Document',
    entityId: id,
    oldValue: {
      documentNumber: existingDocument.documentNumber,
      archivadorId: existingDocument.archivadorId,
      documentTypeId: existingDocument.documentTypeId,
      officeId: existingDocument.officeId
    },
    newValue: {
      documentNumber: updatedDocument.documentNumber,
      archivadorId: updatedDocument.archivadorId,
      documentTypeId: updatedDocument.documentTypeId,
      officeId: updatedDocument.officeId
    },
    req
  });

  return updatedDocument;
};

export const deleteDocument = async (id: string, req: Request) => {
  const document = await prisma.document.findUnique({
    where: { id }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  await prisma.document.delete({
    where: { id }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_DELETED',
    module: 'documents',
    entityType: 'Document',
    entityId: id,
    oldValue: {
      documentNumber: document.documentNumber,
      archivadorId: document.archivadorId,
      fileName: document.fileName
    },
    newValue: null,
    req
  });
};

export const downloadDocument = async (id: string, req: Request) => {
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      archivador: true,
      documentType: true,
      office: true
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  if (!storageService.fileExists(document.filePath)) {
    throw new Error('El archivo físico no existe');
  }

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_DOWNLOADED',
    module: 'documents',
    entityType: 'Document',
    entityId: id,
    newValue: {
      documentNumber: document.documentNumber,
      fileName: document.fileName
    },
    req
  });

  return {
    filePath: document.filePath,
    fileName: document.fileName,
    mimeType: document.mimeType,
    fileStream: storageService.getFileStream(document.filePath)
  };
};

export const getDocumentFileBuffer = async (documentId: string): Promise<Buffer> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  if (!storageService.fileExists(document.filePath)) {
    throw new Error('El archivo físico no existe');
  }

  return storageService.getFile(document.filePath);
};

export const updateDocumentSignedFile = async (
  documentId: string,
  signedFileBuffer: Buffer,
  signatureData: any,
  certificateData: any,
  signerId: string,
  validationStatus: string,
  observations: any[],
  req: Request
) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      versions: {
        orderBy: { versionNumber: 'desc' },
        take: 1
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const nextVersionNumber = document.currentVersion + 1;
  const newFileName = storageService.generateUniqueName(document.fileName);
  const newFilePath = path.join(process.cwd(), 'uploads', 'documents', newFileName);

  await fs.promises.writeFile(newFilePath, signedFileBuffer);

  const previousVersion = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: document.currentVersion,
      filePath: document.filePath,
      fileName: document.fileName,
      changeDescription: 'Versión anterior a firma digital',
      createdBy: signerId
    }
  });

  const updatedDocument = await prisma.document.update({
    where: { id: documentId },
    data: {
      filePath: newFilePath,
      fileName: newFileName,
      fileSize: signedFileBuffer.length,
      currentVersion: nextVersionNumber,
      signatureStatus: 'SIGNED',
      lastSignedAt: new Date(),
      signedBy: signerId
    }
  });

  const signature = await prisma.signature.create({
    data: {
      documentId: document.id,
      documentVersionId: previousVersion.id,
      signerId: signerId,
      signatureData: signatureData,
      certificateData: certificateData,
      timestamp: new Date(),
      isValid: validationStatus === 'VÁLIDO',
      status: validationStatus,
      observations: JSON.stringify(observations)
    }
  });

  await log({
    userId: signerId,
    action: 'DOCUMENT_SIGNED',
    module: 'signatures',
    entityType: 'Document',
    entityId: documentId,
    newValue: {
      documentNumber: document.documentNumber,
      versionNumber: nextVersionNumber,
      signatureId: signature.id,
      status: validationStatus
    },
    req
  });

  return {
    document: updatedDocument,
    signature: signature,
    previousVersion: previousVersion
  };
};

export const getIngestStats = async () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalDocumentos,
    documentosHoy,
    documentosSemana,
    documentosMes,
    documentosPorTipo,
    documentosPorOficina,
    estadoOCR,
    topUsuariosIngesta,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.document.count({
      where: { createdAt: { gte: today } }
    }),
    prisma.document.count({
      where: { createdAt: { gte: weekAgo } }
    }),
    prisma.document.count({
      where: { createdAt: { gte: monthAgo } }
    }),
    prisma.document.groupBy({
      by: ['documentTypeId'],
      _count: true,
      orderBy: { _count: { documentTypeId: 'desc' } },
      take: 10
    }),
    prisma.document.groupBy({
      by: ['officeId'],
      _count: true,
      orderBy: { _count: { officeId: 'desc' } },
      take: 10
    }),
    Promise.all([
      prisma.document.count({ where: { ocrStatus: 'COMPLETED' } }),
      prisma.document.count({ where: { ocrStatus: 'PENDING' } }),
      prisma.document.count({ where: { ocrStatus: 'PROCESSING' } }),
      prisma.document.count({ where: { ocrStatus: 'ERROR' } }),
    ]),
    prisma.document.groupBy({
      by: ['createdBy'],
      _count: true,
      orderBy: { _count: { createdBy: 'desc' } },
      take: 5,
      where: { createdAt: { gte: monthAgo } }
    })
  ]);

  const documentTypes = await prisma.documentType.findMany({
    where: { id: { in: documentosPorTipo.map(d => d.documentTypeId) } }
  });

  const offices = await prisma.office.findMany({
    where: { id: { in: documentosPorOficina.map(d => d.officeId) } }
  });

  const users = await prisma.user.findMany({
    where: { id: { in: topUsuariosIngesta.map(u => u.createdBy) } },
    select: { id: true, username: true, firstName: true, lastName: true }
  });

  const ingestaPorDiaData = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(createdAt) as date, COUNT(*) as count
    FROM documents
    WHERE createdAt >= ${thirtyDaysAgo}
    GROUP BY DATE(createdAt)
    ORDER BY DATE(createdAt) ASC
  `;

  const ingestaPorDia = ingestaPorDiaData.map(item => ({
    date: item.date.toISOString().split('T')[0],
    count: Number(item.count)
  }));

  const promedioIngesta = documentosMes > 0 ? Math.round(documentosMes / 30) : 0;

  return {
    totalDocumentos,
    documentosHoy,
    documentosSemana,
    documentosMes,
    promedioIngesta,
    documentosPorTipo: documentosPorTipo.map(item => {
      const type = documentTypes.find(t => t.id === item.documentTypeId);
      return {
        documentTypeId: item.documentTypeId,
        documentTypeName: type?.name || 'Desconocido',
        count: item._count
      };
    }),
    documentosPorOficina: documentosPorOficina.map(item => {
      const office = offices.find(o => o.id === item.officeId);
      return {
        officeId: item.officeId,
        officeName: office?.name || 'Desconocida',
        count: item._count
      };
    }),
    ingestaPorDia,
    estadoOCR: {
      completed: estadoOCR[0],
      pending: estadoOCR[1],
      processing: estadoOCR[2],
      error: estadoOCR[3]
    },
    topUsuariosIngesta: topUsuariosIngesta.map(item => {
      const user = users.find(u => u.id === item.createdBy);
      return {
        userId: item.createdBy,
        username: user?.username || 'Desconocido',
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Desconocido',
        documentosCount: item._count
      };
    })
  };
};

export const validateDocumentBeforeUpload = async (metadata: {
  archivadorId: string;
  documentTypeId: string;
  officeId: string;
  documentNumber: string;
  documentDate: Date;
}) => {
  const warnings: string[] = [];
  const errors: string[] = [];

  const archivador = await prisma.archivador.findUnique({
    where: { id: metadata.archivadorId },
    include: {
      _count: { select: { documents: true } }
    }
  });

  if (!archivador) {
    errors.push('El archivador especificado no existe');
  }

  const documentType = await prisma.documentType.findUnique({
    where: { id: metadata.documentTypeId }
  });

  if (!documentType) {
    errors.push('El tipo de documento especificado no existe');
  }

  const office = await prisma.office.findUnique({
    where: { id: metadata.officeId }
  });

  if (!office) {
    errors.push('La oficina especificada no existe');
  }

  const existingDocument = await prisma.document.findFirst({
    where: {
      documentNumber: metadata.documentNumber,
      documentDate: new Date(metadata.documentDate),
      archivadorId: metadata.archivadorId
    }
  });

  if (existingDocument) {
    warnings.push('Ya existe un documento con el mismo número y fecha en este archivador');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    archivadorInfo: archivador ? {
      name: archivador.name,
      currentCount: archivador._count.documents,
      maxCapacity: null,
      percentFull: null
    } : null,
    duplicateDocument: existingDocument ? {
      id: existingDocument.id,
      documentNumber: existingDocument.documentNumber,
      documentDate: existingDocument.documentDate
    } : null
  };
};

export const getDocumentsAnalytics = async (filters?: {
  dateFrom?: Date;
  dateTo?: Date;
  archivadorId?: string;
  documentTypeId?: string;
  officeId?: string;
}) => {
  const where: any = {};
  
  if (filters?.archivadorId) {
    where.archivadorId = filters.archivadorId;
  }
  
  if (filters?.documentTypeId) {
    where.documentTypeId = filters.documentTypeId;
  }
  
  if (filters?.officeId) {
    where.officeId = filters.officeId;
  }
  
  if (filters?.dateFrom || filters?.dateTo) {
    where.documentDate = {};
    if (filters.dateFrom) {
      where.documentDate.gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.documentDate.lte = new Date(filters.dateTo);
    }
  }

  const [
    total,
    firmados,
    sinFirmar,
    ocrProcesados,
    ocrPendientes,
    documentosPorTipo,
    documentosPorOficina,
    topUsuariosCreadores,
    activos,
    capacidadArchivadores
  ] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.count({ where: { ...where, signatureStatus: 'SIGNED' } }),
    prisma.document.count({ where: { ...where, signatureStatus: 'UNSIGNED' } }),
    prisma.document.count({ where: { ...where, ocrStatus: 'COMPLETED' } }),
    prisma.document.count({ where: { ...where, ocrStatus: 'PENDING' } }),
    
    prisma.document.groupBy({
      by: ['documentTypeId'],
      where,
      _count: true,
      orderBy: { _count: { documentTypeId: 'desc' } }
    }),
    
    prisma.document.groupBy({
      by: ['officeId'],
      where,
      _count: true,
      orderBy: { _count: { officeId: 'desc' } }
    }),
    
    prisma.document.groupBy({
      by: ['createdBy'],
      where,
      _count: true,
      orderBy: { _count: { createdBy: 'desc' } },
      take: 10
    }),
    
    prisma.document.count({ where }),
    
    prisma.archivador.findMany({
      include: {
        _count: { select: { documents: true } }
      }
    })
  ]);

  const documentTypes = await prisma.documentType.findMany({
    where: { id: { in: documentosPorTipo.map(d => d.documentTypeId) } }
  });

  const offices = await prisma.office.findMany({
    where: { id: { in: documentosPorOficina.map(d => d.officeId) } }
  });

  const users = await prisma.user.findMany({
    where: { id: { in: topUsuariosCreadores.map(u => u.createdBy) } },
    select: { id: true, username: true, firstName: true, lastName: true }
  });

  const now = new Date();
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  // Construir la consulta SQL base
  let sqlQuery = `
    SELECT 
      DATE_FORMAT(documentDate, '%Y-%m') as mes,
      COUNT(*) as count,
      SUM(CASE WHEN signatureStatus = 'SIGNED' THEN 1 ELSE 0 END) as firmados,
      SUM(CASE WHEN signatureStatus = 'UNSIGNED' THEN 1 ELSE 0 END) as sinFirmar
    FROM documents
    WHERE documentDate >= ?
  `;

  const params: any[] = [twelveMonthsAgo];

  if (filters?.archivadorId) {
    sqlQuery += ` AND archivadorId = ?`;
    params.push(filters.archivadorId);
  }

  if (filters?.documentTypeId) {
    sqlQuery += ` AND documentTypeId = ?`;
    params.push(filters.documentTypeId);
  }

  if (filters?.officeId) {
    sqlQuery += ` AND officeId = ?`;
    params.push(filters.officeId);
  }

  sqlQuery += `
    GROUP BY DATE_FORMAT(documentDate, '%Y-%m')
    ORDER BY mes ASC
  `;

  const tendenciaMensualData = await prisma.$queryRawUnsafe<Array<{ mes: string; count: bigint; firmados: bigint; sinFirmar: bigint }>>(
    sqlQuery,
    ...params
  );

  return {
    resumen: {
      total,
      firmados,
      sinFirmar,
      ocrProcesados,
      ocrPendientes
    },
    distribucionPorTipo: documentosPorTipo.map(item => {
      const type = documentTypes.find(t => t.id === item.documentTypeId);
      return {
        documentTypeId: item.documentTypeId,
        documentTypeName: type?.name || 'Desconocido',
        count: item._count,
        porcentaje: total > 0 ? Math.round((item._count / total) * 100) : 0
      };
    }),
    distribucionPorOficina: documentosPorOficina.map(item => {
      const office = offices.find(o => o.id === item.officeId);
      return {
        officeId: item.officeId,
        officeName: office?.name || 'Desconocida',
        count: item._count,
        porcentaje: total > 0 ? Math.round((item._count / total) * 100) : 0
      };
    }),
    tendenciaMensual: tendenciaMensualData.map(item => ({
      mes: item.mes,
      count: Number(item.count),
      firmados: Number(item.firmados),
      sinFirmar: Number(item.sinFirmar)
    })),
    topUsuariosCreadores: topUsuariosCreadores.map(item => {
      const user = users.find(u => u.id === item.createdBy);
      return {
        userId: item.createdBy,
        username: user?.username || 'Desconocido',
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Desconocido',
        documentosCreados: item._count
      };
    }),
    estadoDocumentos: {
      activos,
      archivados: 0,
      eliminados: 0
    },
    capacidadArchivadores: capacidadArchivadores.map(arch => ({
      archivadorId: arch.id,
      code: arch.code,
      name: arch.name,
      totalDocumentos: arch._count.documents,
      capacidadUsada: 0
    }))
  };
};

export const getDocumentTimeline = async (documentId: string) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      creator: {
        select: { id: true, username: true, firstName: true, lastName: true }
      }
    }
  });

  if (!document) {
    throw new Error('Documento no encontrado');
  }

  const [versions, signatures, auditLogs] = await Promise.all([
    prisma.documentVersion.findMany({
      where: { documentId },
      include: {
        creator: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    
    prisma.signature.findMany({
      where: { documentId },
      include: {
        signer: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      },
      orderBy: { timestamp: 'asc' }
    }),
    
    prisma.$queryRaw<Array<{
      id: string;
      userId: string | null;
      action: string;
      module: string;
      entityType: string;
      entityId: string;
      oldValue: any;
      newValue: any;
      ipAddress: string;
      userAgent: string;
      createdAt: Date;
      userFirstName: string | null;
      userLastName: string | null;
      username: string | null;
    }>>`
      SELECT 
        a.id, a.userId, a.action, a.module, a.entityType, a.entityId,
        a.oldValue, a.newValue, a.ipAddress, a.userAgent, a.createdAt,
        u.firstName as userFirstName, u.lastName as userLastName, u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.entityType = 'Document' AND a.entityId = ${documentId}
      ORDER BY a.createdAt DESC
      LIMIT 50
    `
  ]);

  const timeline: Array<{
    id: string;
    type: 'created' | 'updated' | 'signed' | 'version' | 'downloaded' | 'other';
    action: string;
    description: string;
    timestamp: Date;
    user: {
      id: string;
      username: string;
      fullName: string;
    } | null;
    details?: any;
  }> = [];

  timeline.push({
    id: `created-${document.id}`,
    type: 'created',
    action: 'DOCUMENT_CREATED',
    description: 'Documento creado',
    timestamp: document.createdAt,
    user: document.creator ? {
      id: document.creator.id,
      username: document.creator.username,
      fullName: `${document.creator.firstName} ${document.creator.lastName}`
    } : null,
    details: {
      documentNumber: document.documentNumber,
      fileName: document.fileName
    }
  });

  versions.forEach(version => {
    timeline.push({
      id: `version-${version.id}`,
      type: 'version',
      action: 'VERSION_CREATED',
      description: version.changeDescription || 'Nueva versión creada',
      timestamp: version.createdAt,
      user: version.creator ? {
        id: version.creator.id,
        username: version.creator.username,
        fullName: `${version.creator.firstName} ${version.creator.lastName}`
      } : null,
      details: {
        versionNumber: version.versionNumber,
        fileName: version.fileName
      }
    });
  });

  signatures.forEach(signature => {
    timeline.push({
      id: `signature-${signature.id}`,
      type: 'signed',
      action: 'DOCUMENT_SIGNED',
      description: `Documento firmado digitalmente (${signature.status})`,
      timestamp: signature.timestamp,
      user: signature.signer ? {
        id: signature.signer.id,
        username: signature.signer.username,
        fullName: `${signature.signer.firstName} ${signature.signer.lastName}`
      } : null,
      details: {
        isValid: signature.isValid,
        status: signature.status,
        observations: signature.observations
      }
    });
  });

  auditLogs.forEach(log => {
    // Skip logs without user information
    if (!log.userId || !log.username) {
      return;
    }

    let type: 'created' | 'updated' | 'signed' | 'version' | 'downloaded' | 'other' = 'other';
    let description = log.action;

    if (log.action === 'DOCUMENT_UPDATED') {
      type = 'updated';
      description = 'Metadatos actualizados';
    } else if (log.action === 'DOCUMENT_DOWNLOADED') {
      type = 'downloaded';
      description = 'Documento descargado';
    } else if (log.action === 'DOCUMENT_SIGNED') {
      type = 'signed';
      description = 'Documento firmado';
    }

    timeline.push({
      id: `audit-${log.id}`,
      type,
      action: log.action,
      description,
      timestamp: log.createdAt,
      user: {
        id: log.userId,
        username: log.username,
        fullName: `${log.userFirstName || ''} ${log.userLastName || ''}`.trim()
      },
      details: {
        oldValue: log.oldValue,
        newValue: log.newValue
      }
    });
  });

  timeline.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  return {
    documentId,
    documentNumber: document.documentNumber,
    timeline
  };
};

export default {
  createDocument,
  createDocumentsBatch,
  getDocumentById,
  getAllDocuments,
  updateDocument,
  deleteDocument,
  downloadDocument,
  getDocumentFileBuffer,
  updateDocumentSignedFile,
  getIngestStats,
  validateDocumentBeforeUpload,
  getDocumentsAnalytics,
  getDocumentTimeline
};
