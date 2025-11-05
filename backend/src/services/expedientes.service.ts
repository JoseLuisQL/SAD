import { Request } from 'express';
import prisma from '../config/database';
import { log } from './audit.service';

interface CreateExpedienteData {
  code: string;
  name: string;
  description?: string;
}

interface UpdateExpedienteData {
  name?: string;
  description?: string;
}

interface ExpedienteFilters {
  search?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export const getAllExpedientes = async (
  filters: ExpedienteFilters = {},
  pagination: PaginationParams = {}
) => {
  const { search } = filters;
  const page = pagination.page || 1;
  const limit = pagination.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.OR = [
      { code: { contains: search } },
      { name: { contains: search } }
    ];
  }

  const [expedientes, total] = await Promise.all([
    prisma.expediente.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
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
    prisma.expediente.count({ where })
  ]);

  return {
    data: expedientes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

export const getExpedienteById = async (id: string) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id },
    include: {
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
          fileName: true,
          fileSize: true,
          currentVersion: true,
          ocrStatus: true,
          createdAt: true,
          documentType: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          office: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          archivador: {
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        },
        orderBy: { documentDate: 'desc' }
      },
      _count: {
        select: {
          documents: true
        }
      }
    }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  return expediente;
};

export const createExpediente = async (
  expedienteData: CreateExpedienteData,
  req: Request
) => {
  const existingExpediente = await prisma.expediente.findUnique({
    where: { code: expedienteData.code }
  });

  if (existingExpediente) {
    throw new Error('Ya existe un expediente con este código');
  }

  const expediente = await prisma.expediente.create({
    data: {
      code: expedienteData.code,
      name: expedienteData.name,
      description: expedienteData.description,
      createdBy: req.user!.id
    },
    include: {
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
    action: 'EXPEDIENTE_CREATED',
    module: 'expedientes',
    entityType: 'Expediente',
    entityId: expediente.id,
    newValue: {
      code: expediente.code,
      name: expediente.name,
      description: expediente.description
    },
    req
  });

  return expediente;
};

export const updateExpediente = async (
  id: string,
  expedienteData: UpdateExpedienteData,
  req: Request
) => {
  const existingExpediente = await prisma.expediente.findUnique({
    where: { id }
  });

  if (!existingExpediente) {
    throw new Error('Expediente no encontrado');
  }

  const dataToUpdate: any = {
    name: expedienteData.name,
    description: expedienteData.description
  };

  Object.keys(dataToUpdate).forEach(
    key => dataToUpdate[key] === undefined && delete dataToUpdate[key]
  );

  const updatedExpediente = await prisma.expediente.update({
    where: { id },
    data: dataToUpdate,
    include: {
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
    action: 'EXPEDIENTE_UPDATED',
    module: 'expedientes',
    entityType: 'Expediente',
    entityId: id,
    oldValue: {
      name: existingExpediente.name,
      description: existingExpediente.description
    },
    newValue: {
      name: updatedExpediente.name,
      description: updatedExpediente.description
    },
    req
  });

  return updatedExpediente;
};

export const deleteExpediente = async (id: string, req: Request) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  if (expediente._count.documents > 0) {
    throw new Error('No se puede eliminar el expediente porque tiene documentos asociados');
  }

  await prisma.expediente.delete({
    where: { id }
  });

  await log({
    userId: req.user!.id,
    action: 'EXPEDIENTE_DELETED',
    module: 'expedientes',
    entityType: 'Expediente',
    entityId: id,
    oldValue: {
      code: expediente.code,
      name: expediente.name,
      description: expediente.description
    },
    newValue: null,
    req
  });
};

export const addDocumentsToExpediente = async (
  expedienteId: string,
  documentIds: string[],
  req: Request
) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const documents = await prisma.document.findMany({
    where: {
      id: { in: documentIds }
    }
  });

  if (documents.length !== documentIds.length) {
    throw new Error('Uno o más documentos no existen');
  }

  const documentsAlreadyInExpediente = documents.filter(
    doc => doc.expedienteId && doc.expedienteId !== expedienteId
  );

  if (documentsAlreadyInExpediente.length > 0) {
    throw new Error('Uno o más documentos ya están asociados a otro expediente');
  }

  await prisma.document.updateMany({
    where: {
      id: { in: documentIds }
    },
    data: {
      expedienteId: expedienteId
    }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENTS_ADDED_TO_EXPEDIENTE',
    module: 'expedientes',
    entityType: 'Expediente',
    entityId: expedienteId,
    newValue: {
      expedienteCode: expediente.code,
      expedienteName: expediente.name,
      documentIds: documentIds,
      documentCount: documentIds.length
    },
    req
  });

  const updatedExpediente = await getExpedienteById(expedienteId);
  return updatedExpediente;
};

