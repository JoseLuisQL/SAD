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
import { AuditLog } from '@/types/audit.types';
import { Eye, ChevronLeft, ChevronRight, FileX } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AuditTableProps {
  logs: AuditLog[];
  loading: boolean;
  pagination: Pagination;
  onViewDetails: (log: AuditLog) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const getActionColor = (action: string) => {
  if (action.includes('CREATED')) return 'bg-green-100 text-green-800';
  if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800';
  if (action.includes('DELETED')) return 'bg-red-100 text-red-800';
  if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
  if (action.includes('LOGOUT')) return 'bg-gray-100 text-gray-800';
  return 'bg-gray-100 text-gray-800';
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    USER_CREATED: 'Usuario Creado',
    USER_UPDATED: 'Usuario Actualizado',
    USER_DELETED: 'Usuario Eliminado',
    LOGIN: 'Inicio de Sesión',
    LOGOUT: 'Cierre de Sesión',
    PASSWORD_CHANGED: 'Cambio de Contraseña',
    ROLE_CREATED: 'Rol Creado',
    ROLE_UPDATED: 'Rol Actualizado',
    ROLE_DELETED: 'Rol Eliminado',
    OFFICE_CREATED: 'Oficina Creada',
    OFFICE_UPDATED: 'Oficina Actualizada',
    OFFICE_DELETED: 'Oficina Eliminada',
    DOCUMENT_TYPE_CREATED: 'Tipo Creado',
    DOCUMENT_TYPE_UPDATED: 'Tipo Actualizado',
    DOCUMENT_TYPE_DELETED: 'Tipo Eliminado',
    PERIOD_CREATED: 'Periodo Creado',
    PERIOD_UPDATED: 'Periodo Actualizado',
    PERIOD_DELETED: 'Periodo Eliminado',
  };
  return labels[action] || action;
};

const getModuleLabel = (module: string) => {
  const labels: Record<string, string> = {
    USERS: 'Usuarios',
    ROLES: 'Roles',
    OFFICES: 'Oficinas',
    DOCUMENT_TYPES: 'Tipos de Doc.',
    PERIODS: 'Periodos',
    DOCUMENTS: 'Documentos',
    AUTH: 'Autenticación',
  };
  return labels[module] || module;
};

export function AuditTable({
  logs,
  loading,
  pagination,
  onViewDetails,
  onPageChange,
  onLimitChange,
}: AuditTableProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <FileX className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay registros</h3>
        <p className="text-gray-500 dark:text-slate-400">
          No se encontraron logs de auditoría con los filtros aplicados.
        </p>
      </div>
    );
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Entidad</TableHead>
              <TableHead>IP</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {format(new Date(log.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{log.user.username}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {log.user.firstName} {log.user.lastName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getActionColor(log.action)} variant="outline">
                    {getActionLabel(log.action)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {getModuleLabel(log.module)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="text-gray-500 dark:text-slate-400">{log.entityType}</div>
                    <div className="font-mono text-xs text-gray-400 dark:text-slate-500 truncate max-w-[100px]">
                      {log.entityId}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-gray-500 dark:text-slate-400">
                  {log.ipAddress}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-slate-300">
            Mostrando {startIndex} - {endIndex} de {pagination.total} registros
          </span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
