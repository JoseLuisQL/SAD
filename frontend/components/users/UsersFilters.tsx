'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
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
}

export function UsersFilters({ onFilter }: UsersFiltersProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState<string>('all');
  const [isActive, setIsActive] = useState<string>('all');
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

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

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      applyFilters();
    }, 500);

    setDebounceTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleId, isActive]);

  const applyFilters = () => {
    const filters: IUsersFilters = {
      page: 1,
    };

    if (search) filters.search = search;
    if (roleId && roleId !== 'all') filters.roleId = roleId;
    if (isActive && isActive !== 'all') {
      filters.isActive = isActive === 'true';
    }

    onFilter(filters);
  };

  const clearFilters = () => {
    setSearch('');
    setRoleId('all');
    setIsActive('all');
    onFilter({ page: 1 });
  };

  const hasActiveFilters = search || (roleId && roleId !== 'all') || (isActive && isActive !== 'all');

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar por nombre, email o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500"
          />
        </div>

        <div>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue placeholder="Todos los roles" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200 dark:hover:bg-slate-700">Todos los roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id} className="dark:text-slate-200 dark:hover:bg-slate-700">
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Select value={isActive} onValueChange={setIsActive}>
            <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="all" className="dark:text-slate-200 dark:hover:bg-slate-700">Todos</SelectItem>
              <SelectItem value="true" className="dark:text-slate-200 dark:hover:bg-slate-700">Activos</SelectItem>
              <SelectItem value="false" className="dark:text-slate-200 dark:hover:bg-slate-700">Inactivos</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Limpiar filtros"
              className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
