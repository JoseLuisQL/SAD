import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface GetAllOfficesFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateOfficeData {
  name: string;
  description?: string;
}

interface UpdateOfficeData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

const generateOfficeCode = async (): Promise<string> => {
  const allOffices = await prisma.office.findMany({
    select: { code: true }
  });

  const numericCodes = allOffices
    .map(office => parseInt(office.code))
    .filter(code => !isNaN(code));

  if (numericCodes.length === 0) {
    return '001';
  }

  const maxCode = Math.max(...numericCodes);
  const newCodeNumber = maxCode + 1;
  return newCodeNumber.toString().padStart(3, '0');
};

export const getAllOffices = async (filters: GetAllOfficesFilters) => {
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

  const [offices, total] = await Promise.all([
    prisma.office.findMany({
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
    prisma.office.count({ where })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    offices,
    total,
    page,
    limit,
    totalPages
  };
};

export const getOfficeById = async (id: string) => {
  const office = await prisma.office.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!office) {
    throw new Error('Oficina no encontrada');
  }

  return office;
};

export const createOffice = async (officeData: CreateOfficeData, req: Request) => {
  const code = await generateOfficeCode();

  const office = await prisma.office.create({
    data: {
      code,
      name: officeData.name,
      description: officeData.description || null
    },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'OFFICE_CREATED',
    module: 'offices',
    entityType: 'Office',
    entityId: office.id,
    newValue: {
      code: office.code,
      name: office.name,
      description: office.description
    },
    req
  });

  return office;
};

export const updateOffice = async (
  id: string,
  officeData: UpdateOfficeData,
  req: Request
) => {
  const existingOffice = await prisma.office.findUnique({
    where: { id }
  });

  if (!existingOffice) {
    throw new Error('Oficina no encontrada');
  }

  const dataToUpdate: any = {
    name: officeData.name,
    description: officeData.description,
    isActive: officeData.isActive
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedOffice = await prisma.office.update({
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
    action: 'OFFICE_UPDATED',
    module: 'offices',
    entityType: 'Office',
    entityId: id,
    oldValue: {
      name: existingOffice.name,
      description: existingOffice.description,
      isActive: existingOffice.isActive
    },
    newValue: {
      name: updatedOffice.name,
      description: updatedOffice.description,
      isActive: updatedOffice.isActive
    },
    req
  });

  return updatedOffice;
};

export const deleteOffice = async (id: string, req: Request) => {
  const office = await prisma.office.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!office) {
    throw new Error('Oficina no encontrada');
  }

  if (office._count.documents > 0) {
    throw new Error('No se puede eliminar la oficina porque tiene documentos asociados');
  }

  await prisma.office.update({
    where: { id },
    data: { isActive: false }
  });

  await log({
    userId: req.user!.id,
    action: 'OFFICE_DELETED',
    module: 'offices',
    entityType: 'Office',
    entityId: id,
    oldValue: {
      code: office.code,
      name: office.name,
      isActive: true
    },
    newValue: {
      isActive: false
    },
    req
  });
};

export const searchOffices = async (query: string) => {
  const offices = await prisma.office.findMany({
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

  return offices;
};

export const getStats = async () => {
  const [
    total,
    active,
    inactive,
    mostUsed,
    recentlyCreated
  ] = await Promise.all([
    prisma.office.count(),
    prisma.office.count({ where: { isActive: true } }),
    prisma.office.count({ where: { isActive: false } }),
    prisma.office.findMany({
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
    prisma.office.findMany({
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

export const exportToCSV = async (filters: GetAllOfficesFilters) => {
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

  const offices = await prisma.office.findMany({
    where,
    orderBy: { code: 'asc' },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  const csvData = offices.map(office => ({
    Código: office.code,
    Nombre: office.name,
    Descripción: office.description || '',
    Estado: office.isActive ? 'Activo' : 'Inactivo',
    Documentos: office._count.documents,
    'Fecha Creación': office.createdAt.toISOString()
  }));

  return csvData;
};

export const exportToExcel = async (filters: GetAllOfficesFilters) => {
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

        const code = await generateOfficeCode();

        const office = await tx.office.create({
          data: {
            code,
            name: row.Nombre.trim(),
            description: row.Descripción?.trim() || null
          }
        });

        results.success.push(office);

        await log({
          userId: req.user!.id,
          action: 'OFFICE_CREATED',
          module: 'offices',
          entityType: 'Office',
          entityId: office.id,
          newValue: {
            code: office.code,
            name: office.name,
            description: office.description
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

export const bulkCreate = async (items: CreateOfficeData[], req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const item of items) {
    try {
      const office = await createOffice(item, req);
      results.success.push(office);
    } catch (error) {
      results.errors.push({
        item,
        reason: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
};

export const bulkUpdate = async (updates: Array<{ id: string; data: UpdateOfficeData }>, req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const update of updates) {
    try {
      const office = await updateOffice(update.id, update.data, req);
      results.success.push(office);
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
      await deleteOffice(id, req);
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
  getAllOffices,
  getOfficeById,
  createOffice,
  updateOffice,
  deleteOffice,
  searchOffices,
  getStats,
  exportToCSV,
  exportToExcel,
  importFromCSV,
  importFromExcel,
  bulkCreate,
  bulkUpdate,
  bulkDelete
};
