'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Eye, Edit, Trash2, MoreVertical, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Expediente } from '@/types/expediente.types';
import { Badge } from '@/components/ui/badge';

interface ExpedientesTableProps {
  expedientes: Expediente[];
  loading?: boolean;
  onView?: (expediente: Expediente) => void;
  onEdit?: (expediente: Expediente) => void;
  onDelete?: (expediente: Expediente) => void;
}

export default function ExpedientesTable({
  expedientes,
  loading = false,
  onView,
  onEdit,
  onDelete,
}: ExpedientesTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (expedientes.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay expedientes
        </h3>
        <p className="text-gray-500 dark:text-slate-400">
          No se encontraron expedientes con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Table className="bg-white dark:bg-slate-900">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Código</TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Nombre</TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Documentos</TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Creado Por</TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Fecha de Creación</TableHead>
            <TableHead className="text-right font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expedientes.map((expediente, index) => (
            <TableRow
              key={expediente.id}
              className={`${
                index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50'
              } hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors`}
            >
              <TableCell className="font-semibold text-gray-900 dark:text-slate-100">
                {expediente.code}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium text-gray-900 dark:text-slate-100">{expediente.name}</div>
                  {expediente.description && (
                    <div className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-[300px] mt-1">
                      {expediente.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-medium">
                  {expediente._count?.documents || 0} documentos
                </Badge>
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {expediente.creator.firstName} {expediente.creator.lastName}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-slate-400 mt-0.5">
                    @{expediente.creator.username}
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-800 dark:text-slate-200 font-medium">
                {format(new Date(expediente.createdAt), 'dd MMM yyyy', {
                  locale: es,
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-slate-700">
                      <MoreVertical className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(expediente)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                        <Eye className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                        Ver detalles
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(expediente)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                        <Edit className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(expediente)}
                        className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-slate-700"
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
                        Eliminar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
