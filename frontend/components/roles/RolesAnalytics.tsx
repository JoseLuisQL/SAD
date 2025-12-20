'use client';

import { useEffect, useState } from 'react';
import { Shield, Users, Activity, BarChart3, Loader2 } from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';

interface AnalyticsData {
  totalRoles: number;
  totalUsers: number;
  avgPermissionsPerRole: number;
  permissionsDistribution: Record<string, number>;
  usersDistribution: Array<{ roleName: string; userCount: number }>;
}

export default function RolesAnalytics() {
  const { fetchAnalytics } = useRoles();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error al cargar analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-500 dark:text-slate-400">Cargando estadisticas...</span>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const metrics = [
    { label: 'Roles', value: analytics.totalRoles, desc: 'configurados', icon: Shield },
    { label: 'Usuarios', value: analytics.totalUsers, desc: 'con rol asignado', icon: Users },
    { label: 'Promedio', value: analytics.avgPermissionsPerRole, desc: 'permisos por rol', icon: Activity },
    { label: 'Modulos', value: Object.keys(analytics.permissionsDistribution).length, desc: 'con permisos', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Metricas principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <div 
              key={metric.label}
              className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-1">
                <IconComponent className="h-4 w-4" />
                <span className="text-xs font-medium">{metric.label}</span>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {metric.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Distribuciones */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Usuarios por rol */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Usuarios por Rol</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Distribucion de asignaciones</p>
          <div className="space-y-3">
            {analytics.usersDistribution.map((item) => {
              const percentage = analytics.totalUsers > 0 
                ? (item.userCount / analytics.totalUsers) * 100 
                : 0;

              return (
                <div key={item.roleName}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.roleName}</span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {item.userCount}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 dark:bg-blue-400 h-1.5 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modulos mas usados */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-1">Modulos Populares</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Los 5 modulos mas usados</p>
          <div className="space-y-3">
            {Object.entries(analytics.permissionsDistribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([module, count]) => {
                const percentage = analytics.totalRoles > 0 
                  ? (count / analytics.totalRoles) * 100 
                  : 0;

                return (
                  <div key={module}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">{module}</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {count} roles
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div
                        className="bg-green-500 dark:bg-green-400 h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
