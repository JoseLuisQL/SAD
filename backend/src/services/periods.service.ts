import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface CreatePeriodData {
  year: number;
  description?: string;
}

interface UpdatePeriodData {
  year?: number;
  description?: string;
  isActive?: boolean;
}

export const getAllPeriods = async () => {
  const periods = await prisma.period.findMany({
    orderBy: { year: 'desc' },
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  return periods;
};

export const getPeriodById = async (id: string) => {
  const period = await prisma.period.findUnique({
    where: { id },
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  if (!period) {
    throw new Error('Periodo no encontrado');
  }

  return period;
};

export const createPeriod = async (periodData: CreatePeriodData, req: Request) => {
  const existingPeriod = await prisma.period.findUnique({
    where: { year: periodData.year }
  });

  if (existingPeriod) {
    throw new Error('Ya existe un periodo para este año');
  }

  const period = await prisma.period.create({
    data: {
      year: periodData.year,
      description: periodData.description || null
    },
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'PERIOD_CREATED',
    module: 'periods',
    entityType: 'Period',
    entityId: period.id,
    newValue: {
      year: period.year,
      description: period.description
    },
    req
  });

  return period;
};

export const updatePeriod = async (
  id: string,
  periodData: UpdatePeriodData,
  req: Request
) => {
  const existingPeriod = await prisma.period.findUnique({
    where: { id }
  });

  if (!existingPeriod) {
    throw new Error('Periodo no encontrado');
  }

  if (periodData.year && periodData.year !== existingPeriod.year) {
    const yearExists = await prisma.period.findUnique({
      where: { year: periodData.year }
    });

    if (yearExists) {
      throw new Error('Ya existe un periodo para este año');
    }
  }

  const dataToUpdate: any = {
    year: periodData.year,
    description: periodData.description,
    isActive: periodData.isActive
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedPeriod = await prisma.period.update({
    where: { id },
    data: dataToUpdate,
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'PERIOD_UPDATED',
    module: 'periods',
    entityType: 'Period',
    entityId: id,
    oldValue: {
      year: existingPeriod.year,
      description: existingPeriod.description,
      isActive: existingPeriod.isActive
    },
    newValue: {
      year: updatedPeriod.year,
      description: updatedPeriod.description,
      isActive: updatedPeriod.isActive
    },
    req
  });

  return updatedPeriod;
};

export const deletePeriod = async (id: string, req: Request) => {
  const period = await prisma.period.findUnique({
    where: { id },
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  if (!period) {
    throw new Error('Periodo no encontrado');
  }

  if (period._count.archivadores > 0) {
    throw new Error('No se puede eliminar el periodo porque tiene archivadores asociados');
  }

  await prisma.period.update({
    where: { id },
    data: { isActive: false }
  });

  await log({
    userId: req.user!.id,
    action: 'PERIOD_DELETED',
    module: 'periods',
    entityType: 'Period',
    entityId: id,
    oldValue: {
      year: period.year,
      description: period.description,
      isActive: true
    },
    newValue: {
      isActive: false
    },
    req
  });
};

export const getStats = async () => {
  const [
    total,
    active,
    inactive,
    mostUsed,
    recentlyCreated
  ] = await Promise.all([
    prisma.period.count(),
    prisma.period.count({ where: { isActive: true } }),
    prisma.period.count({ where: { isActive: false } }),
    prisma.period.findMany({
      take: 5,
      orderBy: {
        archivadores: {
          _count: 'desc'
        }
      },
      include: {
        _count: {
          select: { archivadores: true }
        }
      }
    }),
    prisma.period.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { archivadores: true }
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

export const exportToCSV = async () => {
  const periods = await prisma.period.findMany({
    orderBy: { year: 'desc' },
    include: {
      _count: {
        select: { archivadores: true }
      }
    }
  });

  const csvData = periods.map(period => ({
    Año: period.year,
    Descripción: period.description || '',
    Estado: period.isActive ? 'Activo' : 'Inactivo',
    Archivadores: period._count.archivadores,
    'Fecha Creación': period.createdAt.toISOString()
  }));

  return csvData;
};

export const exportToExcel = async () => {
  const csvData = await exportToCSV();
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
        if (!row.Año || isNaN(parseInt(row.Año))) {
          results.errors.push({
            row,
            reason: 'El año es requerido y debe ser un número válido'
          });
          continue;
        }

        const year = parseInt(row.Año);
        const currentYear = new Date().getFullYear();

        if (year < 1900 || year > currentYear) {
          results.errors.push({
            row,
            reason: `El año debe estar entre 1900 y ${currentYear}`
          });
          continue;
        }

        const existingPeriod = await tx.period.findUnique({
          where: { year }
        });

        if (existingPeriod) {
          results.errors.push({
            row,
            reason: `Ya existe un periodo para el año ${year}`
          });
          continue;
        }

        const period = await tx.period.create({
          data: {
            year,
            description: row.Descripción?.trim() || null
          }
        });

        results.success.push(period);

        await log({
          userId: req.user!.id,
          action: 'PERIOD_CREATED',
          module: 'periods',
          entityType: 'Period',
          entityId: period.id,
          newValue: {
            year: period.year,
            description: period.description
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

export const bulkCreate = async (items: CreatePeriodData[], req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const item of items) {
    try {
      const period = await createPeriod(item, req);
      results.success.push(period);
    } catch (error) {
      results.errors.push({
        item,
        reason: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  return results;
};

export const bulkUpdate = async (updates: Array<{ id: string; data: UpdatePeriodData }>, req: Request) => {
  const results = {
    success: [] as any[],
    errors: [] as any[]
  };

  for (const update of updates) {
    try {
      const period = await updatePeriod(update.id, update.data, req);
      results.success.push(period);
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
      await deletePeriod(id, req);
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
  getAllPeriods,
  getPeriodById,
  createPeriod,
  updatePeriod,
  deletePeriod,
  getStats,
  exportToCSV,
  exportToExcel,
  importFromCSV,
  importFromExcel,
  bulkCreate,
  bulkUpdate,
  bulkDelete
};
