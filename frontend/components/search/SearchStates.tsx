'use client';

import { Search, Loader2, SearchX, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onShowHelp?: () => void;
}

export function EmptyState({ onShowHelp }: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        ¿Qué documento buscas?
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
        Puedes buscar por número, remitente, contenido o aplicar filtros específicos
      </p>
      {onShowHelp && (
        <Button variant="outline" size="sm" onClick={onShowHelp} className="text-slate-600 dark:text-slate-300">
          Ver sugerencias de búsqueda
        </Button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        Buscando documentos...
      </h3>
      <p className="text-slate-500 dark:text-slate-400">
        Esto tomará solo un momento
      </p>
    </div>
  );
}

interface NoResultsStateProps {
  query: string;
  onClearFilters?: () => void;
  hasFilters?: boolean;
}

export function NoResultsState({ query, onClearFilters, hasFilters }: NoResultsStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
        <SearchX className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        No encontramos resultados
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
        {query ? (
          <>No hay documentos que coincidan con &ldquo;{query}&rdquo;</>
        ) : (
          <>No hay documentos que coincidan con los filtros aplicados</>
        )}
      </p>
      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
        <p className="font-medium text-slate-700 dark:text-slate-300">Sugerencias:</p>
        <ul className="space-y-1.5 text-left">
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span>Verifica la ortografía del término</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span>Usa palabras más generales</span>
          </li>
          {hasFilters && (
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Reduce el número de filtros</span>
            </li>
          )}
        </ul>
      </div>
      {hasFilters && onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters} className="mt-6">
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
        Error en la búsqueda
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
        {message || 'Ocurrió un error al realizar la búsqueda. Por favor, intenta de nuevo.'}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
