import { Request } from 'express';
import prisma from '../config/database';

export type AuditAction = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'PROFILE_UPDATED'
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGED'
  | 'ROLE_CREATED'
  | 'ROLE_UPDATED'
  | 'ROLE_DELETED'
  | 'ROLE_DUPLICATED'
  | 'OFFICE_CREATED'
  | 'OFFICE_UPDATED'
  | 'OFFICE_DELETED'
  | 'DOCUMENT_TYPE_CREATED'
  | 'DOCUMENT_TYPE_UPDATED'
  | 'DOCUMENT_TYPE_DELETED'
  | 'PERIOD_CREATED'
  | 'PERIOD_UPDATED'
  | 'PERIOD_DELETED'
  | 'ARCHIVADOR_CREATED'
  | 'ARCHIVADOR_UPDATED'
  | 'ARCHIVADOR_DELETED'
  | 'DOCUMENT_CREATED'
  | 'DOCUMENT_UPDATED'
  | 'DOCUMENT_DELETED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_SIGNED'
  | 'DOCUMENT_SIGN_ATTEMPT'
  | 'DOCUMENT_SIGN_FAILED'
  | 'DOCUMENT_BATCH_SIGN_ATTEMPT'
  | 'DOCUMENT_BATCH_SIGN_COMPLETED'
  | 'VERSION_CREATED'
  | 'VERSION_RESTORED'
  | 'VERSION_DOWNLOADED'
  | 'EXPEDIENTE_CREATED'
  | 'EXPEDIENTE_UPDATED'
  | 'EXPEDIENTE_DELETED'
  | 'DOCUMENTS_ADDED_TO_EXPEDIENTE'
  | 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE'
  | 'SEARCH_PERFORMED'
  | 'SIGNATURE_VERIFIED'
  | 'SIGNATURE_VERIFIED_UPLOAD'
  | 'SIGNATURE_VERIFICATION_FAILED'
  | 'SIGNATURE_FLOW_CREATED'
  | 'SIGNATURE_FLOW_ADVANCED'
  | 'SIGNATURE_FLOW_ADVANCE_ERROR'
  | 'SIGNATURE_FLOW_CANCELLED'
  | 'SIGNATURES_REVERTED'
  | 'REVERTED_TO_VERSION'
  | 'REPORT_GENERATED'
  | 'REPORT_EXPORTED'
  | 'TOUR_COMPLETED'
  | 'TOUR_SKIPPED'
  | 'CONFIGURATION_UPDATED'
  | 'BRAND_ASSETS_UPDATED'
  | 'BRAND_ASSET_REMOVED'
  | 'DASHBOARD_VIEW'
  | 'BACKUP_STARTED'
  | 'BACKUP_COMPLETED'
  | 'BACKUP_FAILED'
  | 'BACKUP_DOWNLOADED'
  | 'RESTORE_STARTED'
  | 'RESTORE_COMPLETED'
  | 'RESTORE_FAILED';

interface LogOptions {
  userId: string;
  action: AuditAction;
  module: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  req?: Request;
}

interface GetAuditLogsFilters {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const log = async ({
  userId,
  action,
  module,
  entityType,
  entityId,
  oldValue,
  newValue,
  req
}: LogOptions): Promise<void> => {
  try {
    const ipAddress = req 
      ? (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown')
      : 'system';
    
    const userAgent = req?.headers['user-agent'] || 'system';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        module,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
        newValue: newValue ? JSON.stringify(newValue) : undefined,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error al registrar auditoría:', error);
  }
};

export const getAuditLogs = async (filters: GetAuditLogsFilters) => {
  const {
    page = 1,
    limit = 10,
    userId,
    action,
    module,
    dateFrom,
    dateTo
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = action;
  }

  if (module) {
    where.module = module;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  // Obtener IDs de usuarios que existen para filtrar logs
  const existingUserIds = await prisma.user.findMany({
    select: { id: true }
  }).then(users => users.map(u => u.id));

  // Agregar filtro para excluir logs de usuarios eliminados
  const whereWithUserExists = {
    ...where,
    userId: {
      in: existingUserIds
    }
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: whereWithUserExists,
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
    prisma.auditLog.count({ where: whereWithUserExists })
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    logs,
    total,
    page,
    limit,
    totalPages
  };
};

export const getAuditLogById = async (id: string) => {
  const log = await prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: true
    }
  });

