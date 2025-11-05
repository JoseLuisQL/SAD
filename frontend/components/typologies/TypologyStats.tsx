'use client';

import { StatCard } from './StatCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, CheckCircle, XCircle, Calendar, RefreshCw } from 'lucide-react';

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
  const getTypeLabel = () => {
    switch (type) {
      case 'office':
        return { singular: 'Oficina', plural: 'Oficinas', metric: 'documentos' };
      case 'documentType':
        return { singular: 'Tipo', plural: 'Tipos', metric: 'documentos' };
      case 'period':
        return { singular: 'Periodo', plural: 'Periodos', metric: 'archivadores' };
    }
  };

  const labels = getTypeLabel();

  const chartData = stats?.mostUsed?.slice(0, 5).map(item => ({
    name: item.code,
    value: item.count,
    fullName: item.name
  })) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Total ${labels.plural}`}
          value={stats?.total || 0}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Activos"
          value={stats?.active || 0}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Inactivos"
          value={stats?.inactive || 0}
          icon={<XCircle className="h-6 w-6" />}
          color="amber"
          loading={loading}
        />
        <StatCard
          title="Creados Hoy"
          value={stats?.recentlyCreated || 0}
          icon={<Calendar className="h-6 w-6" />}
          color="purple"
          loading={loading}
        />
      </div>

      {!loading && chartData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top 5 {labels.plural} Más Usados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-slate-700" />
              <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-slate-400" />
              <YAxis stroke="#6b7280" className="dark:stroke-slate-400" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg">
                        <p className="font-semibold dark:text-white">{payload[0].payload.fullName}</p>
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Código: {payload[0].payload.name}
                        </p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {payload[0].value} {labels.metric}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {!loading && (!stats || stats.total === 0) && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-400 dark:text-slate-500 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-slate-400">No hay datos de estadísticas disponibles</p>
        </div>
      )}
    </div>
  );
}
