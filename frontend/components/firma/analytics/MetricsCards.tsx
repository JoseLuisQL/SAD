'use client';

import { 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  FileCheck,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MetricsCardsProps {
  metrics: {
    totalSignatures: number;
    averagePerDay: number;
    documentsSigned: number;
    documentsUnsigned: number;
    adoptionRate: number;
    averageFlowCompletionTime: number;
    totalReversions: number;
    pendingFlows: number;
  };
  loading?: boolean;
}

type ColorType = 'blue' | 'green' | 'amber' | 'emerald';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: ColorType;
  tooltip?: string;
}

const colorClasses: Record<ColorType, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

const MetricCard = ({ title, value, icon, color, tooltip }: MetricCardProps) => {
  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">
              {title}
            </p>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      type="button" 
                      className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                      aria-label={`Informacion sobre ${title}`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <p className="text-sm">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">
            {value}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const formatMetricValue = (value: number, suffix?: string): string => {
  if (suffix === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (suffix === 'h') {
    return `${value.toFixed(1)}h`;
  }
  return value.toLocaleString();
};

export default function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div 
            key={i} 
            className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4 animate-pulse"
          >
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3" />
            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Solo 4 metricas principales - ISO 25010: Estetica de interfaz (minimalismo)
  const primaryMetrics = [
    { 
      key: 'totalSignatures', 
      title: 'Firmas totales', 
      value: formatMetricValue(metrics.totalSignatures),
      color: 'blue' as ColorType, 
      icon: <FileCheck className="w-5 h-5" />,
      tooltip: 'Numero total de firmas digitales realizadas en el periodo seleccionado'
    },
    { 
      key: 'adoptionRate', 
      title: 'Tasa de adopcion', 
      value: formatMetricValue(metrics.adoptionRate, '%'),
      color: 'emerald' as ColorType, 
      icon: <TrendingUp className="w-5 h-5" />,
      tooltip: 'Porcentaje de documentos firmados respecto al total de documentos'
    },
    { 
      key: 'documentsSigned', 
      title: 'Docs. firmados', 
      value: formatMetricValue(metrics.documentsSigned),
      color: 'green' as ColorType, 
      icon: <CheckCircle2 className="w-5 h-5" />,
      tooltip: 'Cantidad de documentos que han sido firmados digitalmente'
    },
    { 
      key: 'pendingFlows', 
      title: 'Flujos activos', 
      value: formatMetricValue(metrics.pendingFlows),
      color: 'amber' as ColorType, 
      icon: <Clock className="w-5 h-5" />,
      tooltip: 'Flujos de firma en curso que aun no han sido completados'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {primaryMetrics.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          color={metric.color}
          tooltip={metric.tooltip}
        />
      ))}
    </div>
  );
}