  if (!log) {
    throw new Error('Log de auditoría no encontrado');
  }

  // Si el usuario fue eliminado, crear un objeto de usuario placeholder
  if (!log.user) {
    return {
      ...log,
      user: {
        id: log.userId,
        username: 'Usuario Eliminado',
        firstName: 'Usuario',
        lastName: 'Eliminado',
        email: 'deleted@system.local'
      }
    };
  }

  return log;
};

export const getAuditStats = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    actionsByModule,
    actionsByUser,
    actionsByDay
  ] = await Promise.all([
    prisma.auditLog.groupBy({
      by: ['module'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    }),
    prisma.auditLog.groupBy({
      by: ['userId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    }),
    prisma.$queryRaw<any[]>`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM audit_logs
      WHERE createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `
  ]);

  const userIds = actionsByUser.map(item => item.userId);
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds
      }
    },
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true
    }
  });

  const actionsByUserWithInfo = actionsByUser.map(item => {
    const user = users.find(u => u.id === item.userId);
    return {
      userId: item.userId,
      username: user?.username || 'Unknown',
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      count: item._count.id
    };
  });

  return {
    actionsByModule: actionsByModule.map(item => ({
      module: item.module,
      count: item._count.id
    })),
    actionsByUser: actionsByUserWithInfo,
    actionsByDay: actionsByDay.map(item => ({
      date: item.date,
      count: Number(item.count)
    }))
  };
};

// ==================== ANALYTICS AVANZADOS ====================

interface DateRangeParams {
  dateFrom?: Date;
  dateTo?: Date;
}

