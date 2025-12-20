'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'purple';
  tooltip?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  loading,
  color = 'blue',
  tooltip
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const colorConfig = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-800/50'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-100 dark:border-green-800/50'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'text-amber-600 dark:text-amber-400',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-800/50'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-100 dark:border-red-800/50'
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      icon: 'text-violet-600 dark:text-violet-400',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-800/50'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-800/50'
    },
  };

  const config = colorConfig[color];

  useEffect(() => {
    if (!loading && typeof value === 'number') {
      if (value === 0) {
        setDisplayValue(0);
        return;
      }
      
      let start = 0;
      const end = value;
      const duration = 800;
      const steps = 30;
      const increment = end / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          const progress = currentStep / steps;
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setDisplayValue(Math.floor(end * easeOut));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else if (!loading && typeof value === 'string') {
      setDisplayValue(parseInt(value) || 0);
    }
  }, [value, loading]);

  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-5"
        role="status"
        aria-label="Cargando estadística"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 dark:bg-slate-800" />
            <Skeleton className="h-8 w-16 dark:bg-slate-800" />
          </div>
          <Skeleton className="h-10 w-10 rounded-lg dark:bg-slate-800" />
        </div>
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  const cardContent = (
    <div 
      className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-5 transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-slate-700`}
      role="article"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-gray-600 dark:text-slate-400">
              {title}
            </p>
            {tooltip && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                      aria-label="Más información"
                    >
                      <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="max-w-xs text-sm dark:bg-slate-800 dark:border-slate-700"
                  >
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <p className={`text-2xl font-bold ${config.text} tabular-nums`}>
            {typeof value === 'number' ? displayValue.toLocaleString() : value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 dark:text-slate-500">
              {description}
            </p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}% vs. ayer</span>
            </div>
          )}
        </div>
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${config.bg} ${config.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return cardContent;
}
