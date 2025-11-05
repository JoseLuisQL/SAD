import prisma from '../config/database';

interface DashboardCache {
  data: DashboardSnapshot;
  timestamp: number;
  userId: string;
  role: string;
  range?: string;
  officeId?: string;
}

interface DashboardSnapshot {
  cards: {
    totalDocuments: number;
    totalArchivadores: number;
    totalExpedientes: number;
    signaturesCompleted: number;
    signaturesPartial: number;
    signaturesPending: number;
  };
  trends: {
    documentsCreated: Array<{ week: string; count: number }>;
    signaturesCompleted: Array<{ week: string; count: number }>;
  };
  distributions: {
    byOffice: Array<{ officeId: string; officeName: string; count: number; percentage: number }>;
    byDocumentType: Array<{ typeId: string; typeName: string; count: number; percentage: number }>;
  };
  alerts: Array<{
    id: string;
    type: 'OCR_PENDING' | 'SIGNATURE_EXPIRED' | 'ARCHIVADOR_FULL';
    severity: 'low' | 'medium' | 'high';
    title: string;
    description: string;
    count?: number;
    entityId?: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    module: string;
    user: {
      username: string;
      fullName: string;
    };
    timestamp: Date;
  }>;
}

const dashboardCache = new Map<string, DashboardCache>();
const CACHE_TTL = 60 * 1000; // 60 segundos

interface GlobalMetrics {
  archivadores: {
    total: number;
    documentosTotal: number;
    capacidadUtilizada: number;
  };
  documentos: {
    total: number;
    nuevosUltimos30Dias: number;
    conFirmaDigital: number;
    sinFirmaDigital: number;
    erroresOCR: number;
    pendientesOCR: number;
  };
  expedientes: {
    total: number;
    conDocumentos: number;
    sinDocumentos: number;
    promedioDocumentosPorExpediente: number;
  };
}

interface DocumentMetrics {
  totalDocuments: number;
  newDocuments: number;
  signedDocuments: number;
  unsignedDocuments: number;
  partiallySignedDocuments: number;
  ocrPendingDocuments: number;
  ocrErrorDocuments: number;
  ocrCompletedDocuments: number;
  documentsByType: Array<{
    typeId: string;
    typeName: string;
    count: number;
    percentage: number;
  }>;
  documentsByOffice: Array<{
    officeId: string;
    officeName: string;
    count: number;
    percentage: number;
  }>;
  documentsByMonth: Array<{
    month: string;
    count: number;
  }>;
  averageFolioCount: number;
  topSenders: Array<{
    sender: string;
    count: number;
  }>;
}

interface PeriodFilter {
  startDate: Date;
  endDate: Date;
}

export const getGlobalOverview = async (): Promise<GlobalMetrics> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    archivadoresCount,
    documentosTotal,
    documentosUltimos30Dias,
    documentosConFirma,
    documentosSinFirma,
    documentosErrorOCR,
    documentosPendientesOCR,
    expedientesTotal,
    expedientesConDocumentos
  ] = await Promise.all([
    prisma.archivador.count(),
    prisma.document.count(),
    prisma.document.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    }),
    prisma.document.count({
      where: {
        signatureStatus: { in: ['SIGNED', 'PARTIALLY_SIGNED'] }
      }
    }),
    prisma.document.count({
      where: {
        signatureStatus: 'UNSIGNED'
      }
    }),
    prisma.document.count({
      where: {
        ocrStatus: 'ERROR'
      }
    }),
    prisma.document.count({
      where: {
        ocrStatus: 'PENDING'
      }
    }),
    prisma.expediente.count(),
    prisma.expediente.count({
      where: {
        documents: {
          some: {}
        }
      }
    })
  ]);

  const capacidadEstimadaPorArchivador = 100;
  const capacidadTotal = archivadoresCount * capacidadEstimadaPorArchivador;
  const capacidadUtilizada = capacidadTotal > 0 
    ? Math.round((documentosTotal / capacidadTotal) * 100) 
    : 0;

  const expedientesConDocs = expedientesConDocumentos;
  const expedientesSinDocs = expedientesTotal - expedientesConDocs;
  
  const promedioDocsPorExpediente = expedientesConDocs > 0
    ? Math.round((documentosTotal / expedientesConDocs) * 100) / 100
    : 0;

  return {
    archivadores: {
      total: archivadoresCount,
      documentosTotal: documentosTotal,
      capacidadUtilizada
    },
    documentos: {
      total: documentosTotal,
      nuevosUltimos30Dias: documentosUltimos30Dias,
      conFirmaDigital: documentosConFirma,
      sinFirmaDigital: documentosSinFirma,
      erroresOCR: documentosErrorOCR,
      pendientesOCR: documentosPendientesOCR
    },
    expedientes: {
      total: expedientesTotal,
      conDocumentos: expedientesConDocs,
      sinDocumentos: expedientesSinDocs,
      promedioDocumentosPorExpediente: promedioDocsPorExpediente
    }
  };
};

