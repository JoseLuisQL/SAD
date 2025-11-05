import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SignatureMetrics {
  totalSignatures: number;
  averagePerDay: number;
  documentsSigned: number;
  documentsUnsigned: number;
  adoptionRate: number;
  averageFlowCompletionTime: number;
  totalReversions: number;
  pendingFlows: number;
}

interface SignatureByPeriod {
  period: string;
  count: number;
  date: string;
}

interface TopSigner {
  userId: string;
  userName: string;
  userEmail: string;
  totalSignatures: number;
  documentsCount: number;
  lastSignatureDate: Date | null;
}

interface FlowStatistics {
  totalFlows: number;
  completedFlows: number;
  pendingFlows: number;
  cancelledFlows: number;
  averageCompletionTime: number;
  successRate: number;
}

interface DocumentTypeDistribution {
  documentType: string;
  count: number;
  percentage: number;
}

interface ReversionAnalytics {
  totalReversions: number;
  topReasons: { reason: string; count: number }[];
  topRevertingUsers: { userId: string; userName: string; count: number }[];
  reversionsByMonth: { month: string; count: number }[];
}

export const getSignatureMetrics = async (
  dateFrom: Date,
  dateTo: Date
): Promise<SignatureMetrics> => {
  const signatures = await prisma.signature.findMany({
    where: {
      timestamp: { gte: dateFrom, lte: dateTo },
      isReverted: false,
    },
  });

  const totalSignatures = signatures.length;

  const daysDiff = Math.max(
    1,
    Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24))
  );
  const averagePerDay = totalSignatures / daysDiff;

  const totalDocuments = await prisma.document.count();
  const documentsSigned = await prisma.document.count({
    where: { signatureStatus: { in: ['SIGNED', 'PARTIALLY_SIGNED'] } },
  });
  const documentsUnsigned = totalDocuments - documentsSigned;
  const adoptionRate = totalDocuments > 0 ? (documentsSigned / totalDocuments) * 100 : 0;

  const flows = await prisma.signatureFlow.findMany({
    where: {
      status: 'COMPLETED',
      updatedAt: { gte: dateFrom, lte: dateTo },
    },
  });

  let totalCompletionTime = 0;
  flows.forEach((flow: any) => {
    const completionTime = flow.updatedAt.getTime() - flow.createdAt.getTime();
    totalCompletionTime += completionTime;
  });
  const averageFlowCompletionTime = flows.length > 0 ? totalCompletionTime / flows.length / (1000 * 60 * 60) : 0;

  const totalReversions = await prisma.signature.count({
    where: {
      isReverted: true,
      revertedAt: { gte: dateFrom, lte: dateTo },
    },
  });

  const pendingFlows = await prisma.signatureFlow.count({
    where: { status: 'PENDING' },
  });

  return {
    totalSignatures,
    averagePerDay: Math.round(averagePerDay * 100) / 100,
    documentsSigned,
    documentsUnsigned,
    adoptionRate: Math.round(adoptionRate * 100) / 100,
    averageFlowCompletionTime: Math.round(averageFlowCompletionTime * 100) / 100,
    totalReversions,
    pendingFlows,
  };
};

