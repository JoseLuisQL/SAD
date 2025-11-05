'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { FileSearch, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SearchFilters } from '@/types/search.types';

interface SearchSummaryProps {
  totalResults: number;
  activeFilters: SearchFilters;
  searchQuery?: string;
  searchTime?: number;
}

export default function SearchSummary({
  totalResults,
  activeFilters,
  searchQuery,
  searchTime,
}: SearchSummaryProps) {
  const activeFiltersCount = Object.values(activeFilters).filter(v => v).length;
  const currentTime = format(new Date(), "dd MMM yyyy 'a las' HH:mm", { locale: es });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-tour="search-summary">
      <Card className="bg-white dark:bg-slate-900 p-4 shadow-sm border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <FileSearch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">Resultados</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalResults}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-slate-900 p-4 shadow-sm border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <Filter className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">Filtros Activos</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeFiltersCount}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-white dark:bg-slate-900 p-4 shadow-sm border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">Última Búsqueda</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{currentTime}</p>
          </div>
        </div>
      </Card>

      {searchTime !== undefined && (
        <Card className="bg-white dark:bg-slate-900 p-4 shadow-sm border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400">Tiempo de Respuesta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{searchTime}ms</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