export const removeDocumentsFromExpediente = async (
  expedienteId: string,
  documentIds: string[],
  req: Request
) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const documents = await prisma.document.findMany({
    where: {
      id: { in: documentIds },
      expedienteId: expedienteId
    }
  });

  if (documents.length !== documentIds.length) {
    throw new Error('Uno o más documentos no pertenecen a este expediente');
  }

  await prisma.document.updateMany({
    where: {
      id: { in: documentIds }
    },
    data: {
      expedienteId: null
    }
  });

  await log({
    userId: req.user!.id,
    action: 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE',
    module: 'expedientes',
    entityType: 'Expediente',
    entityId: expedienteId,
    oldValue: {
      expedienteCode: expediente.code,
      expedienteName: expediente.name,
      documentIds: documentIds,
      documentCount: documentIds.length
    },
    newValue: null,
    req
  });

  const updatedExpediente = await getExpedienteById(expedienteId);
  return updatedExpediente;
};

export const searchExpedientes = async (query: string) => {
  const expedientes = await prisma.expediente.findMany({
    where: {
      OR: [
        { code: { contains: query } },
        { name: { contains: query } }
      ]
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { documents: true }
      }
    }
  });

  return expedientes;
};

export const getExpedientesStats = async () => {
  const [
    totalExpedientes,
    documentosData,
    expedientesPorOficina,
    expedientesRecientes,
    allExpedientes
  ] = await Promise.all([
    prisma.expediente.count(),
    prisma.document.aggregate({
      where: { expedienteId: { not: null } },
      _count: true
    }),
    prisma.document.groupBy({
      by: ['officeId'],
      where: { expedienteId: { not: null } },
      _count: { expedienteId: true }
    }),
    prisma.expediente.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
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
    prisma.expediente.findMany({
      select: {
        _count: {
          select: { documents: true }
        }
      }
    })
  ]);

  const documentosTotales = documentosData._count;
  const promedioDocumentosPorExpediente = totalExpedientes > 0 
    ? Math.round((documentosTotales / totalExpedientes) * 10) / 10 
    : 0;

  const officeIds = expedientesPorOficina.map(e => e.officeId).filter(Boolean) as string[];
  const offices = officeIds.length > 0 
    ? await prisma.office.findMany({
        where: { id: { in: officeIds } },
        select: { id: true, name: true }
      })
    : [];

  const officeMap = new Map(offices.map(o => [o.id, o.name]));

  const expedientesPorOficinaWithNames = expedientesPorOficina.map(item => ({
    officeId: item.officeId,
    officeName: officeMap.get(item.officeId) || 'Sin Oficina',
    count: item._count.expedienteId
  }));

  const distribucionPorTamano = {
    pequenos: allExpedientes.filter(e => e._count.documents >= 1 && e._count.documents <= 10).length,
    medianos: allExpedientes.filter(e => e._count.documents >= 11 && e._count.documents <= 50).length,
    grandes: allExpedientes.filter(e => e._count.documents >= 51).length
  };

  return {
    totalExpedientes,
    documentosTotales,
    promedioDocumentosPorExpediente,
    expedientesPorOficina: expedientesPorOficinaWithNames,
    expedientesRecientes,
    distribucionPorTamano
  };
};

