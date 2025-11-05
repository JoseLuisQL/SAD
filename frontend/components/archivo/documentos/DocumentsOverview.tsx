'use client';

import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { DocumentIngestStats } from '@/types/document.types';

interface DocumentsOverviewProps {
  stats: DocumentIngestStats | null;
  loading?: boolean;
}

export default function DocumentsOverview({ stats, loading = false }: DocumentsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calcular tendencia comparando semana vs mes
  const weeklyAverage = stats.documentosSemana / 7;
  const monthlyAverage = stats.documentosMes / 30;
  const trendPercentage =
    monthlyAverage > 0
      ? Math.round(((weeklyAverage - monthlyAverage) / monthlyAverage) * 100)
      : 0;

  // Calcular tasa de éxito de OCR
  const totalOCR =
    stats.estadoOCR.pending +
    stats.estadoOCR.processing +
    stats.estadoOCR.completed +
    stats.estadoOCR.error;
  const ocrSuccessRate = totalOCR > 0 ? (stats.estadoOCR.completed / totalOCR) * 100 : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Nuevos Hoy"
        value={stats.documentosHoy}
        icon={FileText}
        color="blue"
        description="documentos ingresados"
      />

      <MetricCard
        title="Esta Semana"
        value={stats.documentosSemana}
        icon={Clock}
        color="violet"
        description="últimos 7 días"
        trend={
          trendPercentage !== 0
            ? {
                value: Math.abs(trendPercentage),
                isPositive: trendPercentage > 0,
                label: 'vs mes anterior',
              }
            : undefined
        }
      />

      <MetricCard
        title="OCR Procesados"
        value={stats.estadoOCR.completed}
        icon={CheckCircle}
        color="green"
        description={`${ocrSuccessRate.toFixed(0)}% de éxito`}
      />

      <MetricCard
        title="Pendientes OCR"
        value={stats.estadoOCR.pending + stats.estadoOCR.processing}
        icon={AlertCircle}
        color={
          stats.estadoOCR.pending + stats.estadoOCR.processing > 100
            ? 'red'
            : stats.estadoOCR.pending + stats.estadoOCR.processing > 50
            ? 'amber'
            : 'blue'
        }
        description="en cola o procesando"
      />
    </div>
  );
}
