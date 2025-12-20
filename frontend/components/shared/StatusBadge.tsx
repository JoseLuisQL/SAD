'use client';

import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ 
  active, 
  activeLabel = 'Activo', 
  inactiveLabel = 'Inactivo',
  size = 'md'
}: StatusBadgeProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        active 
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
          : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
      )}
      role="status"
      aria-label={active ? activeLabel : inactiveLabel}
    >
      <span 
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          active ? 'bg-emerald-500' : 'bg-gray-400 dark:bg-slate-500'
        )} 
        aria-hidden="true"
      />
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
