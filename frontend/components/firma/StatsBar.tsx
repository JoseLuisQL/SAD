'use client';

import React from 'react';
import { FileSignature, Clock, CheckCircle, XCircle, LucideIcon } from 'lucide-react';

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueClassName?: string;
}

function StatItem({ icon, label, value, valueClassName = '' }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div className="flex items-baseline gap-1.5">
        <span className={`text-lg font-semibold ${valueClassName || 'text-slate-900 dark:text-slate-100'}`}>
          {value}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
}

interface StatsBarProps {
  totalFlows: number;
  inProgress: number;
  completed: number;
  cancelled: number;
}

export function StatsBar({ totalFlows, inProgress, completed, cancelled }: StatsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-6 py-3 px-4 bg-white dark:bg-slate-900 
                    rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
      <StatItem 
        icon={<FileSignature className="h-4 w-4 text-slate-400" />}
        label="Total"
        value={totalFlows}
      />
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
      <StatItem 
        icon={<Clock className="h-4 w-4 text-amber-500" />}
        label="En Progreso"
        value={inProgress}
        valueClassName="text-amber-600 dark:text-amber-400"
      />
      <StatItem 
        icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
        label="Completados"
        value={completed}
        valueClassName="text-emerald-600 dark:text-emerald-400"
      />
      <StatItem 
        icon={<XCircle className="h-4 w-4 text-red-500" />}
        label="Cancelados"
        value={cancelled}
        valueClassName="text-red-600 dark:text-red-400"
      />
    </div>
  );
}
