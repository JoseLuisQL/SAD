'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Activity, BarChart3 } from 'lucide-react';
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
      <div className="grid gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Total de Roles</CardTitle>
            <Shield className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalRoles}</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
              Roles configurados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Usuarios con Rol</CardTitle>
            <Users className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalUsers}</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
              Asignaciones activas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Promedio Permisos</CardTitle>
            <Activity className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avgPermissionsPerRole}</div>
            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
              Módulos por rol
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700 dark:text-slate-300">Módulos Usados</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Object.keys(analytics.permissionsDistribution).length}
            </div>
            <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
              Módulos con permisos
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Distribución de Usuarios por Rol</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400 font-medium">
              Cantidad de usuarios asignados a cada rol
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.usersDistribution.map((item) => {
                const percentage = analytics.totalUsers > 0 
                  ? (item.userCount / analytics.totalUsers) * 100 
                  : 0;

                return (
                  <div key={item.roleName}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-900 dark:text-slate-100">{item.roleName}</span>
                      <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                        {item.userCount} usuarios
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Módulos Más Usados</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400 font-medium">
              Módulos con permisos en más roles
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        <span className="text-sm font-semibold capitalize text-gray-900 dark:text-slate-100">{module}</span>
                        <span className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                          {count} roles
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-600 dark:bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
