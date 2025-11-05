'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  loading?: boolean;
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  green: 'bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400',
  amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
  red: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400',
  violet: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
  trend,
  loading = false,
  onClick,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
          <div className={cn('p-2 rounded-lg', colorClasses[color])}>
            <div className="h-5 w-5 bg-gray-300 dark:bg-slate-600 rounded"></div>
          </div>
        </div>
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
        {description && <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700 transition-colors duration-200',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{title}</p>
        <div className={cn('p-2 rounded-lg', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        
        {description && (
          <p className="text-sm text-gray-500 dark:text-slate-400">{description}</p>
        )}
        
        {trend && (
          <div className="flex items-center gap-1 text-sm">
            <span
              className={cn(
                'font-medium',
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-gray-500 dark:text-slate-400">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
