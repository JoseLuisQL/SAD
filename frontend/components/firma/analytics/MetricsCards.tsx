'use client';

import { TrendingUp, TrendingDown, FileText, CheckCircle2, Clock, AlertTriangle, FileCheck, Activity } from 'lucide-react';

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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'yellow';
  suffix?: string;
}

const MetricCard = ({ title, value, icon, trend, color, suffix }: MetricCardProps) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:border-blue-500/30',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 dark:border-green-500/30',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20 dark:border-orange-500/30',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 dark:border-red-500/30',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:border-purple-500/30',
    yellow: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20 dark:border-yellow-500/30',
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {value}{suffix && <span className="text-xl">{suffix}</span>}
            </p>
            {trend && (
              <div className={`flex items-center text-sm ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total Firmas Realizadas"
        value={metrics.totalSignatures.toLocaleString()}
        icon={<FileCheck className="w-6 h-6" />}
        color="blue"
      />

      <MetricCard
        title="Promedio Firmas/Día"
        value={metrics.averagePerDay.toFixed(1)}
        icon={<Activity className="w-6 h-6" />}
        color="purple"
      />

      <MetricCard
        title="Documentos Firmados"
        value={metrics.documentsSigned.toLocaleString()}
        icon={<CheckCircle2 className="w-6 h-6" />}
        color="green"
      />

      <MetricCard
        title="Tasa de Adopción"
        value={metrics.adoptionRate.toFixed(1)}
        icon={<TrendingUp className="w-6 h-6" />}
        color="blue"
        suffix="%"
      />

      <MetricCard
        title="Tiempo Promedio Flujo"
        value={metrics.averageFlowCompletionTime.toFixed(1)}
        icon={<Clock className="w-6 h-6" />}
        color="orange"
        suffix="h"
      />

      <MetricCard
        title="Flujos Activos"
        value={metrics.pendingFlows.toLocaleString()}
        icon={<FileText className="w-6 h-6" />}
        color="yellow"
      />

      <MetricCard
        title="Reversiones del Mes"
        value={metrics.totalReversions.toLocaleString()}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="red"
      />

      <MetricCard
        title="Sin Firmar"
        value={metrics.documentsUnsigned.toLocaleString()}
        icon={<FileText className="w-6 h-6" />}
        color="orange"
      />
    </div>
  );
}
