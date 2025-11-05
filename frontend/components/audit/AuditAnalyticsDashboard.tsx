'use client';

import { useEffect, useState } from 'react';
import { auditApi } from '@/lib/api/audit';
import { AdvancedAnalytics } from '@/types/audit.types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Users, Layers, TrendingUp, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, description, icon, trend }: StatCardProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
            {description && <p className="text-xs text-gray-500 dark:text-slate-400">{description}</p>}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp 
                  className={`h-3 w-3 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${!trend.isPositive && 'rotate-180'}`} 
                />
                <span className={`text-xs ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {trend.value}% vs período anterior
                </span>
              </div>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface AuditAnalyticsDashboardProps {
  dateFrom?: string;
  dateTo?: string;
}

export function AuditAnalyticsDashboard({ dateFrom, dateTo }: AuditAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateFrom, dateTo]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics with params:', { dateFrom, dateTo });
      const response = await auditApi.getAdvancedAnalytics({ dateFrom, dateTo });
      console.log('Analytics response:', response);
      console.log('Analytics data:', response.data);
      setAnalytics(response.data.data);
    } catch (error: unknown) {
      console.error('Error fetching advanced analytics:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error as object));
      const apiError = error as { message?: string; response?: unknown; request?: unknown };
      console.error('Error message:', apiError?.message);
      console.error('Error response:', apiError?.response);
      console.error('Error request:', apiError?.request);
      console.error('Error config:', error?.config?.url);
      
      // Mostrar un toast con el error
      if (error?.response?.data?.message) {
        console.error('API Error:', error.response.data.message);
      } else if (error?.message) {
        console.error('Network Error:', error.message);
      } else {
        console.error('Unknown Error:', JSON.stringify(error));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-12 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay datos disponibles</h3>
        <p className="text-gray-600 dark:text-slate-400">No se pudieron cargar los analytics.</p>
      </div>
    );
  }

  const hourlyData = analytics.actionsByHour.map(item => ({
    hora: `${item.hour}:00`,
    acciones: item.count
  }));

  const dayOfWeekData = analytics.actionsByDayOfWeek
    .sort((a, b) => a.day - b.day)
    .map(item => ({
      día: DAY_NAMES[item.day - 1] || 'N/A',
      acciones: item.count
    }));

  const actionTypeData = analytics.actionsByType.map(item => ({
    name: item.type,
    value: item.count
  }));

  const topModulesData = analytics.topModules.slice(0, 6).map(item => ({
    módulo: item.module,
    acciones: item.count
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Acciones"
          value={analytics.summary.totalActions.toLocaleString()}
          description="En el período seleccionado"
          icon={<Activity className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Usuarios Activos"
          value={analytics.summary.uniqueUsers}
          description="Usuarios con actividad"
          icon={<Users className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Módulos Utilizados"
          value={analytics.summary.uniqueModules}
          description="Módulos con actividad"
          icon={<Layers className="h-6 w-6 text-purple-600" />}
        />
        <StatCard
          title="Promedio por Usuario"
          value={analytics.summary.avgActionsPerUser.toFixed(1)}
          description="Acciones por usuario"
          icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Actividad por Hora del Día
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Distribución de acciones por hora</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hora" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="acciones" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
              Actividad por Día de la Semana
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Distribución de acciones por día</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dayOfWeekData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="día" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="acciones" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Distribución por Tipo de Acción</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Tipos de acciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={actionTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionTypeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Módulos Más Utilizados</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Top 6 módulos con mayor actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topModulesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="módulo" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="acciones" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Top 10 Usuarios Más Activos</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Usuarios con mayor cantidad de acciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topActiveUsers.slice(0, 10).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-xs text-gray-600 dark:text-slate-400">{user.fullName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600 dark:text-blue-400">{user.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">acciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Horas Pico de Actividad</CardTitle>
            <CardDescription className="text-gray-600 dark:text-slate-400">Horarios con mayor concentración de actividad</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.peakActivityHours.map((peak, index) => (
                <div key={peak.hour} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index === 0 ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400' :
                      index === 1 ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300' :
                      index === 2 ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400' :
                      'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{peak.hour}:00 - {peak.hour + 1}:00</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400">Hora pico {index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{peak.count}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">acciones</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Acciones Más Frecuentes</CardTitle>
          <CardDescription className="text-gray-600 dark:text-slate-400">Distribución de las 10 acciones más comunes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.actionDistribution.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="action" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ec4899" name="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
