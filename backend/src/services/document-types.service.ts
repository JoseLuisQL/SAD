import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface GetAllDocumentTypesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateDocumentTypeData {
  name: string;
  description?: string;
}

interface UpdateDocumentTypeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

const generateDocumentTypeCode = async (): Promise<string> => {
  const allDocumentTypes = await prisma.documentType.findMany({
    select: { code: true }
  });

  const numericCodes = allDocumentTypes
    .map(docType => parseInt(docType.code))
    .filter(code => !isNaN(code));

  if (numericCodes.length === 0) {
    return '001';
  }

  const maxCode = Math.max(...numericCodes);
  const newCodeNumber = maxCode + 1;
  return newCodeNumber.toString().padStart(3, '0');
};

export const getAllDocumentTypes = async (filters: GetAllDocumentTypesFilters) => {
  const {
    page = 1,
    limit = 10,
    search,
    isActive
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [documentTypes, total] = await Promise.all([
    prisma.documentType.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    }),
    prisma.documentType.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    documentTypes,
    total,
    page,
    limit,
    totalPages
  };
};

export const getDocumentTypeById = async (id: string) => {
  const documentType = await prisma.documentType.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!documentType) {
    throw new Error('Tipo de documento no encontrado');
  }

  return documentType;
};

export const createDocumentType = async (
  documentTypeData: CreateDocumentTypeData,
  req: Request
) => {
  const code = await generateDocumentTypeCode();

  const documentType = await prisma.documentType.create({
    data: {
      code,
      name: documentTypeData.name,
      description: documentTypeData.description || null
    },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_TYPE_CREATED',
    module: 'document-types',
    entityType: 'DocumentType',
    entityId: documentType.id,
    newValue: {
      code: documentType.code,
      name: documentType.name,
      description: documentType.description
    },
    req
  });

  return documentType;
};

export const updateDocumentType = async (
  id: string,
  documentTypeData: UpdateDocumentTypeData,
  req: Request
) => {
  const existingDocumentType = await prisma.documentType.findUnique({
    where: { id }
  });

  if (!existingDocumentType) {
    throw new Error('Tipo de documento no encontrado');
  }

  const dataToUpdate: any = {
    name: documentTypeData.name,
    description: documentTypeData.description,
    isActive: documentTypeData.isActive
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedDocumentType = await prisma.documentType.update({
    where: { id },
    data: dataToUpdate,
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_TYPE_UPDATED',
    module: 'document-types',
    entityType: 'DocumentType',
    entityId: id,
    oldValue: {
      name: existingDocumentType.name,
      description: existingDocumentType.description,
      isActive: existingDocumentType.isActive
    },
    newValue: {
      name: updatedDocumentType.name,
      description: updatedDocumentType.description,
      isActive: updatedDocumentType.isActive
    },
    req
  });

  return updatedDocumentType;
};

export const deleteDocumentType = async (id: string, req: Request) => {
  const documentType = await prisma.documentType.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!documentType) {
    throw new Error('Tipo de documento no encontrado');
  }

  if (documentType._count.documents > 0) {
    throw new Error('No se puede eliminar el tipo de documento porque tiene documentos asociados');
  }

  await prisma.documentType.update({
    where: { id },
    data: { isActive: false }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENT_TYPE_DELETED',
    module: 'document-types',
    entityType: 'DocumentType',
    entityId: id,
    oldValue: {
      code: documentType.code,
      name: documentType.name,
      isActive: true
    },
    newValue: {
      isActive: false
    },
    req
  });
};

export const searchDocumentTypes = async (query: string) => {
  const documentTypes = await prisma.documentType.findMany({
    where: {
      OR: [
        { code: { contains: query } },
        { name: { contains: query } },
        { description: { contains: query } }
      ],
      isActive: true
    },
    take: 10,
    orderBy: { code: 'asc' }
  });

  return documentTypes;
};

export const getStats = async () => {
  const [
    total,
    active,
    inactive,
    mostUsed,
    recentlyCreated
  ] = await Promise.all([
    prisma.documentType.count(),
    prisma.documentType.count({ where: { isActive: true } }),
    prisma.documentType.count({ where: { isActive: false } }),
    prisma.documentType.findMany({
      take: 5,
      orderBy: {
        documents: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    }),
    prisma.documentType.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { documents: true }
        }
      }
    })
  ]);

  return {
    total,
    active,
    inactive,
    mostUsed,
    recentlyCreated
  };
};

export const exportToCSV = async (filters: GetAllDocumentTypesFilters) => {
  const { search, isActive } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } },
      { description: { contains: search } }
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const documentTypes = await prisma.documentType.findMany({
    where,
    orderBy: { code: 'asc' },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  const csvData = documentTypes.map(docType => ({
    Código: docType.code,
    Nombre: docType.name,
    Descripción: docType.description || '',
    Estado: docType.isActive ? 'Activo' : 'Inactivo',
    Documentos: docType._count.documents,
    'Fecha Creación': docType.createdAt.toISOString()
  }));

  return csvData;
};

export const exportToExcel = async (filters: GetAllDocumentTypesFilters) => {
  const csvData = await exportToCSV(filters);
  return csvData;
};

export const importFromCSV = async (data: any[], req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  await prisma.$transaction(async (tx) => {
    for (const row of data) {
      try {
        if (!row.Nombre || row.Nombre.trim() === '') {
          results.errors.push({
            row,
            reason: 'El nombre es requerido'
          });
          continue;
        }

        const code = await generateDocumentTypeCode();

        const documentType = await tx.documentType.create({
          data: {
            code,
            name: row.Nombre.trim(),
            description: row.Descripción?.trim() || null
          }
        });

        results.success.push(documentType);

        await log({
          userId: req.user!.id,
          action: 'DOCUMENT_TYPE_CREATED',
          module: 'document-types',
          entityType: 'DocumentType',
          entityId: documentType.id,
          newValue: {
            code: documentType.code,
            name: documentType.name,
            description: documentType.description
          },
          req
        });
      } catch (error) {
        results.errors.push({
          row,
          reason: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
  });

  return results;
};

export const importFromExcel = async (data: any[], req: Request) => {
  return await importFromCSV(data, req);
};

export const bulkCreate = async (items: CreateDocumentTypeData[], req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const item of items) {
    try {
      const documentType = await createDocumentType(item, req);
      results.success.push(documentType);
    } catch (error) {
      results.errors.push({
        item,
        reason: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
};

export const bulkUpdate = async (updates: Array<{ id: string; data: UpdateDocumentTypeData }>, req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const update of updates) {
    try {
      const documentType = await updateDocumentType(update.id, update.data, req);
      results.success.push(documentType);
    } catch (error) {
      results.errors.push({
        id: update.id,
        reason: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
};

export const bulkDelete = async (ids: string[], req: Request) => {
  const results = {
    success: [] as string[],
    errors: [] as any[]
  };

  for (const id of ids) {
    try {
      await deleteDocumentType(id, req);
      results.success.push(id);
    } catch (error) {
      results.errors.push({
        id,
        reason: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
};

export default {
  getAllDocumentTypes,
  getDocumentTypeById,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
  searchDocumentTypes,
  getStats,
  exportToCSV,
  exportToExcel,
  importFromCSV,
  importFromExcel,
  bulkCreate,
  bulkUpdate,
  bulkDelete
};
