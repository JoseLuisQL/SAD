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
import { Search, X, Download } from 'lucide-react';
import { AuditLogsFilters } from '@/types/audit.types';

interface AuditFiltersProps {
  onFilter: (filters: AuditLogsFilters) => void;
  onClear: () => void;
  loading?: boolean;
}

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
    // Filtrar los valores vacíos y 'all'
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

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="action" className="font-medium text-gray-700 dark:text-slate-300">Acción</Label>
          <Select
            value={filters.action || 'all'}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger id="action">
              <SelectValue placeholder="Todas las acciones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="USER_CREATED">Usuario Creado</SelectItem>
              <SelectItem value="USER_UPDATED">Usuario Actualizado</SelectItem>
              <SelectItem value="USER_DELETED">Usuario Eliminado</SelectItem>
              <SelectItem value="LOGIN">Inicio de Sesión</SelectItem>
              <SelectItem value="LOGOUT">Cierre de Sesión</SelectItem>
              <SelectItem value="PASSWORD_CHANGED">Cambio de Contraseña</SelectItem>
              <SelectItem value="ROLE_CREATED">Rol Creado</SelectItem>
              <SelectItem value="ROLE_UPDATED">Rol Actualizado</SelectItem>
              <SelectItem value="ROLE_DELETED">Rol Eliminado</SelectItem>
              <SelectItem value="OFFICE_CREATED">Oficina Creada</SelectItem>
              <SelectItem value="OFFICE_UPDATED">Oficina Actualizada</SelectItem>
              <SelectItem value="OFFICE_DELETED">Oficina Eliminada</SelectItem>
              <SelectItem value="DOCUMENT_TYPE_CREATED">Tipo Documento Creado</SelectItem>
              <SelectItem value="DOCUMENT_TYPE_UPDATED">Tipo Documento Actualizado</SelectItem>
              <SelectItem value="DOCUMENT_TYPE_DELETED">Tipo Documento Eliminado</SelectItem>
              <SelectItem value="PERIOD_CREATED">Periodo Creado</SelectItem>
              <SelectItem value="PERIOD_UPDATED">Periodo Actualizado</SelectItem>
              <SelectItem value="PERIOD_DELETED">Periodo Eliminado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="module" className="font-medium text-gray-700 dark:text-slate-300">Módulo</Label>
          <Select
            value={filters.module || 'all'}
            onValueChange={(value) => handleFilterChange('module', value)}
          >
            <SelectTrigger id="module">
              <SelectValue placeholder="Todos los módulos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="USERS">Usuarios</SelectItem>
              <SelectItem value="ROLES">Roles</SelectItem>
              <SelectItem value="OFFICES">Oficinas</SelectItem>
              <SelectItem value="DOCUMENT_TYPES">Tipos de Documento</SelectItem>
              <SelectItem value="PERIODS">Periodos</SelectItem>
              <SelectItem value="DOCUMENTS">Documentos</SelectItem>
              <SelectItem value="AUTH">Autenticación</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateFrom" className="font-medium text-gray-700 dark:text-slate-300">Desde</Label>
          <Input
            id="dateFrom"
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateTo" className="font-medium text-gray-700 dark:text-slate-300">Hasta</Label>
          <Input
            id="dateTo"
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4 mr-2" />
          Buscar
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Limpiar
        </Button>
      </div>
    </div>
  );
}