export const getSignaturesByPeriod = async (
  period: 'day' | 'week' | 'month',
  dateFrom: Date,
  dateTo: Date
): Promise<SignatureByPeriod[]> => {
  const signatures = await prisma.signature.findMany({
    where: {
      timestamp: { gte: dateFrom, lte: dateTo },
      isReverted: false,
    },
    orderBy: { timestamp: 'asc' },
  });

  const grouped: { [key: string]: number } = {};

  signatures.forEach((sig: any) => {
    let key: string;
    const date = new Date(sig.timestamp);

    if (period === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    grouped[key] = (grouped[key] || 0) + 1;
  });

  return Object.entries(grouped)
    .map(([date, count]) => ({
      period: date,
      count,
      date,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getSignaturesByUser = async (
  limit: number,
  dateFrom: Date,
  dateTo: Date
): Promise<TopSigner[]> => {
  const signatures = await prisma.signature.groupBy({
    by: ['signerId'],
    where: {
      timestamp: { gte: dateFrom, lte: dateTo },
      isReverted: false,
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit,
  });

  const topSigners = await Promise.all(
    signatures.map(async (sig: any) => {
      const user = await prisma.user.findUnique({
        where: { id: sig.signerId },
        select: { id: true, firstName: true, lastName: true, email: true },
      });

      const documentsCount = await prisma.document.count({
        where: {
          signatures: {
            some: {
              signerId: sig.signerId,
              timestamp: { gte: dateFrom, lte: dateTo },
              isReverted: false,
            },
          },
        },
      });

      const lastSignature = await prisma.signature.findFirst({
        where: { signerId: sig.signerId, isReverted: false },
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true },
      });

      return {
        userId: user?.id || sig.signerId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Usuario Desconocido',
        userEmail: user?.email || '',
        totalSignatures: sig._count.id,
        documentsCount,
        lastSignatureDate: lastSignature?.timestamp || null,
      };
    })
  );

  return topSigners;
};

export const getFlowStatistics = async (
  dateFrom: Date,
  dateTo: Date
): Promise<FlowStatistics> => {
  const allFlows = await prisma.signatureFlow.findMany({
    where: {
      createdAt: { gte: dateFrom, lte: dateTo },
    },
  });

  const totalFlows = allFlows.length;
  const completedFlows = allFlows.filter((f: any) => f.status === 'COMPLETED').length;
  const pendingFlows = allFlows.filter((f: any) => f.status === 'PENDING').length;
  const cancelledFlows = allFlows.filter((f: any) => f.status === 'CANCELLED').length;

  let totalCompletionTime = 0;
  let completedCount = 0;

  allFlows.forEach((flow: any) => {
    if (flow.status === 'COMPLETED') {
      const completionTime = flow.updatedAt.getTime() - flow.createdAt.getTime();
      totalCompletionTime += completionTime;
      completedCount++;
    }
  });

  const averageCompletionTime = completedCount > 0 ? totalCompletionTime / completedCount / (1000 * 60 * 60) : 0;
  const successRate = totalFlows > 0 ? (completedFlows / totalFlows) * 100 : 0;

  return {
    totalFlows,
    completedFlows,
    pendingFlows,
    cancelledFlows,
    averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
    successRate: Math.round(successRate * 100) / 100,
  };
};

export const getDocumentTypeDistribution = async (
  dateFrom: Date,
  dateTo: Date
): Promise<DocumentTypeDistribution[]> => {
  const documents = await prisma.document.findMany({
    where: {
      signatures: {
        some: {
          timestamp: { gte: dateFrom, lte: dateTo },
          isReverted: false,
        },
      },
    },
    include: { documentType: true },
  });

  const grouped: { [key: string]: number } = {};
  documents.forEach((doc: any) => {
    const typeName = doc.documentType.name;
    grouped[typeName] = (grouped[typeName] || 0) + 1;
  });

  const total = documents.length;
  return Object.entries(grouped).map(([documentType, count]) => ({
    documentType,
    count,
    percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
  }));
};

export const getReversionAnalytics = async (
  dateFrom: Date,
  dateTo: Date
): Promise<ReversionAnalytics> => {
  const reversions = await prisma.signature.findMany({
    where: {
      isReverted: true,
      revertedAt: { gte: dateFrom, lte: dateTo },
    },
    include: {
      revertedByUser: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  const totalReversions = reversions.length;

  const reasonsMap: { [key: string]: number } = {};
  reversions.forEach((rev: any) => {
    const reason = rev.revertReason || 'Sin especificar';
    reasonsMap[reason] = (reasonsMap[reason] || 0) + 1;
  });
  const topReasons = Object.entries(reasonsMap)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const usersMap: { [key: string]: { name: string; count: number } } = {};
  reversions.forEach((rev: any) => {
    if (rev.revertedBy && rev.revertedByUser) {
      const userId = rev.revertedBy;
      const userName = `${rev.revertedByUser.firstName} ${rev.revertedByUser.lastName}`;
      if (!usersMap[userId]) {
        usersMap[userId] = { name: userName, count: 0 };
      }
      usersMap[userId].count++;
    }
  });
  const topRevertingUsers = Object.entries(usersMap)
    .map(([userId, data]) => ({ userId, userName: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const monthsMap: { [key: string]: number } = {};
  reversions.forEach((rev: any) => {
    if (rev.revertedAt) {
      const date = new Date(rev.revertedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsMap[monthKey] = (monthsMap[monthKey] || 0) + 1;
    }
  });
  const reversionsByMonth = Object.entries(monthsMap)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    totalReversions,
    topReasons,
    topRevertingUsers,
    reversionsByMonth,
  };
};

export const exportAnalyticsReport = async (
  type: 'pdf' | 'xlsx' | 'csv',
  dateFrom: Date,
  dateTo: Date
): Promise<{ buffer: Buffer; filename: string; mimeType: string }> => {
  const metrics = await getSignatureMetrics(dateFrom, dateTo);
  const byPeriod = await getSignaturesByPeriod('day', dateFrom, dateTo);
  const topSigners = await getSignaturesByUser(10, dateFrom, dateTo);
  const flowStats = await getFlowStatistics(dateFrom, dateTo);

  if (type === 'csv') {
    const csvData = [
      '=== MÉTRICAS GENERALES ===',
      `Total Firmas,${metrics.totalSignatures}`,
      `Promedio por Día,${metrics.averagePerDay}`,
      `Documentos Firmados,${metrics.documentsSigned}`,
      `Documentos Sin Firmar,${metrics.documentsUnsigned}`,
      `Tasa de Adopción (%),${metrics.adoptionRate}`,
      `Tiempo Promedio de Flujo (horas),${metrics.averageFlowCompletionTime}`,
      `Total Reversiones,${metrics.totalReversions}`,
      '',
      '=== FIRMAS POR DÍA ===',
      'Fecha,Cantidad',
      ...byPeriod.map((p) => `${p.period},${p.count}`),
      '',
      '=== TOP FIRMANTES ===',
      'Usuario,Email,Total Firmas,Documentos',
      ...topSigners.map((s) => `${s.userName},${s.userEmail},${s.totalSignatures},${s.documentsCount}`),
      '',
      '=== ESTADÍSTICAS DE FLUJOS ===',
      `Total Flujos,${flowStats.totalFlows}`,
      `Flujos Completados,${flowStats.completedFlows}`,
      `Flujos Pendientes,${flowStats.pendingFlows}`,
      `Flujos Cancelados,${flowStats.cancelledFlows}`,
      `Tasa de Éxito (%),${flowStats.successRate}`,
    ];

    const buffer = Buffer.from(csvData.join('\n'), 'utf-8');
    const filename = `reporte-firmas-${dateFrom.toISOString().split('T')[0]}-${dateTo.toISOString().split('T')[0]}.csv`;
    return { buffer, filename, mimeType: 'text/csv' };
  }

  throw new Error('Formato de exportación no implementado aún. Solo CSV está disponible.');
};