export const getAdvancedAnalytics = async ({ dateFrom, dateTo }: DateRangeParams = {}) => {
  const where: any = {};
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [
    totalActions,
    uniqueUsers,
    uniqueModules,
    actionsByType,
    actionsByHour,
    actionsByDayOfWeek,
    topActiveUsers,
    topLessActiveUsers,
    topModules,
    leastUsedModules,
    peakActivityHours,
    actionDistribution
  ] = await Promise.all([
    // Total de acciones
    prisma.auditLog.count({ where }),
    
    // Usuarios únicos activos
    prisma.auditLog.findMany({
      where,
      select: { userId: true },
      distinct: ['userId']
    }),
    
    // Módulos únicos
    prisma.auditLog.findMany({
      where,
      select: { module: true },
      distinct: ['module']
    }),
    
    // Acciones por tipo (CREATE, UPDATE, DELETE, etc.)
    (async () => {
      if (where.createdAt) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            CASE 
              WHEN action LIKE '%CREATED%' THEN 'CREATE'
              WHEN action LIKE '%UPDATED%' THEN 'UPDATE'
              WHEN action LIKE '%DELETED%' THEN 'DELETE'
              WHEN action LIKE '%LOGIN%' OR action LIKE '%LOGOUT%' THEN 'AUTH'
              WHEN action LIKE '%SIGNED%' OR action LIKE '%SIGNATURE%' THEN 'SIGNATURE'
              WHEN action LIKE '%DOWNLOADED%' THEN 'DOWNLOAD'
              ELSE 'OTHER'
            END as actionType,
            COUNT(*) as count
          FROM audit_logs
          WHERE createdAt >= ${where.createdAt.gte} AND createdAt <= ${where.createdAt.lte}
          GROUP BY actionType
          ORDER BY count DESC
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            CASE 
              WHEN action LIKE '%CREATED%' THEN 'CREATE'
              WHEN action LIKE '%UPDATED%' THEN 'UPDATE'
              WHEN action LIKE '%DELETED%' THEN 'DELETE'
              WHEN action LIKE '%LOGIN%' OR action LIKE '%LOGOUT%' THEN 'AUTH'
              WHEN action LIKE '%SIGNED%' OR action LIKE '%SIGNATURE%' THEN 'SIGNATURE'
              WHEN action LIKE '%DOWNLOADED%' THEN 'DOWNLOAD'
              ELSE 'OTHER'
            END as actionType,
            COUNT(*) as count
          FROM audit_logs
          GROUP BY actionType
          ORDER BY count DESC
        `;
      }
    })(),
    
    // Acciones por hora del día
    (async () => {
      if (where.createdAt) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          WHERE createdAt >= ${where.createdAt.gte} AND createdAt <= ${where.createdAt.lte}
          GROUP BY hour
          ORDER BY hour
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          GROUP BY hour
          ORDER BY hour
        `;
      }
    })(),
    
    // Acciones por día de la semana
    (async () => {
      if (where.createdAt) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            DAYOFWEEK(createdAt) as dayOfWeek,
            COUNT(*) as count
          FROM audit_logs
          WHERE createdAt >= ${where.createdAt.gte} AND createdAt <= ${where.createdAt.lte}
          GROUP BY dayOfWeek
          ORDER BY dayOfWeek
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            DAYOFWEEK(createdAt) as dayOfWeek,
            COUNT(*) as count
          FROM audit_logs
          GROUP BY dayOfWeek
          ORDER BY dayOfWeek
        `;
      }
    })(),
    
    // Top usuarios más activos
    prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }},
      take: 10
    }),
    
    // Usuarios menos activos
    prisma.auditLog.groupBy({
      by: ['userId'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'asc' }},
      take: 10
    }),
    
    // Módulos más utilizados
    prisma.auditLog.groupBy({
      by: ['module'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }}
    }),
    
    // Módulos menos utilizados
    prisma.auditLog.groupBy({
      by: ['module'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'asc' }}
    }),
    
    // Horas pico de actividad
    (async () => {
      if (where.createdAt) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          WHERE createdAt >= ${where.createdAt.gte} AND createdAt <= ${where.createdAt.lte}
          GROUP BY hour
          ORDER BY count DESC
          LIMIT 5
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          GROUP BY hour
          ORDER BY count DESC
          LIMIT 5
        `;
      }
    })(),
    
    // Distribución de acciones por tipo
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }},
      take: 10
    })
  ]);

  // Enriquecer datos de usuarios
  const userIds = [...new Set([
    ...topActiveUsers.map(u => u.userId),
    ...topLessActiveUsers.map(u => u.userId)
  ])];

  const users = await prisma.user.findMany({
    where: { id: { in: userIds }},
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true
    }
  });

  const enrichUserData = (item: any) => {
    const user = users.find(u => u.id === item.userId);
    return {
      userId: item.userId,
      username: user?.username || 'Unknown',
      fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      count: item._count.id
    };
  };

  return {
    summary: {
      totalActions,
      uniqueUsers: uniqueUsers.length,
      uniqueModules: uniqueModules.length,
      avgActionsPerUser: totalActions / (uniqueUsers.length || 1)
    },
    actionsByType: actionsByType.map(item => ({
      type: item.actionType,
      count: Number(item.count)
    })),
    actionsByHour: actionsByHour.map(item => ({
      hour: Number(item.hour),
      count: Number(item.count)
    })),
    actionsByDayOfWeek: actionsByDayOfWeek.map(item => ({
      day: Number(item.dayOfWeek), // 1=Sunday, 7=Saturday
      count: Number(item.count)
    })),
    topActiveUsers: topActiveUsers.map(enrichUserData),
    topLessActiveUsers: topLessActiveUsers.map(enrichUserData),
    topModules: topModules.map(item => ({
      module: item.module,
      count: item._count.id
    })),
    leastUsedModules: leastUsedModules.slice(0, 5).map(item => ({
      module: item.module,
      count: item._count.id
    })),
    peakActivityHours: peakActivityHours.map(item => ({
      hour: Number(item.hour),
      count: Number(item.count)
    })),
    actionDistribution: actionDistribution.map(item => ({
      action: item.action,
      count: item._count.id
    }))
  };
};

