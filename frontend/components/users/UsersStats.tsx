'use client';

import { Users, UserCheck, UserX, Shield, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UsersStatsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Array<{ roleId: string; roleName: string; count: number }>;
  };
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'muted' | 'info';
}

const variantClasses = {
  default: 'text-gray-600 dark:text-slate-400',
  success: 'text-emerald-600 dark:text-emerald-400',
  muted: 'text-gray-400 dark:text-slate-500',
  info: 'text-blue-600 dark:text-blue-400',
};

function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 transition-colors hover:border-gray-300 dark:hover:border-slate-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
            {label}
          </p>
        </div>
        <Icon className={cn('h-5 w-5', variantClasses[variant])} aria-hidden="true" />
      </div>
    </div>
  );
}

export function UsersStats({ stats }: UsersStatsProps) {
  return (
    <div 
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      role="region"
      aria-label="Estadísticas de usuarios"
    >
      <StatCard
        label="Total"
        value={stats.totalUsers}
        icon={Users}
        variant="default"
      />
      <StatCard
        label="Activos"
        value={stats.activeUsers}
        icon={UserCheck}
        variant="success"
      />
      <StatCard
        label="Inactivos"
        value={stats.inactiveUsers}
        icon={UserX}
        variant="muted"
      />
      <StatCard
        label="Roles"
        value={stats.usersByRole.length}
        icon={Shield}
        variant="info"
      />
    </div>
  );
}
