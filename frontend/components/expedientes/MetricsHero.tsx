'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderOpen, FileText, TrendingUp, BarChart3 } from 'lucide-react';
import { useExpedienteMetrics } from '@/hooks/useExpedienteMetrics';

export function MetricsHero() {
  const { metrics, loading } = useExpedienteMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
              Expedientes Activos
            </p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.totalExpedientes}
            </p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <FolderOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
              Documentos Asociados
            </p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {metrics.documentosTotales}
            </p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
              Promedio por Expediente
            </p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.promedioDocumentosPorExpediente}
            </p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">
              Distribución
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {metrics.distribucionPorTamano.pequenos}
                <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">P</span>
              </p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {metrics.distribucionPorTamano.medianos}
                <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">M</span>
              </p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {metrics.distribucionPorTamano.grandes}
                <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">G</span>
              </p>
            </div>
          </div>
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </Card>
    </div>
  );
}