export const getExpedienteAnalytics = async (expedienteId: string) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId },
    include: {
      documents: {
        include: {
          documentType: {
            select: { id: true, name: true, code: true }
          },
          office: {
            select: { id: true, name: true, code: true }
          },
          creator: {
            select: { id: true, username: true, firstName: true, lastName: true }
          },
          signatures: {
            select: { id: true, status: true }
          }
        }
      }
    }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const totalDocumentos = expediente.documents.length;

  const distribucionPorTipo = expediente.documents.reduce((acc: any[], doc) => {
    const tipoNombre = doc.documentType?.name || 'Sin Tipo';
    const existing = acc.find(item => item.name === tipoNombre);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: tipoNombre, count: 1 });
    }
    return acc;
  }, []);

  const timelineAdicion = expediente.documents.reduce((acc: any[], doc) => {
    const mes = new Date(doc.createdAt).toISOString().substring(0, 7);
    const existing = acc.find(item => item.mes === mes);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ mes, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.mes.localeCompare(b.mes));

  const oficinasRepresentadas = expediente.documents.reduce((acc: any[], doc) => {
    const oficinaId = doc.office?.id;
    const oficinaNombre = doc.office?.name || 'Sin Oficina';
    const existing = acc.find(item => item.officeId === oficinaId);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ officeId: oficinaId, name: oficinaNombre, count: 1 });
    }
    return acc;
  }, []);

  const usuariosAgregaron = expediente.documents.reduce((acc: any[], doc) => {
    const usuarioId = doc.creator?.id;
    const usuarioNombre = doc.creator ? `${doc.creator.firstName} ${doc.creator.lastName}` : 'Desconocido';
    const existing = acc.find(item => item.userId === usuarioId);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ userId: usuarioId, name: usuarioNombre, count: 1 });
    }
    return acc;
  }, []);

  const documentosFirmados = expediente.documents.filter(doc => 
    doc.signatures && doc.signatures.length > 0 && 
    doc.signatures.some(sig => sig.status === 'FIRMADO')
  ).length;

  const documentosPendientes = expediente.documents.filter(doc => 
    doc.signatures && doc.signatures.length > 0 && 
    doc.signatures.some(sig => sig.status === 'PENDIENTE')
  ).length;

  return {
    expedienteId,
    expedienteCodigo: expediente.code,
    expedienteNombre: expediente.name,
    totalDocumentos,
    distribucionPorTipo,
    timelineAdicion,
    oficinasRepresentadas,
    usuariosAgregaron,
    estadoFirmas: {
      firmados: documentosFirmados,
      pendientes: documentosPendientes,
      sinFirmar: totalDocumentos - documentosFirmados - documentosPendientes
    }
  };
};

export const getExpedienteActivity = async (
  expedienteId: string,
  page: number = 1,
  limit: number = 20
) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const skip = (page - 1) * limit;

  const where = {
    OR: [
      {
        entityType: 'Expediente',
        entityId: expedienteId
      },
      {
        entityType: 'Document',
        action: {
          in: [
            'DOCUMENTS_ADDED_TO_EXPEDIENTE',
            'DOCUMENTS_REMOVED_FROM_EXPEDIENTE'
          ]
        },
        entityId: expedienteId
      }
    ]
  };

  const [activities, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.auditLog.count({ where })
  ]);

  const enrichedActivities = await Promise.all(
    activities.map(async (activity) => {
      let details: any = {
        action: activity.action,
        module: activity.module
      };

      if (activity.action === 'DOCUMENTS_ADDED_TO_EXPEDIENTE' && activity.newValue) {
        const newValue = activity.newValue as any;
        if (newValue.documentIds && Array.isArray(newValue.documentIds)) {
          const documents = await prisma.document.findMany({
            where: { id: { in: newValue.documentIds } },
            select: {
              id: true,
              documentNumber: true,
              documentType: {
                select: { name: true }
              }
            }
          });
          details.documents = documents;
          details.count = documents.length;
        }
      }

      if (activity.action === 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE' && activity.oldValue) {
        const oldValue = activity.oldValue as any;
        if (oldValue.documentIds && Array.isArray(oldValue.documentIds)) {
          details.count = oldValue.documentIds.length;
          details.documentIds = oldValue.documentIds;
        }
      }

      if (activity.action === 'EXPEDIENTE_CREATED' && activity.newValue) {
        details.expedienteData = activity.newValue;
      }

      if (activity.action === 'EXPEDIENTE_UPDATED') {
        details.changes = {
          old: activity.oldValue,
          new: activity.newValue
        };
      }

      return {
        id: activity.id,
        action: activity.action,
        module: activity.module,
        timestamp: activity.createdAt,
        user: activity.user,
        details,
        ipAddress: activity.ipAddress
      };
    })
  );

  return {
    activities: enrichedActivities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export default {
  getAllExpedientes,
  getExpedienteById,
  createExpediente,
  updateExpediente,
  deleteExpediente,
  addDocumentsToExpediente,
  removeDocumentsFromExpediente,
  searchExpedientes,
  getExpedientesStats,
  getExpedienteAnalytics,
  getExpedienteActivity
};
