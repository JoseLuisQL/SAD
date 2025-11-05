'use client';

import { AuditStats } from '@/types/audit.types';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AuditChartsProps {
  stats: AuditStats | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function AuditCharts({ stats }: AuditChartsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 h-80 flex items-center justify-center">
          <p className="text-gray-500 dark:text-slate-400">No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const moduleLabels: Record<string, string> = {
    USERS: 'Usuarios',
    ROLES: 'Roles',
    OFFICES: 'Oficinas',
    DOCUMENT_TYPES: 'Tipos Doc.',
    PERIODS: 'Periodos',
    DOCUMENTS: 'Documentos',
    AUTH: 'Autenticación',
  };

  const actionsByDayData = stats.actionsByDay.map((item) => ({
    date: format(new Date(item.date), 'dd/MM', { locale: es }),
    acciones: item.count,
  }));

  const actionsByModuleData = stats.actionsByModule.map((item) => ({
    module: moduleLabels[item.module] || item.module,
    acciones: item.count,
  }));

  const actionsByUserData = stats.actionsByUser.slice(0, 5).map((item) => ({
    name: item.username,
    value: item.count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Acciones por Día (Últimos 30 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={actionsByDayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
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
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Acciones por Módulo</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={actionsByModuleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="module" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="acciones" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {actionsByUserData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 5 Usuarios Más Activos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={actionsByUserData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {actionsByUserData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Usuarios Más Activos</h3>
        <div className="space-y-3">
          {stats.actionsByUser.slice(0, 10).map((user, index) => (
            <div key={user.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{user.fullName}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-blue-600 dark:text-blue-400">{user.count}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">acciones</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
