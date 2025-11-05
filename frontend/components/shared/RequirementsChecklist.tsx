'use client';

import { Check, X, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Requirement {
  id: string;
  label: string;
  status: 'met' | 'unmet' | 'warning';
  message?: string;
}

interface RequirementsChecklistProps {
  title?: string;
  requirements: Requirement[];
  className?: string;
}

export function RequirementsChecklist({
  title = 'Requisitos',
  requirements,
  className,
}: RequirementsChecklistProps) {
  const allMet = requirements.every((req) => req.status === 'met');

  return (
    <Card className={cn('p-4 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700', className)}>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
        {title}
        {allMet && <Check className="ml-2 h-4 w-4 text-green-500 dark:text-green-400" />}
      </h3>

      <div className="space-y-2">
        {requirements.map((req) => (
          <div
            key={req.id}
            className={cn(
              'flex items-start gap-2 p-2 rounded-lg transition-colors',
              req.status === 'met' && 'bg-green-50 dark:bg-green-950/30',
              req.status === 'unmet' && 'bg-gray-50 dark:bg-slate-800',
              req.status === 'warning' && 'bg-amber-50 dark:bg-amber-950/30'
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {req.status === 'met' && (
                <Check className="h-4 w-4 text-green-600 dark:text-green-500" />
              )}
              {req.status === 'unmet' && (
                <X className="h-4 w-4 text-gray-400 dark:text-slate-500" />
              )}
              {req.status === 'warning' && (
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-sm',
                  req.status === 'met' && 'text-green-900 dark:text-green-300 font-medium',
                  req.status === 'unmet' && 'text-gray-600 dark:text-slate-400',
                  req.status === 'warning' && 'text-amber-900 dark:text-amber-300 font-medium'
                )}
              >
                {req.label}
              </p>
              {req.message && (
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1 font-medium truncate" title={req.message}>
                  {req.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
