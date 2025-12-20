'use client';

import { Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DistributionChartProps {
  data: Array<{
    documentType: string;
    count: number;
    percentage: number;
  }>;
  loading?: boolean;
}

// Paleta de colores accesible - ISO 25010 Accesibilidad
const ACCESSIBLE_COLORS = [
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#4b5563', // gray-600
];

export default function DistributionChart({ data, loading }: DistributionChartProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400 dark:text-slate-500" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Distribucion por Tipo
        </h3>
        <div className="h-[240px] flex flex-col items-center justify-center text-center">
          <PieChartIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            No hay datos de distribucion
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Las firmas apareceran aqui una vez realizadas
          </p>
        </div>
      </div>
    );
  }

  // Ordenar por count y limitar a 5 principales + "Otros"
  const sortedData = [...data].sort((a, b) => b.count - a.count);
  const displayData = sortedData.slice(0, 5);
  
  if (sortedData.length > 5) {
    const othersCount = sortedData.slice(5).reduce((sum, item) => sum + item.count, 0);
    const othersPercentage = sortedData.slice(5).reduce((sum, item) => sum + item.percentage, 0);
    displayData.push({
      documentType: 'Otros tipos',
      count: othersCount,
      percentage: othersPercentage,
    });
  }

  const maxCount = Math.max(...displayData.map(d => d.count));
  const totalCount = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Distribucion por Tipo
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          Firmas segun tipo de documento
        </p>
      </div>

      {/* Barras horizontales - Mas accesible que pie chart */}
      <div className="space-y-3.5" role="list" aria-label="Distribucion de firmas por tipo de documento">
        {displayData.map((item, index) => (
          <div 
            key={item.documentType} 
            className="group animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
            role="listitem"
          >
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span 
                className="font-medium text-gray-700 dark:text-slate-300 truncate max-w-[60%] group-hover:text-gray-900 dark:group-hover:text-white transition-colors" 
                title={item.documentType}
              >
                {item.documentType}
              </span>
              <span className="text-gray-600 dark:text-slate-400 tabular-nums flex-shrink-0 ml-2">
                {item.count.toLocaleString()}
                <span className="text-xs text-gray-400 dark:text-slate-500 ml-1">
                  ({item.percentage.toFixed(1)}%)
                </span>
              </span>
            </div>
            <div className="h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out"
                )}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: ACCESSIBLE_COLORS[index % ACCESSIBLE_COLORS.length],
                }}
                role="progressbar"
                aria-valuenow={item.count}
                aria-valuemin={0}
                aria-valuemax={maxCount}
                aria-label={`${item.documentType}: ${item.count} firmas, ${item.percentage.toFixed(1)} por ciento`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-slate-400">Total de firmas</span>
          <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
            {totalCount.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
