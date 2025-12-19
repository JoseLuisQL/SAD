'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, SlidersHorizontal, Search, RefreshCw } from 'lucide-react';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useUsers } from '@/hooks/useUsers';

export interface SignatureFlowsFiltersData {
  search?: string;
  status?: string;
  documentTypeId?: string;
  createdById?: string;
  dateFrom?: string;
  dateTo?: string;
}

interface SignatureFlowsFiltersProps {
  onFilterChange: (filters: SignatureFlowsFiltersData) => void;
  loading?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function SignatureFlowsFilters({ onFilterChange, loading }: SignatureFlowsFiltersProps) {
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { users, fetchUsers } = useUsers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState<SignatureFlowsFiltersData>({});
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string; value: string }>>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchDocumentTypes({ page: 1, limit: 100 });
    fetchUsers({ page: 1, limit: 100 });
  }, []);

  useEffect(() => {
    const newFilters = { ...filters, search: debouncedSearch || undefined };
    onFilterChange(newFilters);
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof SignatureFlowsFiltersData, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = useCallback(() => {
    const cleanFilters = Object.fromEntries(
      Object.entries({ ...filters, search: searchQuery }).filter(([_, v]) => v !== undefined && v !== '')
    ) as SignatureFlowsFiltersData;

    const active: Array<{ key: string; label: string; value: string }> = [];
    
    if (cleanFilters.status) {
      const statusLabels: Record<string, string> = {
        'PENDING': 'Pendiente',
        'IN_PROGRESS': 'En Progreso',
        'COMPLETED': 'Completado',
        'CANCELLED': 'Cancelado'
      };
      active.push({ key: 'status', label: `Estado: ${statusLabels[cleanFilters.status]}`, value: cleanFilters.status });
    }
    
    if (cleanFilters.documentTypeId) {
      const docType = documentTypes.find(dt => dt.id === cleanFilters.documentTypeId);
      active.push({ key: 'documentTypeId', label: `Tipo: ${docType?.name || 'Desconocido'}`, value: cleanFilters.documentTypeId });
    }
    
    if (cleanFilters.createdById) {
      const creator = users.find(u => u.id === cleanFilters.createdById);
      active.push({ key: 'createdById', label: `Creador: ${creator?.firstName} ${creator?.lastName}`, value: cleanFilters.createdById });
    }
    
    if (cleanFilters.dateFrom) {
      active.push({ key: 'dateFrom', label: `Desde: ${new Date(cleanFilters.dateFrom).toLocaleDateString('es-ES')}`, value: cleanFilters.dateFrom });
    }
    
    if (cleanFilters.dateTo) {
      active.push({ key: 'dateTo', label: `Hasta: ${new Date(cleanFilters.dateTo).toLocaleDateString('es-ES')}`, value: cleanFilters.dateTo });
    }

    setActiveFilters(active);
    onFilterChange(cleanFilters);
  }, [filters, searchQuery, documentTypes, users, onFilterChange]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({});
    setActiveFilters([]);
    onFilterChange({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof SignatureFlowsFiltersData];
    setFilters(newFilters);
    
    const cleanFilters = Object.fromEntries(
      Object.entries({ ...newFilters, search: searchQuery }).filter(([_, v]) => v !== undefined && v !== '')
    ) as SignatureFlowsFiltersData;
    
    setActiveFilters(prev => prev.filter(f => f.key !== key));
    onFilterChange(cleanFilters);
  };

  const activeFiltersCount = activeFilters.length;

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="space-y-4">
          {/* Barra de busqueda principal + boton de filtros */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Campo de busqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="search-flows"
                type="text"
                placeholder="Buscar por nombre, documento o creador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Buscar flujos de firma"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                             hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Limpiar busqueda"
                >
                  <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                </button>
              )}
            </div>

            {/* Boton de filtros avanzados */}
            <Button
              variant="outline"
              size="default"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`gap-2 shrink-0 ${showAdvancedFilters ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600' : ''}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
              {activeFiltersCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 h-5 min-w-5 p-0 justify-center bg-blue-100 text-blue-700 
                             dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Boton refrescar */}
            <Button
              variant="outline"
              size="icon"
              onClick={applyFilters}
              disabled={loading}
              className="shrink-0"
              aria-label="Refrescar resultados"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Filtros avanzados colapsables */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Estado
                  </Label>
                  <Select 
                    value={filters.status || ''} 
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger 
                      id="status-filter" 
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      aria-label="Filtrar por estado"
                    >
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pendiente</SelectItem>
                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                      <SelectItem value="COMPLETED">Completado</SelectItem>
                      <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentTypeId-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Tipo de Documento
                  </Label>
                  <Select 
                    value={filters.documentTypeId || ''} 
                    onValueChange={(value) => handleFilterChange('documentTypeId', value)}
                  >
                    <SelectTrigger 
                      id="documentTypeId-filter" 
                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      aria-label="Filtrar por tipo de documento"
                    >
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(dt => (
                        <SelectItem key={dt.id} value={dt.id}>{dt.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFrom-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Fecha Desde
                  </Label>
                  <Input
                    id="dateFrom-filter"
                    type="date"
                    value={filters.dateFrom ?? ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    aria-label="Filtrar desde fecha"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateTo-filter" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Fecha Hasta
                  </Label>
                  <Input
                    id="dateTo-filter"
                    type="date"
                    value={filters.dateTo ?? ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    aria-label="Filtrar hasta fecha"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Button 
                  onClick={applyFilters} 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar Filtros
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearFilters} 
                  disabled={loading} 
                  className="border-slate-300 dark:border-slate-600"
                >
                  Limpiar Todo
                </Button>
              </div>
            </div>
          )}

          {/* Filtros activos (chips) */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtros activos:</span>
              {activeFilters.map((filter) => (
                <Badge 
                  key={filter.key} 
                  variant="secondary" 
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 
                             text-slate-700 dark:text-slate-300 pr-1"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 
                               transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Remover filtro ${filter.label}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
