'use client';

import { Archive, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';
import { ArchivadorAnalyticsOverview } from '@/types/archivador.types';

interface ArchivadorMetricsProps {
  data: ArchivadorAnalyticsOverview | null;
  loading?: boolean;
}

export function ArchivadorMetrics({ data, loading = false }: ArchivadorMetricsProps) {
  const getCapacidadColor = (capacidad: number): 'green' | 'amber' | 'red' => {
    if (capacidad >= 80) return 'red';
    if (capacidad >= 50) return 'amber';
    return 'green';
  };

  const getTopPeriodo = () => {
    if (!data || data.archivadoresPorPeriodo.length === 0) return null;
    
    const sorted = [...data.archivadoresPorPeriodo].sort((a, b) => b.count - a.count);
    return sorted[0];
  };

  const topPeriodo = getTopPeriodo();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Archivadores"
        value={loading ? '...' : data?.totalArchivadores || 0}
        icon={Archive}
        color="blue"
        description="Registrados en el sistema"
        loading={loading}
      />

      <MetricCard
        title="Documentos Archivados"
        value={loading ? '...' : data?.documentosTotal || 0}
        icon={FileText}
        color="violet"
        description="Total de documentos físicos"
        loading={loading}
      />

      <MetricCard
        title="Capacidad Utilizada"
        value={loading ? '...' : `${data?.capacidadUtilizada || 0}%`}
        icon={TrendingUp}
        color={data ? getCapacidadColor(data.capacidadUtilizada) : 'green'}
        description={
          data && data.capacidadUtilizada >= 80
            ? 'Nivel crítico'
            : data && data.capacidadUtilizada >= 50
            ? 'Nivel moderado'
            : 'Nivel óptimo'
        }
        loading={loading}
      />

      <MetricCard
        title="Periodo Principal"
        value={loading ? '...' : topPeriodo ? topPeriodo.periodYear : 'N/A'}
        icon={BarChart3}
        color="amber"
        description={
          topPeriodo
            ? `${topPeriodo.count} archivadores, ${topPeriodo.documentosCount} docs`
            : 'Sin datos'
        }
        loading={loading}
      />
    </div>
  );
}
