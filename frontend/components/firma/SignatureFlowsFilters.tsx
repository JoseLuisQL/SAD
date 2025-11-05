'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { X, Filter } from 'lucide-react';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useUsers } from '@/hooks/useUsers';

export interface SignatureFlowsFiltersData {
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

export function SignatureFlowsFilters({ onFilterChange, loading }: SignatureFlowsFiltersProps) {
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { users, fetchUsers } = useUsers();
  
  const [filters, setFilters] = useState<SignatureFlowsFiltersData>({});
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string; value: string }>>([]);

  useEffect(() => {
    fetchDocumentTypes({ page: 1, limit: 100 });
    fetchUsers({ page: 1, limit: 100 });
  }, []);

  const handleFilterChange = (key: keyof SignatureFlowsFiltersData, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '')
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
      active.push({ key: 'createdById', label: `Creado por: ${creator?.firstName} ${creator?.lastName}`, value: cleanFilters.createdById });
    }
    
    if (cleanFilters.dateFrom) {
      active.push({ key: 'dateFrom', label: `Desde: ${new Date(cleanFilters.dateFrom).toLocaleDateString()}`, value: cleanFilters.dateFrom });
    }
    
    if (cleanFilters.dateTo) {
      active.push({ key: 'dateTo', label: `Hasta: ${new Date(cleanFilters.dateTo).toLocaleDateString()}`, value: cleanFilters.dateTo });
    }

    setActiveFilters(active);
    onFilterChange(cleanFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      status: undefined,
      documentTypeId: undefined,
      createdById: undefined,
      dateFrom: undefined,
      dateTo: undefined
    };
    setFilters(emptyFilters);
    setActiveFilters([]);
    onFilterChange({});
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof SignatureFlowsFiltersData];
    setFilters(newFilters);
    
    const cleanFilters = Object.fromEntries(
      Object.entries(newFilters).filter(([_, v]) => v !== undefined && v !== '')
    ) as SignatureFlowsFiltersData;
    
    setActiveFilters(prev => prev.filter(f => f.key !== key));
    onFilterChange(cleanFilters);
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Filtros de Búsqueda</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium text-slate-700 dark:text-slate-300">Estado</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger id="status" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
              <Label htmlFor="documentTypeId" className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo de Documento</Label>
              <Select value={filters.documentTypeId} onValueChange={(value) => handleFilterChange('documentTypeId', value)}>
                <SelectTrigger id="documentTypeId" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
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
              <Label htmlFor="createdById" className="text-sm font-medium text-slate-700 dark:text-slate-300">Creado Por</Label>
              <Select value={filters.createdById} onValueChange={(value) => handleFilterChange('createdById', value)}>
                <SelectTrigger id="createdById" className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700 dark:text-slate-300">Fecha Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={applyFilters} disabled={loading} className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600">
              Aplicar Filtros
            </Button>
            <Button variant="outline" onClick={clearFilters} disabled={loading} className="border-slate-300 dark:border-slate-600">
              Limpiar Todo
            </Button>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filtros activos:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter.key} variant="secondary" className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.key)}
                    className="ml-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full p-0.5"
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
