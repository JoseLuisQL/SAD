import { FileText, Filter, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReportEmptyStateProps {
  onAdjustFilters?: () => void;
  message?: string;
  description?: string;
}

export default function ReportEmptyState({
  onAdjustFilters,
  message = 'No se encontraron datos',
  description = 'No hay información disponible con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.',
}: ReportEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-200 dark:border-slate-700"
      role="status"
      aria-live="polite"
    >
      <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
        <Database className="h-8 w-8 text-gray-400 dark:text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{message}</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 text-center mb-6 max-w-md">{description}</p>
      {onAdjustFilters && (
        <Button onClick={onAdjustFilters} variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Ajustar Filtros
        </Button>
      )}
    </div>
  );
}
