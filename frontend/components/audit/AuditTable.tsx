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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AuditLog } from '@/types/audit.types';
import { 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  FileX,
  User,
  Globe,
  Clock
} from 'lucide-react';
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

const getActionConfig = (action: string) => {
  if (action.includes('CREATED')) return { 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800'
  };
  if (action.includes('UPDATED')) return { 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800'
  };
  if (action.includes('DELETED')) return { 
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800'
  };
  if (action.includes('LOGIN')) return { 
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800'
  };
  if (action.includes('LOGOUT')) return { 
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    borderColor: 'border-gray-200 dark:border-slate-600'
  };
  return { 
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    borderColor: 'border-gray-200 dark:border-slate-600'
  };
};

const ACTION_LABELS: Record<string, string> = {
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

const MODULE_LABELS: Record<string, string> = {
  USERS: 'Usuarios',
  ROLES: 'Roles',
  OFFICES: 'Oficinas',
  DOCUMENT_TYPES: 'Tipos Doc.',
  PERIODS: 'Periodos',
  DOCUMENTS: 'Documentos',
  AUTH: 'Auth',
};

export function AuditTable({
  logs,
  loading,
  pagination,
  onViewDetails,
  onPageChange,
  onLimitChange,
}: AuditTableProps) {
  // Loading state
  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm"
        role="status"
        aria-label="Cargando registros"
      >
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center animate-pulse">
              <Skeleton className="h-10 w-32 dark:bg-slate-800" />
              <Skeleton className="h-10 w-40 dark:bg-slate-800" />
              <Skeleton className="h-6 w-24 dark:bg-slate-800" />
              <Skeleton className="h-6 w-20 dark:bg-slate-800" />
              <Skeleton className="h-10 flex-1 dark:bg-slate-800" />
              <Skeleton className="h-8 w-8 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <span className="sr-only">Cargando registros de auditoría...</span>
      </div>
    );
  }

  // Empty state
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <FileX className="h-8 w-8 text-gray-400 dark:text-slate-500" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No hay registros de auditoría
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            No se encontraron logs con los filtros aplicados. Intenta ajustar los criterios de búsqueda.
          </p>
        </div>
      </div>
    );
  }

  const startIndex = (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table role="grid" aria-label="Registros de auditoría">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Fecha y Hora
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  Usuario
                </div>
              </TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">Acción</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">Módulo</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">Entidad</TableHead>
              <TableHead className="font-semibold text-gray-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  IP
                </div>
              </TableHead>
              <TableHead className="text-right font-semibold text-gray-700 dark:text-slate-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-slate-800">
            {logs.map((log) => {
              const actionConfig = getActionConfig(log.action);
              return (
                <TableRow 
                  key={log.id}
                  className="group hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    <div className="text-sm">
                      {format(new Date(log.createdAt), "dd/MM/yyyy", { locale: es })}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {format(new Date(log.createdAt), "HH:mm:ss", { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {log.user.username}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {log.user.firstName} {log.user.lastName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={`${actionConfig.color} border ${actionConfig.borderColor} text-xs font-medium`}
                      variant="outline"
                    >
                      {ACTION_LABELS[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 text-xs"
                    >
                      {MODULE_LABELS[log.module] || log.module}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-gray-600 dark:text-slate-400">{log.entityType}</div>
                      <div className="font-mono text-xs text-gray-400 dark:text-slate-500 truncate max-w-[120px]" title={log.entityId}>
                        {log.entityId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 dark:text-slate-400 font-mono">
                    {log.ipAddress}
                  </TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewDetails(log)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 dark:hover:bg-emerald-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            aria-label={`Ver detalle del registro de ${log.user.username}`}
                          >
                            <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="dark:bg-slate-800 dark:border-slate-700">
                          Ver detalle completo
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando <span className="font-medium">{startIndex}</span> - <span className="font-medium">{endIndex}</span> de <span className="font-medium">{pagination.total}</span>
          </span>
          <Select
            value={pagination.limit.toString()}
            onValueChange={(value) => onLimitChange(Number(value))}
          >
            <SelectTrigger 
              className="w-[80px] h-8 text-sm dark:bg-slate-800 dark:border-slate-700"
              aria-label="Registros por página"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
              {[10, 25, 50, 100].map((limit) => (
                <SelectItem 
                  key={limit} 
                  value={limit.toString()}
                  className="dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {limit}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500 dark:text-slate-500">por página</span>
        </div>

        <nav className="flex items-center gap-1" aria-label="Paginación">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(1)}
            disabled={pagination.page === 1}
            aria-label="Primera página"
          >
            <ChevronsLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          
          <span className="px-3 text-sm font-medium text-gray-700 dark:text-slate-300" aria-current="page">
            {pagination.page} / {pagination.totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={pagination.page >= pagination.totalPages}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
