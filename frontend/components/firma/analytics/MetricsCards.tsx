'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileCheck, 
  Activity,
  ChevronDown
} from 'lucide-react';

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

type ColorType = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'amber' | 'emerald' | 'slate';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: ColorType;
  isPrimary?: boolean;
}

const colorClasses: Record<ColorType, string> = {
  blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400',
  emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  orange: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400',
  red: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
  amber: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  slate: 'bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400',
};

const MetricCard = ({ title, value, icon, color, isPrimary = true }: MetricCardProps) => {
  return (
    <div 
      className={`
        bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 
        ${isPrimary ? 'p-5' : 'p-4'} 
        hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 
        transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide truncate">
            {title}
          </p>
          <p className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mt-1`}>
            {value}
          </p>
        </div>
        <div className={`${isPrimary ? 'p-2.5' : 'p-2'} rounded-lg ${colorClasses[color]}`}>
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
  const [showSecondary, setShowSecondary] = useState(false);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="h-24 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-5 animate-pulse"
            >
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-14" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const primaryMetrics = [
    { 
      key: 'totalSignatures', 
      title: 'Firmas Totales', 
      value: formatMetricValue(metrics.totalSignatures),
      color: 'blue' as ColorType, 
      icon: <FileCheck className="w-5 h-5" /> 
    },
    { 
      key: 'adoptionRate', 
      title: 'Tasa de Adopcion', 
      value: formatMetricValue(metrics.adoptionRate, '%'),
      color: 'emerald' as ColorType, 
      icon: <TrendingUp className="w-5 h-5" /> 
    },
    { 
      key: 'documentsSigned', 
      title: 'Docs. Firmados', 
      value: formatMetricValue(metrics.documentsSigned),
      color: 'green' as ColorType, 
      icon: <CheckCircle2 className="w-5 h-5" /> 
    },
    { 
      key: 'pendingFlows', 
      title: 'Flujos Activos', 
      value: formatMetricValue(metrics.pendingFlows),
      color: 'amber' as ColorType, 
      icon: <Clock className="w-5 h-5" /> 
    },
  ];

  const secondaryMetrics = [
    { 
      key: 'averagePerDay', 
      title: 'Promedio/Dia', 
      value: formatMetricValue(metrics.averagePerDay),
      color: 'purple' as ColorType, 
      icon: <Activity className="w-4 h-4" /> 
    },
    { 
      key: 'averageFlowCompletionTime', 
      title: 'Tiempo Flujo', 
      value: formatMetricValue(metrics.averageFlowCompletionTime, 'h'),
      color: 'orange' as ColorType, 
      icon: <Clock className="w-4 h-4" /> 
    },
    { 
      key: 'totalReversions', 
      title: 'Reversiones', 
      value: formatMetricValue(metrics.totalReversions),
      color: 'red' as ColorType, 
      icon: <AlertTriangle className="w-4 h-4" /> 
    },
    { 
      key: 'documentsUnsigned', 
      title: 'Sin Firmar', 
      value: formatMetricValue(metrics.documentsUnsigned),
      color: 'slate' as ColorType, 
      icon: <FileText className="w-4 h-4" /> 
    },
  ];

  return (
    <div className="space-y-4">
      {/* Metricas principales - Siempre visibles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryMetrics.map((metric) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            isPrimary
          />
        ))}
      </div>

      {/* Toggle para metricas secundarias */}
      <button
        onClick={() => setShowSecondary(!showSecondary)}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors mx-auto py-1"
        aria-expanded={showSecondary}
        aria-label={showSecondary ? 'Ocultar metricas adicionales' : 'Ver metricas adicionales'}
      >
        <span>{showSecondary ? 'Ocultar' : 'Ver'} metricas adicionales</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showSecondary ? 'rotate-180' : ''}`} />
      </button>

      {/* Metricas secundarias - Colapsables */}
      <div 
        className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-300 ease-in-out overflow-hidden ${
          showSecondary ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'
        }`}
      >
        {secondaryMetrics.map((metric) => (
          <MetricCard
            key={metric.key}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            isPrimary={false}
          />
        ))}
      </div>
    </div>
  );
}
