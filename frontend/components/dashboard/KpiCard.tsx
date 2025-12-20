'use client';

import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  tooltip?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
}

const colorConfig = {
  blue: {
    card: 'border-l-blue-500',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    iconBorder: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    card: 'border-l-emerald-500',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    iconBorder: 'border-emerald-200 dark:border-emerald-800',
  },
  amber: {
    card: 'border-l-amber-500',
    icon: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
    iconBorder: 'border-amber-200 dark:border-amber-800',
  },
  red: {
    card: 'border-l-rose-500',
    icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    iconBorder: 'border-rose-200 dark:border-rose-800',
  },
  violet: {
    card: 'border-l-violet-500',
    icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
    iconBorder: 'border-violet-200 dark:border-violet-800',
  },
  purple: {
    card: 'border-l-purple-500',
    icon: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400',
    iconBorder: 'border-purple-200 dark:border-purple-800',
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  tooltip,
  color = 'blue',
  trend,
  onClick,
}: KpiCardProps) {
  const config = colorConfig[color];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      role="region"
      aria-label={`${title}: ${value}`}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative group border-l-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-md bg-white dark:bg-slate-900',
        config.card,
        onClick && 'cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900'
      )}
      onClick={onClick}
    >
      {onClick && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <CardContent className="p-5 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <p className={cn(
                  'text-sm font-semibold text-slate-700 dark:text-slate-200',
                  tooltip && 'cursor-help border-b border-dashed border-slate-300 dark:border-slate-600'
                )}>
                  {title}
                </p>
              </TooltipTrigger>
              {tooltip && (
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <div className={cn('p-2 rounded-lg border', config.icon, config.iconBorder)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</p>
          
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 text-xs pt-1">
              <span
                className={cn(
                  'font-medium',
                  trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
