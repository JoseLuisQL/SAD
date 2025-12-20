'use client';

import { StatCard } from './StatCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Building2, FileText, CheckCircle, XCircle, Calendar, TrendingUp } from 'lucide-react';

type TypologyType = 'office' | 'documentType' | 'period';

interface StatsData {
  total: number;
  active: number;
  inactive: number;
  recentlyCreated?: number;
  mostUsed?: Array<{
    id: string;
    code: string;
    name: string;
    count: number;
  }>;
}

interface TypologyStatsProps {
  type: TypologyType;
  stats: StatsData | null;
  loading: boolean;
  onRefresh?: () => void;
}

export function TypologyStats({ type, stats, loading, onRefresh }: TypologyStatsProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'office':
        return { 
          singular: 'Oficina', 
          plural: 'Oficinas', 
          metric: 'documentos',
          icon: Building2,
          tooltips: {
            total: 'Número total de oficinas registradas en el sistema',
            active: 'Oficinas habilitadas para asignar documentos',
            inactive: 'Oficinas deshabilitadas temporalmente',
            recent: 'Oficinas creadas en las últimas 24 horas'
          }
        };
      case 'documentType':
        return { 
          singular: 'Tipo', 
          plural: 'Tipos de Documento', 
          metric: 'documentos',
          icon: FileText,
          tooltips: {
            total: 'Número total de tipos de documento definidos',
            active: 'Tipos de documento disponibles para clasificar',
            inactive: 'Tipos de documento deshabilitados',
            recent: 'Tipos creados en las últimas 24 horas'
          }
        };
      case 'period':
        return { 
          singular: 'Periodo', 
          plural: 'Periodos', 
          metric: 'archivadores',
          icon: Calendar,
          tooltips: {
            total: 'Número total de periodos fiscales definidos',
            active: 'Periodos activos para organización',
            inactive: 'Periodos cerrados o inactivos',
            recent: 'Periodos creados en las últimas 24 horas'
          }
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  const chartData = stats?.mostUsed?.slice(0, 5).map((item, index) => ({
    name: item.code,
    value: item.count,
    fullName: item.name,
    fill: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'][index]
  })) || [];

  return (
    <div className="space-y-4">
      {/* Stats Cards Grid */}
      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        role="region"
        aria-label="Estadísticas de oficinas"
      >
        <StatCard
          title={`Total ${config.plural}`}
          value={stats?.total || 0}
          icon={<IconComponent className="h-5 w-5" aria-hidden="true" />}
          color="blue"
          loading={loading}
          tooltip={config.tooltips.total}
        />
        <StatCard
          title="Activos"
          value={stats?.active || 0}
          icon={<CheckCircle className="h-5 w-5" aria-hidden="true" />}
          color="green"
          loading={loading}
          tooltip={config.tooltips.active}
        />
        <StatCard
          title="Inactivos"
          value={stats?.inactive || 0}
          icon={<XCircle className="h-5 w-5" aria-hidden="true" />}
          color="amber"
          loading={loading}
          tooltip={config.tooltips.inactive}
        />
        <StatCard
          title="Creados Hoy"
          value={stats?.recentlyCreated || 0}
          icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
          color="purple"
          loading={loading}
          tooltip={config.tooltips.recent}
        />
      </div>

      {/* Chart - Top 5 Most Used */}
      {!loading && chartData.length > 0 && (
        <div 
          className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-6"
          role="region"
          aria-label={`Gráfico de ${config.plural} más utilizados`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top 5 {config.plural} Más Usados
              </h3>
            </div>
            <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
              Por cantidad de {config.metric}
            </span>
          </div>
          
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                className="dark:stroke-slate-700" 
                vertical={false}
              />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="dark:stroke-slate-400" 
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                className="dark:stroke-slate-400" 
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {payload[0].payload.fullName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          Código: {payload[0].payload.name}
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                          {payload[0].value} {config.metric}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty State for Chart */}
      {!loading && stats && stats.total > 0 && chartData.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 text-center">
          <TrendingUp className="h-10 w-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-500 dark:text-slate-400">
            Aún no hay datos de uso para mostrar estadísticas
          </p>
        </div>
      )}
    </div>
  );
}