export const getDocumentMetrics = async (period?: PeriodFilter): Promise<DocumentMetrics> => {
  const whereClause: any = {};
  
  if (period) {
    whereClause.documentDate = {
      gte: period.startDate,
      lte: period.endDate
    };
  }

  const [
    totalDocuments,
    documents,
    signedDocuments,
    unsignedDocuments,
    partiallySignedDocuments,
    ocrPendingDocuments,
    ocrErrorDocuments,
    ocrCompletedDocuments
  ] = await Promise.all([
    prisma.document.count({ where: whereClause }),
    prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        documentDate: true,
        folioCount: true,
        sender: true,
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
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        signatureStatus: 'SIGNED'
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        signatureStatus: 'UNSIGNED'
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        signatureStatus: 'PARTIALLY_SIGNED'
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        ocrStatus: 'PENDING'
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        ocrStatus: 'ERROR'
      }
    }),
    prisma.document.count({
      where: {
        ...whereClause,
        ocrStatus: 'COMPLETED'
      }
    })
  ]);

  let newDocuments = 0;
  if (period) {
    newDocuments = totalDocuments;
  } else {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    newDocuments = await prisma.document.count({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      }
    });
  }

  const documentsByTypeMap: { [key: string]: { id: string; name: string; count: number } } = {};
  const documentsByOfficeMap: { [key: string]: { id: string; name: string; count: number } } = {};
  const documentsByMonthMap: { [key: string]: number } = {};
  const senderCountMap: { [key: string]: number } = {};
  let totalFolios = 0;

  documents.forEach(doc => {
    const typeKey = doc.documentType.id;
    if (!documentsByTypeMap[typeKey]) {
      documentsByTypeMap[typeKey] = {
        id: doc.documentType.id,
        name: doc.documentType.name,
        count: 0
      };
    }
    documentsByTypeMap[typeKey].count++;

    const officeKey = doc.office.id;
    if (!documentsByOfficeMap[officeKey]) {
      documentsByOfficeMap[officeKey] = {
        id: doc.office.id,
        name: doc.office.name,
        count: 0
      };
    }
    documentsByOfficeMap[officeKey].count++;

    const date = new Date(doc.documentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    documentsByMonthMap[monthKey] = (documentsByMonthMap[monthKey] || 0) + 1;

    senderCountMap[doc.sender] = (senderCountMap[doc.sender] || 0) + 1;
    totalFolios += doc.folioCount;
  });

  const documentsByType = Object.values(documentsByTypeMap).map(type => ({
    typeId: type.id,
    typeName: type.name,
    count: type.count,
    percentage: totalDocuments > 0 ? Math.round((type.count / totalDocuments) * 10000) / 100 : 0
  }));

  const documentsByOffice = Object.values(documentsByOfficeMap).map(office => ({
    officeId: office.id,
    officeName: office.name,
    count: office.count,
    percentage: totalDocuments > 0 ? Math.round((office.count / totalDocuments) * 10000) / 100 : 0
  }));

  const documentsByMonth = Object.entries(documentsByMonthMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  const topSenders = Object.entries(senderCountMap)
    .map(([sender, count]) => ({ sender, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const averageFolioCount = totalDocuments > 0 
    ? Math.round((totalFolios / totalDocuments) * 100) / 100 
    : 0;

  return {
    totalDocuments,
    newDocuments,
    signedDocuments,
    unsignedDocuments,
    partiallySignedDocuments,
    ocrPendingDocuments,
    ocrErrorDocuments,
    ocrCompletedDocuments,
    documentsByType,
    documentsByOffice,
    documentsByMonth,
    averageFolioCount,
    topSenders
  };
};

export const getArchivadorMetrics = async (archivadorId: string) => {
  const archivador = await prisma.archivador.findUnique({
    where: { id: archivadorId },
    include: {
      period: true,
      documents: {
        include: {
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
        }
      }
    }
  });

  if (!archivador) {
    throw new Error('Archivador no encontrado');
  }

  const totalDocuments = archivador.documents.length;
  const totalFolios = archivador.documents.reduce((sum, doc) => sum + doc.folioCount, 0);

  const signedDocuments = archivador.documents.filter(
    doc => doc.signatureStatus === 'SIGNED'
  ).length;
  
  const ocrCompletedDocuments = archivador.documents.filter(
    doc => doc.ocrStatus === 'COMPLETED'
  ).length;

  const documentsByType = archivador.documents.reduce((acc: any[], doc) => {
    const existing = acc.find(item => item.typeId === doc.documentType.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        typeId: doc.documentType.id,
        typeName: doc.documentType.name,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const documentsByOffice = archivador.documents.reduce((acc: any[], doc) => {
    const existing = acc.find(item => item.officeId === doc.office.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        officeId: doc.office.id,
        officeName: doc.office.name,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const documentsByMonth = archivador.documents.reduce((acc: any[], doc) => {
    const date = new Date(doc.documentDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ month, count: 1 });
    }
    return acc;
  }, []).sort((a, b) => a.month.localeCompare(b.month));

  const capacidadEstimada = 100;
  const porcentajeOcupacion = Math.round((totalDocuments / capacidadEstimada) * 100);
  
  let estadoArchivador = 'vacio';
  if (porcentajeOcupacion >= 71) {
    estadoArchivador = 'lleno';
  } else if (porcentajeOcupacion >= 31) {
    estadoArchivador = 'medio';
  }

  return {
    totalDocuments,
    totalFolios,
    signedDocuments,
    ocrCompletedDocuments,
    documentsByType,
    documentsByOffice,
    documentsByMonth,
    estadoArchivador,
    porcentajeOcupacion,
    averageFolioCount: totalDocuments > 0 
      ? Math.round((totalFolios / totalDocuments) * 100) / 100 
      : 0
  };
};

export const getExpedienteMetrics = async (expedienteId: string) => {
  const expediente = await prisma.expediente.findUnique({
    where: { id: expedienteId },
    include: {
      documents: {
        include: {
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
          },
          archivador: {
            select: {
              id: true,
              code: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!expediente) {
    throw new Error('Expediente no encontrado');
  }

  const totalDocuments = expediente.documents.length;
  const totalFolios = expediente.documents.reduce((sum, doc) => sum + doc.folioCount, 0);

  const signedDocuments = expediente.documents.filter(
    doc => doc.signatureStatus === 'SIGNED'
  ).length;

  const documentsByType = expediente.documents.reduce((acc: any[], doc) => {
    const existing = acc.find(item => item.typeId === doc.documentType.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        typeId: doc.documentType.id,
        typeName: doc.documentType.name,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  const documentsByArchivador = expediente.documents.reduce((acc: any[], doc) => {
    const existing = acc.find(item => item.archivadorId === doc.archivador.id);
    if (existing) {
      existing.count++;
    } else {
      acc.push({
        archivadorId: doc.archivador.id,
        archivadorCode: doc.archivador.code,
        archivadorName: doc.archivador.name,
        count: 1
      });
    }
    return acc;
  }, []).sort((a, b) => b.count - a.count);

  return {
    totalDocuments,
    totalFolios,
    signedDocuments,
    documentsByType,
    documentsByArchivador,
    averageFolioCount: totalDocuments > 0 
      ? Math.round((totalFolios / totalDocuments) * 100) / 100 
      : 0
  };
};

export const getDashboardSnapshot = async (
  userId: string,
  role: string,
  permissions: Record<string, any>,
  options?: { range?: '7d' | '30d' | '90d'; officeId?: string }
): Promise<DashboardSnapshot> => {
  const { range = '90d', officeId } = options || {};

  const cacheKey = `${userId}-${role}-${range}-${officeId || 'all'}`;
  const cached = dashboardCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('📊 Dashboard data from cache');
    return cached.data;
  }

  console.log('📊 Calculating dashboard data...');

  // Verificar permisos del usuario para filtrar datos
  const hasModule = (module: string): boolean => {
    if (!permissions || typeof permissions !== 'object') return false;
    const modulePerms = permissions[module];
    if (!modulePerms || typeof modulePerms !== 'object') return false;
    return Object.values(modulePerms).some(value => value === true);
  };

  const canViewDocuments = hasModule('documents');
  const canViewArchivadores = hasModule('archivadores');
  const canViewExpedientes = hasModule('expedientes');
  const canViewSignatures = hasModule('signing') || hasModule('signatureFlows');
  const canViewAudit = hasModule('audit');

  const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
  const daysAgo = daysMap[range];
  const dateFrom = new Date();
  dateFrom.setDate(dateFrom.getDate() - daysAgo);

  const whereClause: any = {};

  if (officeId) {
    whereClause.officeId = officeId;
  }

  const dateRangeWhere = {
    ...whereClause,
    createdAt: { gte: dateFrom }
  };

  const [
    totalDocuments,
    totalArchivadores,
    totalExpedientes,
    signaturesCompleted,
    signaturesPartial,
    signaturesPending,
    documentsInRange,
    signaturesInRange,
    documentsByOffice,
    documentsByType,
    ocrPendingCount,
    archivadoresWithOccupancy,
    recentAuditLogs
  ] = await Promise.all([
    canViewDocuments ? prisma.document.count({ where: whereClause }) : 0,
    canViewArchivadores ? prisma.archivador.count() : 0,
    canViewExpedientes ? prisma.expediente.count() : 0,
    canViewSignatures ? prisma.document.count({
      where: { ...whereClause, signatureStatus: 'SIGNED' }
    }) : 0,
    canViewSignatures ? prisma.document.count({
      where: { ...whereClause, signatureStatus: 'PARTIALLY_SIGNED' }
    }) : 0,
    canViewSignatures ? prisma.document.count({
      where: { ...whereClause, signatureStatus: 'UNSIGNED' }
    }) : 0,
    canViewDocuments ? prisma.document.findMany({
      where: dateRangeWhere,
      select: {
        id: true,
        createdAt: true,
        signatureStatus: true
      }
    }) : [],
    canViewSignatures ? prisma.signature.findMany({
      where: {
        timestamp: { gte: dateFrom },
        isReverted: false
      },
      select: {
        id: true,
        timestamp: true
      }
    }) : [],
    canViewDocuments ? prisma.document.groupBy({
      by: ['officeId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }},
      take: 6
    }) : [],
    canViewDocuments ? prisma.document.groupBy({
      by: ['documentTypeId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }},
      take: 6
    }) : [],
    canViewDocuments ? prisma.document.count({
      where: { ...whereClause, ocrStatus: 'PENDING' }
    }) : 0,
    canViewArchivadores ? prisma.archivador.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        _count: {
          select: { documents: true }
        }
      }
    }) : [],
    canViewAudit ? prisma.auditLog.findMany({
      where: { 
        createdAt: { gte: dateFrom }
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        action: true,
        module: true,
        createdAt: true
      }
    }).catch(() => []) : []
  ]);

  const cards = {
    totalDocuments,
    totalArchivadores,
    totalExpedientes,
    signaturesCompleted,
    signaturesPartial,
    signaturesPending
  };

  const weeklyDocsMap: Record<string, number> = {};
  const weeklySigsMap: Record<string, number> = {};

  documentsInRange.forEach(doc => {
    const weekStart = getWeekStart(doc.createdAt);
    weeklyDocsMap[weekStart] = (weeklyDocsMap[weekStart] || 0) + 1;
  });

  signaturesInRange.forEach(sig => {
    const weekStart = getWeekStart(sig.timestamp);
    weeklySigsMap[weekStart] = (weeklySigsMap[weekStart] || 0) + 1;
  });

  const documentsCreated = Object.entries(weeklyDocsMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const signaturesCompletedTrend = Object.entries(weeklySigsMap)
    .map(([week, count]) => ({ week, count }))
    .sort((a, b) => a.week.localeCompare(b.week));

  const trends = {
    documentsCreated,
    signaturesCompleted: signaturesCompletedTrend
  };

  const officeIds = documentsByOffice.map(d => d.officeId);
  const offices = await prisma.office.findMany({
    where: { id: { in: officeIds }},
    select: { id: true, name: true }
  });

  const byOfficeData = documentsByOffice.slice(0, 5).map(item => {
    const office = offices.find(o => o.id === item.officeId);
    return {
      officeId: item.officeId,
      officeName: office?.name || 'Desconocida',
      count: item._count.id,
      percentage: totalDocuments > 0 ? Math.round((item._count.id / totalDocuments) * 10000) / 100 : 0
    };
  });

  if (documentsByOffice.length > 5) {
    const othersCount = documentsByOffice.slice(5).reduce((sum, item) => sum + item._count.id, 0);
    byOfficeData.push({
      officeId: 'others',
      officeName: 'Otros',
      count: othersCount,
      percentage: totalDocuments > 0 ? Math.round((othersCount / totalDocuments) * 10000) / 100 : 0
    });
  }

  const typeIds = documentsByType.map(d => d.documentTypeId);
  const types = await prisma.documentType.findMany({
    where: { id: { in: typeIds }},
    select: { id: true, name: true }
  });

  const byTypeData = documentsByType.slice(0, 5).map(item => {
    const type = types.find(t => t.id === item.documentTypeId);
    return {
      typeId: item.documentTypeId,
      typeName: type?.name || 'Desconocido',
      count: item._count.id,
      percentage: totalDocuments > 0 ? Math.round((item._count.id / totalDocuments) * 10000) / 100 : 0
    };
  });

  if (documentsByType.length > 5) {
    const othersCount = documentsByType.slice(5).reduce((sum, item) => sum + item._count.id, 0);
    byTypeData.push({
      typeId: 'others',
      typeName: 'Otros',
      count: othersCount,
      percentage: totalDocuments > 0 ? Math.round((othersCount / totalDocuments) * 10000) / 100 : 0
    });
  }

  const distributions = {
    byOffice: byOfficeData,
    byDocumentType: byTypeData
  };

  const alerts: DashboardSnapshot['alerts'] = [];

  if (ocrPendingCount > 0) {
    alerts.push({
      id: 'ocr-pending',
      type: 'OCR_PENDING',
      severity: ocrPendingCount > 10 ? 'high' : 'medium',
      title: 'Documentos con OCR pendiente',
      description: `Hay ${ocrPendingCount} documento${ocrPendingCount !== 1 ? 's' : ''} esperando procesamiento OCR`,
      count: ocrPendingCount
    });
  }

  if (canViewArchivadores) {
    archivadoresWithOccupancy.forEach(arch => {
      const docsCount = arch._count.documents;
      const occupancy = (docsCount / 100) * 100;
      
      if (occupancy > 85) {
        alerts.push({
          id: `archivador-full-${arch.id}`,
          type: 'ARCHIVADOR_FULL',
          severity: occupancy > 95 ? 'high' : 'medium',
          title: 'Archivador con alta ocupación',
          description: `${arch.name} (${arch.code}) está al ${Math.round(occupancy)}% de capacidad`,
          entityId: arch.id
        });
      }
    });
  }

  // Load users for recent activity separately
  const userIds = [...new Set(recentAuditLogs.map(log => log.userId))];
  const activityUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true
    }
  });
  const userMap = new Map(activityUsers.map(u => [u.id, u]));

  const recentActivity = recentAuditLogs.map(log => {
    const user = userMap.get(log.userId);
    return {
      id: log.id,
      action: log.action,
      module: log.module,
      user: {
        username: user?.username || 'Desconocido',
        fullName: user ? `${user.firstName} ${user.lastName}` : 'Usuario eliminado'
      },
      timestamp: log.createdAt
    };
  });

  const snapshot: DashboardSnapshot = {
    cards,
    trends,
    distributions,
    alerts,
    recentActivity
  };

  dashboardCache.set(cacheKey, {
    data: snapshot,
    timestamp: Date.now(),
    userId,
    role,
    range,
    officeId
  });

  return snapshot;
};

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

export const invalidateDashboardCache = () => {
  dashboardCache.clear();
  console.log('🗑️ Dashboard cache cleared');
};

export default {
  getGlobalOverview,
  getDocumentMetrics,
  getArchivadorMetrics,
  getExpedienteMetrics,
  getDashboardSnapshot,
  invalidateDashboardCache
};
