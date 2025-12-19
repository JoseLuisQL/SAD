'use client';

import React from 'react';
import { Clock, Loader2, CheckCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  size?: 'sm' | 'md';
}

const statusConfig = {
  PENDING: {
    label: 'Pendiente',
    icon: Clock,
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  },
  IN_PROGRESS: {
    label: 'En Progreso',
    icon: Loader2,
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
  },
  COMPLETED: {
    label: 'Completado',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 gap-1' 
    : 'text-sm px-2.5 py-1 gap-1.5';
  
  return (
    <span className={`
      inline-flex items-center font-medium rounded-full
      ${config.className} ${sizeClasses}
    `}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${status === 'IN_PROGRESS' ? 'animate-spin' : ''}`} />
      {config.label}
    </span>
  );
}
