'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  loading?: boolean;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'violet' | 'purple';
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  loading,
  color = 'blue' 
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400',
    violet: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400',
    purple: 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  };

  const textColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    amber: 'text-amber-600 dark:text-amber-400',
    red: 'text-red-600 dark:text-red-400',
    violet: 'text-violet-600 dark:text-violet-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  useEffect(() => {
    if (!loading && typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    } else if (!loading) {
      setDisplayValue(value as number);
    }
  }, [value, loading]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 dark:bg-slate-700" />
          <Skeleton className="h-12 w-12 rounded-full dark:bg-slate-700" />
        </div>
        <Skeleton className="h-9 w-20 mt-2 dark:bg-slate-700" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]} tabular-nums`}>
            {typeof value === 'number' ? displayValue : value}
          </p>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
