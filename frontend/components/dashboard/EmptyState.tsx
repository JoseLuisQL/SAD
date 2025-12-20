'use client';

import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  error?: string;
  variant?: 'error' | 'empty';
  onRetry?: () => void;
}

export function EmptyState({ error, variant = 'error', onRetry }: EmptyStateProps) {
  if (variant === 'empty') {
    return (
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
              <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Aun no hay registros para mostrar. Los datos apareceran cuando comiences a usar el sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Error al cargar datos
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
            {error || 'No se pudieron cargar los datos del dashboard. Por favor, intentelo nuevamente.'}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
            Si el problema persiste, contacte al soporte tecnico
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
