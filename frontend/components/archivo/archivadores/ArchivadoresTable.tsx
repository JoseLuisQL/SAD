'use client';

import { Eye, Pencil, Trash2, MoreVertical, Archive, Calendar, MapPin, FileText } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Archivador } from '@/types/archivador.types';
import { cn } from '@/lib/utils';

interface ArchivadoresTableProps {
  archivadores: Archivador[];
  loading?: boolean;
  onView?: (archivador: Archivador) => void;
  onEdit?: (archivador: Archivador) => void;
  onDelete?: (archivador: Archivador) => void;
  onDetail?: (archivador: Archivador) => void;
}

export function ArchivadoresTable({
  archivadores,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onDetail,
}: ArchivadoresTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (archivadores.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
        <Archive className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay archivadores
        </h3>
        <p className="text-gray-500 dark:text-slate-400">
          No se encontraron archivadores con los filtros aplicados.
        </p>
      </div>
    );
  }

  const getOcupacionColor = (count: number): string => {
    if (count >= 80) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950';
    if (count >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950';
    if (count >= 30) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950';
    return 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Código
            </TableHead>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Nombre
            </TableHead>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Periodo
            </TableHead>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Ubicación
            </TableHead>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Documentos
            </TableHead>
            <TableHead className="bg-gray-50 dark:bg-slate-800 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {archivadores.map((archivador, index) => (
            <TableRow
              key={archivador.id}
              className={cn(
                'transition-colors hover:bg-gray-50 dark:hover:bg-slate-800',
                index % 2 === 1 && 'bg-gray-50/50 dark:bg-slate-800/50'
              )}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <span className="dark:text-white">{archivador.code}</span>
                </div>
              </TableCell>
              
              <TableCell>
                <div className="max-w-md">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {archivador.name}
                  </p>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Calendar className="h-3 w-3" />
                  {archivador.period.year}
                </Badge>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span className="font-medium">
                    {archivador.physicalLocation.estante}-{archivador.physicalLocation.modulo}
                  </span>
                </div>
                {archivador.physicalLocation.descripcion && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]">
                    {archivador.physicalLocation.descripcion}
                  </p>
                )}
              </TableCell>
              
              <TableCell>
                <div
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                    getOcupacionColor(archivador._count?.documents || 0)
                  )}
                >
                  <FileText className="h-3 w-3" />
                  {archivador._count?.documents || 0}
                </div>
              </TableCell>
              
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Abrir menú</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onDetail && (
                      <DropdownMenuItem onClick={() => onDetail(archivador)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                    )}
                    {onView && (
                      <DropdownMenuItem onClick={() => onView(archivador)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Ver completo
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(archivador)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(archivador)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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
