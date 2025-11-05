'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
}

const colorClasses = {
  blue: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800',
  green: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800',
  amber: 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800',
  red: 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800',
  violet: 'bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800',
  purple: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800',
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  color = 'blue',
  trend,
  onClick,
}: KpiCardProps) {
  return (
    <Card
      className={cn(
        'border border-gray-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-900',
        onClick && 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-600'
      )}
      onClick={onClick}
    >
      <CardContent className="p-6 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
          <div className={cn('p-2.5 rounded-lg border', colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
          
          {description && (
            <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-sm pt-1">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
