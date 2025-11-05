'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  error?: string;
  onRetry?: () => void;
}

export function EmptyState({ error, onRetry }: EmptyStateProps) {
  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardContent className="pt-6 bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-full mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Error al cargar datos
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mb-6">
            {error || 'No se pudieron cargar los datos del dashboard. Por favor, inténtelo nuevamente.'}
          </p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          )}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">
            Si el problema persiste, contacte al soporte técnico
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
