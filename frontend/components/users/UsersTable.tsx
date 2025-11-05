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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User } from '@/types/user.types';
import { Edit, Trash2, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function UsersTable({
  users,
  loading,
  pagination,
  onEdit,
  onDelete,
  onPageChange,
  onLimitChange,
}: UsersTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <FileX className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay usuarios</h3>
        <p className="text-gray-500 dark:text-slate-400">
          No se encontraron usuarios con los filtros aplicados.
        </p>
      </div>
    );
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <Table className="bg-white dark:bg-slate-900">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Usuario</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Nombre Completo</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Email</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Rol</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Estado</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Fecha Creación</TableHead>
              <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, index) => (
              <TableRow 
                key={user.id}
                className={`${
                  index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50'
                } hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors`}
              >
                <TableCell className="font-semibold text-gray-900 dark:text-slate-100">{user.username}</TableCell>
                <TableCell className="text-gray-800 dark:text-slate-200 font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell className="text-gray-800 dark:text-slate-200 font-medium">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="dark:border-slate-600 dark:text-slate-300">{user.role.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? 'default' : 'secondary'} className={user.isActive ? '' : 'dark:bg-slate-700 dark:text-slate-300'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-800 dark:text-slate-200 font-medium">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Editar usuario"
                      className="hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user.id)}
                      title="Eliminar usuario"
                      className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-300">Mostrar</span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-20 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              <SelectItem value="5" className="dark:text-slate-200 dark:hover:bg-slate-700">5</SelectItem>
              <SelectItem value="10" className="dark:text-slate-200 dark:hover:bg-slate-700">10</SelectItem>
              <SelectItem value="25" className="dark:text-slate-200 dark:hover:bg-slate-700">25</SelectItem>
              <SelectItem value="50" className="dark:text-slate-200 dark:hover:bg-slate-700">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700 dark:text-slate-300">
            {startIndex}-{endIndex} de {pagination.total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-gray-700 dark:text-slate-300">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
