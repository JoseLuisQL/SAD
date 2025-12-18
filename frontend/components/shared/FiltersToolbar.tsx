'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
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
  isSearching?: boolean;
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
  isSearching = false,
}: FiltersToolbarProps) {
  const [internalShowFilters, setInternalShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const showFilters = externalShowFilters !== undefined ? externalShowFilters : internalShowFilters;
  const toggleFilters = onToggleFilters || (() => setInternalShowFilters(!internalShowFilters));

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
    if (e.key === 'Escape') {
      onSearchChange('');
      inputRef.current?.blur();
    }
  }, [onSearch, onSearchChange]);

  // Keyboard shortcut: Ctrl+F to focus search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div 
      className={cn(
        'bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-slate-700',
        className
      )}
      role="search"
      aria-label="Buscar y filtrar documentos"
    >
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            {isSearching ? (
              <Loader2 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" 
                aria-hidden="true"
              />
            ) : (
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-400" 
                aria-hidden="true"
              />
            )}
            <Input
              ref={inputRef}
              type="search"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-4 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder:text-slate-500"
              aria-label="Campo de busqueda"
              aria-describedby="search-hint"
            />
            <span id="search-hint" className="sr-only">
              Presiona Enter para buscar, Escape para limpiar, Ctrl+F para enfocar
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={onSearch}
              aria-label="Ejecutar busqueda"
            >
              <Search className="sm:mr-2 h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
            
            {renderFilterContent && (
              <Button 
                variant="outline" 
                onClick={toggleFilters}
                aria-expanded={showFilters}
                aria-controls="filter-panel"
              >
                <Filter className="sm:mr-2 h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Filtros</span>
                {showFilters ? (
                  <ChevronUp className="ml-1 sm:ml-2 h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="ml-1 sm:ml-2 h-4 w-4" aria-hidden="true" />
                )}
                {activeFilters.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    aria-label={`${activeFilters.length} filtros activos`}
                  >
                    {activeFilters.length}
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">Ctrl</kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">F</kbd>
            <span className="ml-1">para buscar</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">Enter</kbd>
            <span className="ml-1">para ejecutar</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-[10px]">Esc</kbd>
            <span className="ml-1">para limpiar</span>
          </span>
        </div>

        {/* Active Filters Chips */}
        {activeFilters.length > 0 && (
          <div 
            className="flex flex-wrap items-center gap-2"
            role="list"
            aria-label="Filtros activos"
          >
            <span className="text-sm text-gray-600 dark:text-slate-300 font-medium">
              Filtros:
            </span>
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1 dark:bg-slate-700 dark:text-slate-200"
                role="listitem"
              >
                <span className="text-xs">
                  {filter.label}: <strong>{filter.displayValue}</strong>
                </span>
                {onRemoveFilter && (
                  <button
                    onClick={() => onRemoveFilter(filter.key)}
                    className="ml-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full p-0.5 transition-colors"
                    aria-label={`Remover filtro ${filter.label}: ${filter.displayValue}`}
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
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
                aria-label="Limpiar todos los filtros"
              >
                <X className="mr-1 h-3 w-3" aria-hidden="true" />
                Limpiar todos
              </Button>
            )}
          </div>
        )}

        {/* Collapsible Filters Content */}
        {showFilters && renderFilterContent && (
          <div 
            id="filter-panel"
            className="pt-4 border-t border-gray-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200"
            role="region"
            aria-label="Panel de filtros avanzados"
          >
            {renderFilterContent()}
          </div>
        )}
      </div>
    </div>
  );
}
