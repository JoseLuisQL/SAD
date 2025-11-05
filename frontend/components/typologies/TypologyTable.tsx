'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Pencil, Trash2, FileText, X } from 'lucide-react';

type TypologyType = 'office' | 'documentType' | 'period';

interface TypologyTableProps {
  type: TypologyType;
  data: any[];
  loading?: boolean;
  selected?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onBulkAction?: (action: 'delete' | 'activate' | 'deactivate') => void;
}

export function TypologyTable({
  type,
  data,
  loading = false,
  selected = [],
  onSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onView,
  onBulkAction,
}: TypologyTableProps) {
  const hasSelection = selected.length > 0;
  const allSelected = data.length > 0 && selected.length === data.length;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(allSelected ? [] : data.map(item => item.id));
    }
  };

  const getColumns = () => {
    switch (type) {
      case 'office':
        return ['Código', 'Nombre', 'Descripción', 'Estado', 'Documentos', 'Acciones'];
      case 'documentType':
        return ['Código', 'Nombre', 'Descripción', 'Estado', 'Documentos', 'Acciones'];
      case 'period':
        return ['Año', 'Descripción', 'Estado', 'Archivadores', 'Acciones'];
    }
  };

  const renderCell = (item: any, column: string) => {
    switch (column) {
      case 'Código':
        return <span className="font-mono font-semibold text-gray-900 dark:text-slate-100">{item.code}</span>;
      case 'Año':
        return <span className="font-mono font-semibold text-lg text-gray-900 dark:text-slate-100">{item.year}</span>;
      case 'Nombre':
        return <span className="font-medium text-gray-900 dark:text-slate-100">{item.name}</span>;
      case 'Descripción':
        return (
          <span className="max-w-md truncate block text-gray-800 dark:text-slate-200" title={item.description}>
            {item.description || '-'}
          </span>
        );
      case 'Estado':
        return item.isActive ? (
          <Badge variant="default" className="bg-green-600 dark:bg-green-700">Activo</Badge>
        ) : (
          <Badge variant="secondary" className="dark:bg-slate-700 dark:text-slate-300">Inactivo</Badge>
        );
      case 'Documentos':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-slate-100">{item._count?.documents || 0}</span>
            {(item._count?.documents || 0) > 100 && (
              <span className="text-xs bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                🔥 Top
              </span>
            )}
          </div>
        );
      case 'Archivadores':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-slate-100">{item._count?.archivadores || 0}</span>
          </div>
        );
      case 'Acciones':
        return (
          <div className="flex justify-end gap-2">
            <TooltipProvider>
              {onView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onView(item.id)}
                      className="hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Eye className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">Ver detalle</TooltipContent>
                </Tooltip>
              )}
              
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(item)}
                      className="hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <Pencil className="h-4 w-4 text-gray-700 dark:text-slate-300" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">Editar</TooltipContent>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(item.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">Eliminar</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        );
      default:
        return null;
    }
  };

  const columns = getColumns();

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex gap-4 items-center">
              <Skeleton className="h-12 w-12 dark:bg-slate-800" />
              <Skeleton className="h-12 flex-1 dark:bg-slate-800" />
              <Skeleton className="h-12 w-32 dark:bg-slate-800" />
              <Skeleton className="h-12 w-24 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
        <FileText className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
        <p className="text-xl font-medium text-gray-600 dark:text-slate-300 mb-2">
          No se encontraron {type === 'office' ? 'oficinas' : type === 'documentType' ? 'tipos de documento' : 'periodos'}
        </p>
        <p className="text-gray-500 dark:text-slate-400">
          Crea un nuevo registro o ajusta los filtros de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {hasSelection && onBulkAction && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="font-medium text-blue-900 dark:text-blue-300">
                {selected.length} {selected.length === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('activate')}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Activar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('deactivate')}
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Desactivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('delete')}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 dark:border-slate-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAll && onSelectAll([])}
              className="dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                {onSelect && (
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Seleccionar todos"
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column}
                    className={`px-4 py-3 text-left text-sm font-semibold uppercase text-gray-700 dark:text-slate-300 ${
                      column === 'Acciones' ? 'text-right' : ''
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    selected.includes(item.id) 
                      ? 'bg-blue-50 dark:bg-blue-950/30' 
                      : index % 2 === 0 
                      ? 'bg-white dark:bg-slate-900' 
                      : 'bg-gray-50/50 dark:bg-slate-800/50'
                  } hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors`}
                >
                  {onSelect && (
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() => onSelect(item.id)}
                        aria-label={`Seleccionar ${item.name || item.year}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-sm text-gray-900 dark:text-slate-200 font-medium">
                      {renderCell(item, column)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
