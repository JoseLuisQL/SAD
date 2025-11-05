import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface PhysicalLocation {
  estante: string;
  modulo: string;
  descripcion?: string;
  [key: string]: string | undefined;
}

interface CreateArchivadorData {
  code: string;
  name: string;
  periodId: string;
  physicalLocation: PhysicalLocation;
}

interface UpdateArchivadorData {
  name?: string;
  periodId?: string;
  physicalLocation?: PhysicalLocation;
}

interface ArchivadorFilters {
  periodId?: string;
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getAllArchivadores = async (
  filters: ArchivadorFilters = {},
  pagination: PaginationParams = {}
) => {
  const { periodId, search } = filters;
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (periodId) {
    where.periodId = periodId;
  }

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } }
    ];
  }

  const [archivadores, total] = await Promise.all([
    prisma.archivador.findMany({
      where,
      skip,
      take: limit,
      orderBy: { code: 'asc' },
      include: {
        period: true,
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: { documents: true }
        }
      }
    }),
    prisma.archivador.count({ where })
  ]);

  return {
    data: archivadores,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getArchivadorById = async (id: string) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id },
    include: {
      period: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      documents: {
        select: {
          id: true,
          documentNumber: true,
          documentDate: true,
          sender: true,
          folioCount: true,
          documentType: {
            select: {
              id: true,
              name: true
            }
          },
          office: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { documentDate: 'desc' }
      }
    }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  const stats = await getArchivadorStats(id);

  return {
    ...archivador,
    stats
  };
};

export const createArchivador = async (
  archivadorData: CreateArchivadorData,
  req: Request
) => {
  const existingArchivador = await prisma.archivador.findUnique({
    where: { code: archivadorData.code }
  });

  if (existingArchivador) {
    throw new Error('Ya existe un archivador con este código');
  }

  const period = await prisma.period.findUnique({
    where: { id: archivadorData.periodId }
  });

  if (!period) {
    throw new Error('El periodo especificado no existe');
  }

  const archivador = await prisma.archivador.create({
    data: {
      code: archivadorData.code,
      name: archivadorData.name,
      periodId: archivadorData.periodId,
      physicalLocation: archivadorData.physicalLocation,
      createdBy: req.user!.id
    },
    include: {
      period: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: { documents: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'ARCHIVADOR_CREATED',
    module: 'archivadores',
    entityType: 'Archivador',
    entityId: archivador.id,
    newValue: {
      code: archivador.code,
      name: archivador.name,
      periodId: archivador.periodId,
      physicalLocation: archivador.physicalLocation
    },
    req
  });

  return archivador;
};

export const updateArchivador = async (
  id: string,
  archivadorData: UpdateArchivadorData,
  req: Request
) => {
  const existingArchivador = await prisma.archivador.findUnique({
    where: { id }
  });

  if (!existingArchivador) {
    throw new Error('Archivador no encontrado');
  }

  if (archivadorData.periodId && archivadorData.periodId !== existingArchivador.periodId) {
    const period = await prisma.period.findUnique({
      where: { id: archivadorData.periodId }
    });

    if (!period) {
      throw new Error('El periodo especificado no existe');
    }
  }

  const dataToUpdate: any = {
    name: archivadorData.name,
    periodId: archivadorData.periodId,
    physicalLocation: archivadorData.physicalLocation
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedArchivador = await prisma.archivador.update({
    where: { id },
    data: dataToUpdate,
    include: {
      period: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      _count: {
        select: { documents: true }
      }
    }
  });

  await log({
    userId: req.user!.id,
    action: 'ARCHIVADOR_UPDATED',
    module: 'archivadores',
    entityType: 'Archivador',
    entityId: id,
    oldValue: {
      name: existingArchivador.name,
      periodId: existingArchivador.periodId,
      physicalLocation: existingArchivador.physicalLocation
    },
    newValue: {
      name: updatedArchivador.name,
      periodId: updatedArchivador.periodId,
      physicalLocation: updatedArchivador.physicalLocation
    },
    req
  });

  return updatedArchivador;
};

export const deleteArchivador = async (id: string, req: Request) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  if (archivador._count.documents > 0) {
    throw new Error('No se puede eliminar el archivador porque tiene documentos asociados');
  }

  await prisma.archivador.delete({
    where: { id }
  });

  await log({
    userId: req.user!.id,
    action: 'ARCHIVADOR_DELETED',
    module: 'archivadores',
    entityType: 'Archivador',
    entityId: id,
    oldValue: {
      code: archivador.code,
      name: archivador.name,
      periodId: archivador.periodId,
      physicalLocation: archivador.physicalLocation
    },
    newValue: null,
    req
  });
};

export const searchArchivadores = async (query: string) => {
  const archivadores = await prisma.archivador.findMany({
    where: {
      OR: [
        { code: { contains: query } },
        { name: { contains: query } }
      ]
    },
    take: 10,
    orderBy: { code: 'asc' },
    include: {
      period: {
        select: {
          id: true,
          year: true
        }
      },
      _count: {
        select: { documents: true }
      }
    }
  });

  return archivadores;
};

export const getArchivadorStats = async (id: string) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id },
    include: {
      documents: {
        include: {
          documentType: true,
          office: true
        }
      }
    }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  const totalDocuments = archivador.documents.length;
  const totalFolios = archivador.documents.reduce(
    (sum, doc) => sum + doc.folioCount,
    0
  );

  const documentsByType = archivador.documents.reduce((acc: any, doc) => {
    const typeName = doc.documentType.name;
    if (!acc[typeName]) {
      acc[typeName] = 0;
    }
    acc[typeName]++;
    return acc;
  }, {});

  const documentsByOffice = archivador.documents.reduce((acc: any, doc) => {
    const officeName = doc.office.name;
    if (!acc[officeName]) {
      acc[officeName] = 0;
    }
    acc[officeName]++;
    return acc;
  }, {});

  return {
    totalDocuments,
    totalFolios,
    documentsByType,
    documentsByOffice
  };
};