// ==================== DETECCIÓN DE ANOMALÍAS ====================

interface AnomalyThresholds {
  offHoursStart?: number; // Default: 22 (10 PM)
  offHoursEnd?: number;   // Default: 6 (6 AM)
  maxFailedLogins?: number; // Default: 5
  maxDeletionsPerHour?: number; // Default: 10
  suspiciousActions?: string[]; // Actions to monitor
}

export const detectAnomalies = async (thresholds: AnomalyThresholds = {}) => {
  const {
    offHoursStart = 22,
    offHoursEnd = 6,
    maxFailedLogins = 5,
    maxDeletionsPerHour = 10
  } = thresholds;

  const last24Hours = new Date();
  last24Hours.setHours(last24Hours.getHours() - 24);

  const anomalies: any[] = [];

  // 1. Accesos fuera de horario laboral
  const offHoursAccess = await prisma.$queryRaw<any[]>`
    SELECT 
      id, userId, action, module, createdAt, ipAddress
    FROM audit_logs
    WHERE createdAt >= ${last24Hours}
    AND (HOUR(createdAt) >= ${offHoursStart} OR HOUR(createdAt) < ${offHoursEnd})
    AND action IN ('LOGIN', 'DOCUMENT_DOWNLOADED', 'DOCUMENT_DELETED')
    ORDER BY createdAt DESC
  `;

  for (const access of offHoursAccess) {
    anomalies.push({
      id: `offhours-${access.id}`,
      type: 'OFF_HOURS_ACCESS',
      severity: 'MEDIUM',
      userId: access.userId,
      timestamp: access.createdAt,
      description: `Acceso fuera de horario laboral`,
      details: {
        action: access.action,
        module: access.module,
        ipAddress: access.ipAddress
      }
    });
  }

  // 2. Múltiples intentos de login fallidos
  const failedLogins = await prisma.$queryRaw<any[]>`
    SELECT 
      userId,
      COUNT(*) as attempts,
      MAX(createdAt) as lastAttempt,
      ipAddress
    FROM audit_logs
    WHERE createdAt >= ${last24Hours}
    AND action = 'DOCUMENT_SIGN_FAILED'
    GROUP BY userId, ipAddress
    HAVING attempts >= ${maxFailedLogins}
  `;

  for (const failure of failedLogins) {
    anomalies.push({
      id: `failed-login-${failure.userId}`,
      type: 'MULTIPLE_FAILED_LOGINS',
      severity: 'HIGH',
      userId: failure.userId,
      timestamp: failure.lastAttempt,
      description: `${failure.attempts} intentos fallidos de firma`,
      details: {
        attempts: Number(failure.attempts),
        ipAddress: failure.ipAddress
      }
    });
  }

  // 3. Eliminaciones masivas
  const massiveDeletions = await prisma.$queryRaw<any[]>`
    SELECT 
      userId,
      COUNT(*) as deletions,
      MAX(createdAt) as lastDeletion
    FROM audit_logs
    WHERE createdAt >= ${last24Hours}
    AND action LIKE '%DELETED%'
    GROUP BY userId, HOUR(createdAt)
    HAVING deletions >= ${maxDeletionsPerHour}
  `;

  for (const deletion of massiveDeletions) {
    anomalies.push({
      id: `mass-deletion-${deletion.userId}`,
      type: 'MASSIVE_DELETIONS',
      severity: 'HIGH',
      userId: deletion.userId,
      timestamp: deletion.lastDeletion,
      description: `${deletion.deletions} eliminaciones en una hora`,
      details: {
        count: Number(deletion.deletions)
      }
    });
  }

  // 4. Accesos desde IPs desconocidas (IP que no ha accedido en los últimos 30 días)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentLogins = await prisma.$queryRaw<any[]>`
    SELECT DISTINCT
      al1.userId,
      al1.ipAddress,
      al1.createdAt
    FROM audit_logs al1
    WHERE al1.createdAt >= ${last24Hours}
    AND al1.action = 'LOGIN'
    AND NOT EXISTS (
      SELECT 1 FROM audit_logs al2
      WHERE al2.userId = al1.userId
      AND al2.ipAddress = al1.ipAddress
      AND al2.createdAt >= ${thirtyDaysAgo}
      AND al2.createdAt < ${last24Hours}
    )
  `;

  for (const login of recentLogins) {
    anomalies.push({
      id: `unknown-ip-${login.userId}-${login.ipAddress}`,
      type: 'UNKNOWN_IP_ACCESS',
      severity: 'MEDIUM',
      userId: login.userId,
      timestamp: login.createdAt,
      description: `Acceso desde IP desconocida`,
      details: {
        ipAddress: login.ipAddress
      }
    });
  }

  // Enriquecer con datos de usuario
  const userIds = [...new Set(anomalies.map(a => a.userId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds }},
    select: {
      id: true,
      username: true,
      firstName: true,
      lastName: true
    }
  });

  const enrichedAnomalies = anomalies.map(anomaly => {
    const user = users.find(u => u.id === anomaly.userId);
    return {
      ...anomaly,
      user: user ? {
        username: user.username,
        fullName: `${user.firstName} ${user.lastName}`
      } : null
    };
  });

  return {
    total: enrichedAnomalies.length,
    anomalies: enrichedAnomalies.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return (severityOrder[b.severity as keyof typeof severityOrder] || 0) - 
             (severityOrder[a.severity as keyof typeof severityOrder] || 0);
    })
  };
};

// ==================== PATRÓN DE ACTIVIDAD DE USUARIO ====================

export const getUserActivityPattern = async (userId: string, { dateFrom, dateTo }: DateRangeParams = {}) => {
  const where: any = { userId };
  
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [
    totalActions,
    actionsByModule,
    actionsByHour,
    actionsByDayOfWeek,
    mostCommonActions,
    recentActivity
  ] = await Promise.all([
    // Total de acciones del usuario
    prisma.auditLog.count({ where }),
    
    // Acciones por módulo
    prisma.auditLog.groupBy({
      by: ['module'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }}
    }),
    
    // Horas preferidas de actividad
    (async () => {
      if (dateFrom && dateTo) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          WHERE userId = ${userId}
          AND createdAt >= ${dateFrom} AND createdAt <= ${dateTo}
          GROUP BY hour
          ORDER BY count DESC
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            HOUR(createdAt) as hour,
            COUNT(*) as count
          FROM audit_logs
          WHERE userId = ${userId}
          GROUP BY hour
          ORDER BY count DESC
        `;
      }
    })(),
    
    // Días de la semana preferidos
    (async () => {
      if (dateFrom && dateTo) {
        return prisma.$queryRaw<any[]>`
          SELECT 
            DAYOFWEEK(createdAt) as dayOfWeek,
            COUNT(*) as count
          FROM audit_logs
          WHERE userId = ${userId}
          AND createdAt >= ${dateFrom} AND createdAt <= ${dateTo}
          GROUP BY dayOfWeek
          ORDER BY count DESC
        `;
      } else {
        return prisma.$queryRaw<any[]>`
          SELECT 
            DAYOFWEEK(createdAt) as dayOfWeek,
            COUNT(*) as count
          FROM audit_logs
          WHERE userId = ${userId}
          GROUP BY dayOfWeek
          ORDER BY count DESC
        `;
      }
    })(),
    
    // Acciones más frecuentes
    prisma.auditLog.groupBy({
      by: ['action'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' }},
      take: 10
    }),
    
    // Actividad reciente (últimas 20 acciones)
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        action: true,
        module: true,
        createdAt: true
      }
    })
  ]);

  // Calcular promedio del sistema para comparación
  const systemAverage = dateFrom && dateTo
    ? await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) / COUNT(DISTINCT userId) as avgActionsPerUser
        FROM audit_logs
        WHERE createdAt >= ${dateFrom} AND createdAt <= ${dateTo}
      `
    : await prisma.$queryRaw<any[]>`
        SELECT 
          COUNT(*) / COUNT(DISTINCT userId) as avgActionsPerUser
        FROM audit_logs
      `;

  const favoriteModule = actionsByModule[0];
  const preferredHour = actionsByHour[0];
  const preferredDay = actionsByDayOfWeek[0];
  const mostCommonAction = mostCommonActions[0];

  return {
    totalActions,
    avgActionsPerUser: systemAverage[0] ? Number(systemAverage[0].avgActionsPerUser) : 0,
    actionsByModule: actionsByModule.map(item => ({
      module: item.module,
      count: item._count.id,
      percentage: (item._count.id / totalActions) * 100
    })),
    actionsByHour: actionsByHour.map(item => ({
      hour: Number(item.hour),
      count: Number(item.count)
    })),
    actionsByDayOfWeek: actionsByDayOfWeek.map(item => ({
      day: Number(item.dayOfWeek),
      count: Number(item.count)
    })),
    mostCommonActions: mostCommonActions.map(item => ({
      action: item.action,
      count: item._count.id
    })),
    recentActivity,
    insights: {
      favoriteModule: favoriteModule?.module,
      preferredHour: preferredHour ? Number(preferredHour.hour) : null,
      preferredDay: preferredDay ? Number(preferredDay.dayOfWeek) : null,
      mostCommonAction: mostCommonAction?.action
    }
  };
};

// ==================== ALERTAS DE SEGURIDAD ====================

export const getSecurityAlerts = async () => {
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const [
    recentFailedActions,
    suspiciousAccess,
    massDeletions,
    configChanges
  ] = await Promise.all([
    // Acciones fallidas recientes
    prisma.auditLog.findMany({
      where: {
        action: {
          contains: 'FAILED'
        },
        createdAt: {
          gte: last7Days
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
    
    // Accesos sospechosos (múltiples IPs)
    prisma.$queryRaw<any[]>`
      SELECT 
        userId,
        COUNT(DISTINCT ipAddress) as ipCount,
        MAX(createdAt) as lastAccess
      FROM audit_logs
      WHERE createdAt >= ${last7Days}
      AND action = 'LOGIN'
      GROUP BY userId
      HAVING ipCount > 3
    `,
    
    // Eliminaciones masivas
    prisma.$queryRaw<any[]>`
      SELECT 
        userId,
        DATE(createdAt) as date,
        COUNT(*) as deletions
      FROM audit_logs
      WHERE createdAt >= ${last7Days}
      AND action LIKE '%DELETED%'
      GROUP BY userId, DATE(createdAt)
      HAVING deletions > 5
    `,
    
    // Cambios en configuraciones críticas
    prisma.auditLog.findMany({
      where: {
        createdAt: { gte: last7Days },
        OR: [
          { action: 'ROLE_UPDATED' },
          { action: 'ROLE_DELETED' },
          { action: 'USER_DELETED' },
          { action: 'SIGNATURES_REVERTED' }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
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
    })
  ]);

  const alerts: any[] = [];

  // Procesar acciones fallidas
  for (const action of recentFailedActions) {
    alerts.push({
      id: `failed-${action.id}`,
      type: 'FAILED_ACTION',
      severity: 'MEDIUM',
      title: 'Acción fallida',
      description: `${action.user.username} - ${action.action}`,
      timestamp: action.createdAt,
      userId: action.userId,
      user: action.user,
      details: {
        action: action.action,
        ipAddress: action.ipAddress
      }
    });
  }

  // Procesar accesos sospechosos
  for (const access of suspiciousAccess) {
    alerts.push({
      id: `suspicious-${access.userId}`,
      type: 'SUSPICIOUS_ACCESS',
      severity: 'HIGH',
      title: 'Múltiples IPs detectadas',
      description: `Usuario accedió desde ${access.ipCount} IPs diferentes`,
      timestamp: access.lastAccess,
      userId: access.userId,
      details: {
        ipCount: Number(access.ipCount)
      }
    });
  }

  // Procesar eliminaciones masivas
  for (const deletion of massDeletions) {
    alerts.push({
      id: `mass-deletion-${deletion.userId}-${deletion.date}`,
      type: 'MASS_DELETION',
      severity: 'HIGH',
      title: 'Eliminación masiva detectada',
      description: `${deletion.deletions} elementos eliminados en un día`,
      timestamp: deletion.date,
      userId: deletion.userId,
      details: {
        count: Number(deletion.deletions)
      }
    });
  }

  // Procesar cambios críticos
  for (const change of configChanges) {
    alerts.push({
      id: `critical-${change.id}`,
      type: 'CRITICAL_CHANGE',
      severity: 'HIGH',
      title: 'Cambio en configuración crítica',
      description: `${change.user.username} - ${change.action}`,
      timestamp: change.createdAt,
      userId: change.userId,
      user: change.user,
      details: {
        action: change.action,
        entityType: change.entityType,
        entityId: change.entityId
      }
    });
  }

  return {
    total: alerts.length,
    alerts: alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  };
};

// ==================== GENERACIÓN DE REPORTES PERSONALIZADOS ====================

interface CustomReportFilters {
  dateFrom?: Date;
  dateTo?: Date;
  userIds?: string[];
  modules?: string[];
  actions?: string[];
  groupBy?: 'user' | 'module' | 'action' | 'date';
  metrics?: string[];
}

export const generateCustomReport = async (filters: CustomReportFilters) => {
  const {
    dateFrom,
    dateTo,
    userIds,
    modules,
    actions,
    groupBy = 'date'
  } = filters;

  const where: any = {};

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  if (userIds && userIds.length > 0) {
    where.userId = { in: userIds };
  }

  if (modules && modules.length > 0) {
    where.module = { in: modules };
  }

  if (actions && actions.length > 0) {
    where.action = { in: actions };
  }

  let groupByField: 'userId' | 'module' | 'action';

  switch (groupBy) {
    case 'user':
      groupByField = 'userId';
      break;
    case 'module':
      groupByField = 'module';
      break;
    case 'action':
      groupByField = 'action';
      break;
    case 'date':
    default:
      // Para agrupación por fecha, usar Prisma groupBy o custom query
      // Usamos una estrategia diferente: obtener datos filtrados y agrupar en código
      const logsForDate = await prisma.auditLog.findMany({
        where,
        select: {
          createdAt: true
        }
      });

      // Agrupar por fecha manualmente
      const dateGroups = logsForDate.reduce((acc: Record<string, number>, log) => {
        const date = log.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const dateGrouped = Object.entries(dateGroups)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.date.localeCompare(a.date));

      return {
        groupBy,
        data: dateGrouped,
        filters: {
          dateFrom,
          dateTo,
          userIds,
          modules,
          actions
        }
      };
  }

  const grouped = await prisma.auditLog.groupBy({
    by: [groupByField],
    where,
    _count: { id: true },
    orderBy: { _count: { id: 'desc' }}
  });

  // Enriquecer datos si es necesario
  if (groupBy === 'user') {
    const userIds = grouped.map((g: any) => g.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }},
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true
      }
    });

    return {
      groupBy,
      data: grouped.map((item: any) => {
        const user = users.find(u => u.id === item.userId);
        return {
          userId: item.userId,
          username: user?.username || 'Unknown',
          fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          count: item._count.id
        };
      }),
      filters: {
        dateFrom,
        dateTo,
        userIds,
        modules,
        actions
      }
    };
  }

  return {
    groupBy,
    data: grouped.map((item: any) => ({
      [groupBy]: item[groupBy],
      count: item._count.id
    })),
    filters: {
      dateFrom,
      dateTo,
      userIds,
      modules,
      actions
    }
  };
};

export default { 
  log,
  getAuditLogs,
  getAuditLogById,
  getAuditStats,
  getAdvancedAnalytics,
  detectAnomalies,
  getUserActivityPattern,
  getSecurityAlerts,
  generateCustomReport
};
