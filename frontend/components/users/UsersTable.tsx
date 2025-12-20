'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { User } from '@/types/user.types';
import { 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  SearchX,
  UserPlus
} from 'lucide-react';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  pagination: Pagination;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  onViewDetails: (user: User) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onCreateUser?: () => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function UsersTable({
  users,
  loading,
  pagination,
  onEdit,
  onDelete,
  onViewDetails,
  onPageChange,
  onLimitChange,
  onCreateUser,
  onClearFilters,
  hasActiveFilters = false,
}: UsersTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full dark:bg-slate-800" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48 dark:bg-slate-800" />
                <Skeleton className="h-3 w-32 dark:bg-slate-800" />
              </div>
              <Skeleton className="h-6 w-20 dark:bg-slate-800" />
              <Skeleton className="h-6 w-16 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado vacío sin filtros activos
  if (users.length === 0 && !hasActiveFilters) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <Users className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No hay usuarios registrados
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Comience creando el primer usuario del sistema.
        </p>
        {onCreateUser && (
          <Button onClick={onCreateUser} className="mt-4">
            <UserPlus className="mr-2 h-4 w-4" />
            Crear primer usuario
          </Button>
        )}
      </div>
    );
  }

  // Estado vacío con filtros activos
  if (users.length === 0 && hasActiveFilters) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <SearchX className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-600" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Sin resultados
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          No se encontraron usuarios con los filtros aplicados.
        </p>
        {onClearFilters && (
          <Button variant="outline" onClick={onClearFilters} className="mt-4">
            Limpiar filtros
          </Button>
        )}
      </div>
    );
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        {/* Anuncio para lectores de pantalla */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          Se encontraron {pagination.total} usuarios
        </div>

        <div className="overflow-x-auto">
          <Table role="grid" aria-label="Lista de usuarios del sistema">
            <TableHeader>
              <TableRow className="border-b border-gray-200 dark:border-slate-700 hover:bg-transparent">
                <TableHead 
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Usuario
                </TableHead>
                <TableHead 
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Email
                </TableHead>
                <TableHead 
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Rol
                </TableHead>
                <TableHead 
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Estado
                </TableHead>
                <TableHead 
                  className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right"
                  scope="col"
                >
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow 
                  key={user.id}
                  className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                  tabIndex={0}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="text-xs font-medium bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          {user.firstName[0]}{user.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-slate-300 text-sm">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-medium dark:border-slate-600 dark:text-slate-300">
                      {user.role.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={user.isActive} size="sm" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onViewDetails(user)}
                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                            aria-label={`Ver detalles de ${user.firstName} ${user.lastName}`}
                          >
                            <Eye className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Ver detalles</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(user)}
                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-slate-700"
                            aria-label={`Editar ${user.firstName} ${user.lastName}`}
                          >
                            <Edit className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Editar usuario</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(user.id)}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                            aria-label={`Eliminar ${user.firstName} ${user.lastName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Eliminar usuario</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-slate-400">Mostrar</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger 
                className="w-16 h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                aria-label="Seleccionar cantidad de resultados por página"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="5" className="dark:text-slate-200 dark:hover:bg-slate-700">5</SelectItem>
                <SelectItem value="10" className="dark:text-slate-200 dark:hover:bg-slate-700">10</SelectItem>
                <SelectItem value="25" className="dark:text-slate-200 dark:hover:bg-slate-700">25</SelectItem>
                <SelectItem value="50" className="dark:text-slate-200 dark:hover:bg-slate-700">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-gray-600 dark:text-slate-300">
              {startIndex}-{endIndex} de {pagination.total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <span className="text-sm text-gray-600 dark:text-slate-300 px-2">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="h-8 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