export const getArchivadoresGeneralStats = async () => {
  const archivadores = await prisma.archivador.findMany({
    include: {
      period: {
        select: {
          year: true
        }
      },
      _count: {
        select: { documents: true }
      }
    }
  });

  const totalArchivadores = archivadores.length;
  
  const documentosTotal = archivadores.reduce((sum, arch) => sum + arch._count.documents, 0);

  const totalPosibleCapacidad = totalArchivadores * 100;
  const capacidadUtilizada = totalPosibleCapacidad > 0 
    ? Math.round((documentosTotal / totalPosibleCapacidad) * 100) 
    : 0;

  const archivadoresPorPeriodo = archivadores.reduce((acc: any[], arch) => {
    const periodYear = arch.period.year;
    const existing = acc.find(item => item.periodYear === periodYear);
    
    if (existing) {
      existing.count += 1;
      existing.documentosCount += arch._count.documents;
    } else {
      acc.push({
        periodYear,
        count: 1,
        documentosCount: arch._count.documents
      });
    }
    
    return acc;
  }, []).sort((a, b) => a.periodYear - b.periodYear);

  const topArchivadoresMasUsados = archivadores
    .sort((a, b) => b._count.documents - a._count.documents)
    .slice(0, 10)
    .map(arch => ({
      archivadorId: arch.id,
      code: arch.code,
      name: arch.name,
      documentosCount: arch._count.documents
    }));

  const distribucionPorUbicacion = archivadores.reduce((acc: any[], arch) => {
    if (!arch.physicalLocation) return acc;
    
    const location = arch.physicalLocation as any;
    const ubicacion = `${location.estante || 'N/A'}-${location.modulo || 'N/A'}`;
    const existing = acc.find(item => item.ubicacion === ubicacion);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        ubicacion,
        count: 1
      });
    }
    
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const recentArchivadores = await prisma.archivador.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      period: {
        select: {
          year: true
        }
      },
      _count: {
        select: { documents: true }
      }
    }
  });

  return {
    totalArchivadores,
    documentosTotal,
    capacidadUtilizada,
    archivadoresPorPeriodo,
    topArchivadoresMasUsados,
    distribucionPorUbicacion,
    recentArchivadores
  };
};

export const getArchivadorAnalytics = async (archivadorId: string) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id: archivadorId },
    include: {
      documents: {
        include: {
          documentType: true,
          office: true
        }
      }
    }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  const totalDocumentos = archivador.documents.length;

  const distribucionPorTipo = archivador.documents.reduce((acc: any[], doc) => {
    const tipoDato = acc.find(item => item.tipo === doc.documentType.name);
    
    if (tipoDato) {
      tipoDato.cantidad += 1;
    } else {
      acc.push({
        tipo: doc.documentType.name,
        cantidad: 1
      });
    }
    
    return acc;
  }, []);

  const documentosPorMes = archivador.documents.reduce((acc: any[], doc) => {
    const fecha = new Date(doc.documentDate);
    const mes = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    const mesDato = acc.find(item => item.mes === mes);
    
    if (mesDato) {
      mesDato.cantidad += 1;
    } else {
      acc.push({
        mes,
        cantidad: 1
      });
    }
    
    return acc;
  }, []).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-6);

  const oficinasMasRepresentadas = archivador.documents.reduce((acc: any[], doc) => {
    const oficinaDato = acc.find(item => item.oficina === doc.office.name);
    
    if (oficinaDato) {
      oficinaDato.cantidad += 1;
    } else {
      acc.push({
        oficina: doc.office.name,
        cantidad: 1
      });
    }
    
    return acc;
  }, []).sort((a, b) => b.cantidad - a.cantidad).slice(0, 5);

  const capacidadEstimada = 100;
  let estadoArchivador = 'vacio';
  const porcentajeOcupacion = (totalDocumentos / capacidadEstimada) * 100;
  
  if (porcentajeOcupacion >= 71) {
    estadoArchivador = 'lleno';
  } else if (porcentajeOcupacion >= 31) {
    estadoArchivador = 'medio';
  }

  return {
    totalDocumentos,
    distribucionPorTipo,
    documentosPorMes,
    oficinasMasRepresentadas,
    estadoArchivador,
    porcentajeOcupacion: Math.round(porcentajeOcupacion)
  };
};

export default {
  getAllArchivadores,
  getArchivadorById,
  createArchivador,
  updateArchivador,
  deleteArchivador,
  searchArchivadores,
  getArchivadorStats,
  getArchivadoresGeneralStats,
  getArchivadorAnalytics
};
