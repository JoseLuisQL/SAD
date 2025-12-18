'use client';

import { FileText, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { DocumentIngestStats } from '@/types/document.types';
import { cn } from '@/lib/utils';

interface DocumentsOverviewProps {
  stats: DocumentIngestStats | null;
  loading?: boolean;
}

export default function DocumentsOverview({ stats, loading = false }: DocumentsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div 
            key={i} 
            className="h-28 bg-gray-100 dark:bg-slate-800 rounded-lg animate-pulse" 
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const weeklyAverage = stats.documentosSemana / 7;
  const monthlyAverage = stats.documentosMes / 30;
  const trendPercentage =
    monthlyAverage > 0
      ? Math.round(((weeklyAverage - monthlyAverage) / monthlyAverage) * 100)
      : 0;

  const totalOCR =
    stats.estadoOCR.pending +
    stats.estadoOCR.processing +
    stats.estadoOCR.completed +
    stats.estadoOCR.error;
  const ocrSuccessRate = totalOCR > 0 ? Math.round((stats.estadoOCR.completed / totalOCR) * 100) : 100;
  const pendingOCR = stats.estadoOCR.pending + stats.estadoOCR.processing;

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
      role="region"
      aria-label="Resumen de documentos"
    >
      {/* Card 1: Documentos */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-5 w-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Documentos
              </h3>
            </div>
            
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.documentosHoy}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400">hoy</span>
              <span className="text-gray-300 dark:text-slate-600">|</span>
              <span className="text-xl font-semibold text-gray-700 dark:text-slate-300">
                {stats.documentosSemana}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400">esta semana</span>
            </div>

            {trendPercentage !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {trendPercentage > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" aria-hidden="true" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    'text-sm font-medium',
                    trendPercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {trendPercentage > 0 ? '+' : ''}{trendPercentage}%
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400">vs mes anterior</span>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <span className="text-xs text-gray-500 dark:text-slate-400">Total mes</span>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.documentosMes}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2: Estado de Procesamiento */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-5 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                Procesamiento OCR
              </h3>
            </div>
            
            <div className="flex items-baseline gap-3 mt-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.estadoOCR.completed}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400">completados</span>
              
              {pendingOCR > 0 && (
                <>
                  <span className="text-gray-300 dark:text-slate-600">|</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-amber-500" aria-hidden="true" />
                    <span className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                      {pendingOCR}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">pendientes</span>
                  </span>
                </>
              )}
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500 dark:text-slate-400">Tasa de exito</span>
                <span className={cn(
                  'font-medium',
                  ocrSuccessRate >= 90 ? 'text-green-600 dark:text-green-400' : 
                  ocrSuccessRate >= 70 ? 'text-amber-600 dark:text-amber-400' : 
                  'text-red-600 dark:text-red-400'
                )}>
                  {ocrSuccessRate}%
                </span>
              </div>
              <div 
                className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2"
                role="progressbar"
                aria-valuenow={ocrSuccessRate}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Tasa de exito OCR: ${ocrSuccessRate}%`}
              >
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    ocrSuccessRate >= 90 ? 'bg-green-500' : 
                    ocrSuccessRate >= 70 ? 'bg-amber-500' : 
                    'bg-red-500'
                  )}
                  style={{ width: `${ocrSuccessRate}%` }}
                />
              </div>
            </div>
          </div>

          {stats.estadoOCR.error > 0 && (
            <div className="text-right">
              <span className="text-xs text-red-500 dark:text-red-400">Con errores</span>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                {stats.estadoOCR.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
