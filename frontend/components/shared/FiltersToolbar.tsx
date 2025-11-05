'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'dateRange';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface ActiveFilter {
  key: string;
  value: string;
  label: string;
  displayValue: string;
}

interface FiltersToolbarProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  filters?: FilterConfig[];
  activeFilters?: ActiveFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onRemoveFilter?: (key: string) => void;
  onClearFilters?: () => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  renderFilterContent?: () => React.ReactNode;
  className?: string;
}

export function FiltersToolbar({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  onSearch,
  activeFilters = [],
  onRemoveFilter,
  onClearFilters,
  showFilters: externalShowFilters,
  onToggleFilters,
  renderFilterContent,
  className,
}: FiltersToolbarProps) {
  const [internalShowFilters, setInternalShowFilters] = useState(false);

  // Use external control if provided, otherwise use internal state
  const showFilters = externalShowFilters !== undefined ? externalShowFilters : internalShowFilters;
  const toggleFilters = onToggleFilters || (() => setInternalShowFilters(!internalShowFilters));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className={cn('bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700', className)}>
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <Button onClick={onSearch}>
            <Search className="mr-2 h-4 w-4" />
            Buscar
          </Button>
          {renderFilterContent && (
            <Button variant="outline" onClick={toggleFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">Filtros activos:</span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 dark:bg-slate-700 dark:text-slate-200"
              >
                <span className="text-xs">
                  {filter.label}: {filter.displayValue}
                </span>
                {onRemoveFilter && (
                  <button
                    onClick={() => onRemoveFilter(filter.key)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full p-0.5 transition-colors"
                    aria-label={`Remover filtro ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {onClearFilters && activeFilters.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-7 text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Limpiar todos
              </Button>
            )}
          </div>
        )}

        {/* Collapsible Filters Content */}
        {showFilters && renderFilterContent && (
          <div className="pt-4 border-t border-gray-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
            {renderFilterContent()}
          </div>
        )}
      </div>
    </div>
  );
}
