'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { AuditLogsFilters } from '@/types/audit.types';

interface AuditFiltersProps {
  onFilter: (filters: AuditLogsFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

const ACTION_OPTIONS = [
  { value: 'all', label: 'Todas las acciones' },
  { value: 'USER_CREATED', label: 'Usuario Creado' },
  { value: 'USER_UPDATED', label: 'Usuario Actualizado' },
  { value: 'USER_DELETED', label: 'Usuario Eliminado' },
  { value: 'LOGIN', label: 'Inicio de Sesión' },
  { value: 'LOGOUT', label: 'Cierre de Sesión' },
  { value: 'PASSWORD_CHANGED', label: 'Cambio de Contraseña' },
  { value: 'ROLE_CREATED', label: 'Rol Creado' },
  { value: 'ROLE_UPDATED', label: 'Rol Actualizado' },
  { value: 'ROLE_DELETED', label: 'Rol Eliminado' },
  { value: 'OFFICE_CREATED', label: 'Oficina Creada' },
  { value: 'OFFICE_UPDATED', label: 'Oficina Actualizada' },
  { value: 'OFFICE_DELETED', label: 'Oficina Eliminada' },
  { value: 'DOCUMENT_TYPE_CREATED', label: 'Tipo Documento Creado' },
  { value: 'DOCUMENT_TYPE_UPDATED', label: 'Tipo Documento Actualizado' },
  { value: 'DOCUMENT_TYPE_DELETED', label: 'Tipo Documento Eliminado' },
  { value: 'PERIOD_CREATED', label: 'Periodo Creado' },
  { value: 'PERIOD_UPDATED', label: 'Periodo Actualizado' },
  { value: 'PERIOD_DELETED', label: 'Periodo Eliminado' },
];

const MODULE_OPTIONS = [
  { value: 'all', label: 'Todos los módulos' },
  { value: 'USERS', label: 'Usuarios' },
  { value: 'ROLES', label: 'Roles' },
  { value: 'OFFICES', label: 'Oficinas' },
  { value: 'DOCUMENT_TYPES', label: 'Tipos de Documento' },
  { value: 'PERIODS', label: 'Periodos' },
  { value: 'DOCUMENTS', label: 'Documentos' },
  { value: 'AUTH', label: 'Autenticación' },
];

export function AuditFilters({ onFilter, onClear, loading }: AuditFiltersProps) {
  const [filters, setFilters] = useState<AuditLogsFilters>({ 
    action: 'all', 
    module: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const handleFilterChange = (key: keyof AuditLogsFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
  };

  const handleSearch = () => {
    const cleanFilters: AuditLogsFilters = {};
    
    if (filters.action && filters.action !== 'all') {
      cleanFilters.action = filters.action;
    }
    if (filters.module && filters.module !== 'all') {
      cleanFilters.module = filters.module;
    }
    if (filters.dateFrom) {
      cleanFilters.dateFrom = filters.dateFrom;
    }
    if (filters.dateTo) {
      cleanFilters.dateTo = filters.dateTo;
    }
    
    onFilter(cleanFilters);
  };

  const handleClear = () => {
    setFilters({ action: 'all', module: 'all', dateFrom: '', dateTo: '' });
    onClear();
  };

  const hasActiveFilters = 
    (filters.action && filters.action !== 'all') ||
    (filters.module && filters.module !== 'all') ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div 
      className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-5"
      role="search"
      aria-label="Filtros de auditoría"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
        <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Filtros de búsqueda
        </h3>
        {hasActiveFilters && (
          <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
            Filtros activos
          </span>
        )}
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <Label 
            htmlFor="filter-action" 
            className="text-xs font-medium text-gray-600 dark:text-slate-400"
          >
            Acción
          </Label>
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger 
              id="filter-action"
              className="dark:bg-slate-800 dark:border-slate-700 focus:ring-emerald-500"
            >
              <SelectValue placeholder="Todas las acciones" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700 max-h-64">
              {ACTION_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label 
            htmlFor="filter-module" 
            className="text-xs font-medium text-gray-600 dark:text-slate-400"
          >
            Módulo
          </Label>
          <Select
            value={filters.module || 'all'}
            onValueChange={(value) => handleFilterChange('module', value)}
          >
            <SelectTrigger 
              id="filter-module"
              className="dark:bg-slate-800 dark:border-slate-700 focus:ring-emerald-500"
            >
              <SelectValue placeholder="Todos los módulos" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {MODULE_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label 
            htmlFor="filter-date-from" 
            className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Desde
          </Label>
          <Input
            id="filter-date-from"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="dark:bg-slate-800 dark:border-slate-700 focus:ring-emerald-500"
            aria-label="Fecha desde"
          />
        </div>

        <div className="space-y-1.5">
          <Label 
            htmlFor="filter-date-to" 
            className="text-xs font-medium text-gray-600 dark:text-slate-400 flex items-center gap-1"
          >
            <Calendar className="h-3 w-3" aria-hidden="true" />
            Hasta
          </Label>
          <Input
            id="filter-date-to"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="dark:bg-slate-800 dark:border-slate-700 focus:ring-emerald-500"
            aria-label="Fecha hasta"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <Search className="h-4 w-4 mr-2" aria-hidden="true" />
          Buscar
        </Button>
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={handleClear} 
            disabled={loading}
            className="dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="h-4 w-4 mr-2" aria-hidden="true" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
