'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Role } from '@/types/user.types';
import { rolesApi } from '@/lib/api/roles';
import { UsersFilters as IUsersFilters } from '@/types/user.types';

interface UsersFiltersProps {
  onFilter: (filters: IUsersFilters) => void;
  onActiveFiltersChange?: (hasActive: boolean) => void;
}

export function UsersFilters({ onFilter, onActiveFiltersChange }: UsersFiltersProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState<string>('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Calcular filtros activos
  const activeFilterCount = [
    search ? 1 : 0,
    roleId !== 'all' ? 1 : 0,
    isActive !== 'all' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const hasActiveFilters = activeFilterCount > 0;

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await rolesApi.getAll();
        setRoles(response.data.data);
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };

    fetchRoles();
  }, []);

  const applyFilters = useCallback(() => {
    const filters: IUsersFilters = {
      page: 1,
    };

    if (search) filters.search = search;
    if (roleId && roleId !== 'all') filters.roleId = roleId;
    if (isActive && isActive !== 'all') {
      filters.isActive = isActive === 'true';
    }

    onFilter(filters);
  }, [search, roleId, isActive, onFilter]);

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      applyFilters();
    }, 400);

    setDebounceTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleId, isActive]);

  // Notificar cambio en filtros activos
  useEffect(() => {
    onActiveFiltersChange?.(hasActiveFilters);
  }, [hasActiveFilters, onActiveFiltersChange]);

  const clearFilters = () => {
    setSearch('');
    setRoleId('all');
    setIsActive('all');
    onFilter({ page: 1 });
  };

  const clearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };

  // Exponer método para enfocar búsqueda (para atajos de teclado)
  const focusSearch = () => {
    searchInputRef.current?.focus();
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" 
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Buscar por nombre, email o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
            aria-label="Buscar usuarios"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              aria-label="Limpiar búsqueda"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger 
              className="w-40 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              aria-label="Filtrar por rol"
            >
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200 dark:hover:bg-slate-700">
                Todos los roles
              </SelectItem>
              {roles.map((role) => (
                <SelectItem 
                  key={role.id} 
                  value={role.id} 
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger 
              className="w-32 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              aria-label="Filtrar por estado"
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200 dark:hover:bg-slate-700">
                Todos
              </SelectItem>
              <SelectItem value="true" className="dark:text-slate-200 dark:hover:bg-slate-700">
                Activos
              </SelectItem>
              <SelectItem value="false" className="dark:text-slate-200 dark:hover:bg-slate-700">
                Inactivos
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Indicador de filtros activos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
              >
                {activeFilterCount} filtro{activeFilterCount > 1 ? 's' : ''} activo{activeFilterCount > 1 ? 's' : ''}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar todo
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
