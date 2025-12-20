'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Eye, Pencil, Trash2, Building2, FileText, X, Plus, Upload } from 'lucide-react';

type TypologyType = 'office' | 'documentType' | 'period';

interface TypologyTableProps {
  type: TypologyType;
  data: any[];
  loading?: boolean;
  selected?: string[];
  onSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (id: string) => void;
  onBulkAction?: (action: 'delete' | 'activate' | 'deactivate') => void;
  onCreateNew?: () => void;
  onImport?: () => void;
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
  onCreateNew,
  onImport,
}: TypologyTableProps) {
  const hasSelection = selected.length > 0;
  const allSelected = data.length > 0 && selected.length === data.length;

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(allSelected ? [] : data.map(item => item.id));
    }
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'office':
        return { 
          columns: ['Código', 'Nombre', 'Descripción', 'Estado', 'Documentos', 'Acciones'],
          singular: 'oficina',
          plural: 'oficinas',
          icon: Building2
        };
      case 'documentType':
        return { 
          columns: ['Código', 'Nombre', 'Descripción', 'Estado', 'Documentos', 'Acciones'],
          singular: 'tipo de documento',
          plural: 'tipos de documento',
          icon: FileText
        };
      case 'period':
        return { 
          columns: ['Año', 'Descripción', 'Estado', 'Archivadores', 'Acciones'],
          singular: 'periodo',
          plural: 'periodos',
          icon: FileText
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  const renderCell = (item: any, column: string) => {
    switch (column) {
      case 'Código':
        return (
          <span className="font-mono font-semibold text-gray-900 dark:text-slate-100">
            {item.code}
          </span>
        );
      case 'Año':
        return (
          <span className="font-mono font-semibold text-lg text-gray-900 dark:text-slate-100">
            {item.year}
          </span>
        );
      case 'Nombre':
        return (
          <span className="font-medium text-gray-900 dark:text-slate-100">
            {item.name}
          </span>
        );
      case 'Descripción':
        return (
          <span 
            className="max-w-md truncate block text-gray-600 dark:text-slate-400" 
            title={item.description}
          >
            {item.description || <span className="text-gray-400 dark:text-slate-500 italic">Sin descripción</span>}
          </span>
        );
      case 'Estado':
        return item.isActive ? (
          <Badge 
            variant="default" 
            className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100"
          >
            Activo
          </Badge>
        ) : (
          <Badge 
            variant="secondary" 
            className="bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400"
          >
            Inactivo
          </Badge>
        );
      case 'Documentos':
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-slate-100 tabular-nums">
              {item._count?.documents || 0}
            </span>
            {(item._count?.documents || 0) > 100 && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                Popular
              </span>
            )}
          </div>
        );
      case 'Archivadores':
        return (
          <span className="font-medium text-gray-900 dark:text-slate-100 tabular-nums">
            {item._count?.archivadores || 0}
          </span>
        );
      case 'Acciones':
        return (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <TooltipProvider delayDuration={0}>
              {onView && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item.id)}
                      className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      aria-label={`Ver detalle de ${item.name || item.year}`}
                    >
                      <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="dark:bg-slate-800 dark:border-slate-700">
                    Ver detalle
                  </TooltipContent>
                </Tooltip>
              )}
              
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(item)}
                      className="h-8 w-8 p-0 hover:bg-amber-50 dark:hover:bg-amber-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                      aria-label={`Editar ${item.name || item.year}`}
                    >
                      <Pencil className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="dark:bg-slate-800 dark:border-slate-700">
                    Editar
                  </TooltipContent>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      aria-label={`Eliminar ${item.name || item.year}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="dark:bg-slate-800 dark:border-slate-700">
                    Eliminar
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-6"
        role="status"
        aria-label="Cargando datos"
      >
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex gap-4 items-center animate-pulse">
              <Skeleton className="h-5 w-5 rounded dark:bg-slate-800" />
              <Skeleton className="h-10 w-24 dark:bg-slate-800" />
              <Skeleton className="h-10 flex-1 dark:bg-slate-800" />
              <Skeleton className="h-10 w-48 dark:bg-slate-800" />
              <Skeleton className="h-6 w-16 dark:bg-slate-800" />
              <Skeleton className="h-6 w-12 dark:bg-slate-800" />
              <Skeleton className="h-8 w-24 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <span className="sr-only">Cargando lista de {config.plural}...</span>
      </div>
    );
  }

  // Empty state mejorado
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-6">
            <IconComponent className="h-10 w-10 text-blue-500 dark:text-blue-400" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No hay {config.plural} registradas
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            Comienza creando tu primera {config.singular} para organizar los documentos del sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onCreateNew && (
              <Button 
                onClick={onCreateNew} 
                className="gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Crear Primera {config.singular.charAt(0).toUpperCase() + config.singular.slice(1)}
              </Button>
            )}
            {onImport && (
              <Button 
                variant="outline" 
                onClick={onImport} 
                className="gap-2 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Importar desde Excel
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {hasSelection && onBulkAction && (
        <div 
          className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          role="region"
          aria-label="Acciones masivas"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <p className="font-medium text-blue-900 dark:text-blue-300">
                {selected.length} {selected.length === 1 ? 'elemento seleccionado' : 'elementos seleccionados'}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('activate')}
                  className="bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Activar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('deactivate')}
                  className="bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  Desactivar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction('delete')}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 border-red-200 dark:border-red-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  Eliminar
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectAll && onSelectAll([])}
              className="dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <X className="h-4 w-4 mr-2" aria-hidden="true" />
              Cancelar selección
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table 
            className="w-full" 
            role="grid" 
            aria-label={`Lista de ${config.plural}`}
          >
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
              <tr role="row">
                {onSelect && (
                  <th scope="col" className="px-4 py-3 w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label={allSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    />
                  </th>
                )}
                {config.columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 ${
                      column === 'Acciones' ? 'text-right' : ''
                    }`}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800" role="rowgroup">
              {data.map((item) => (
                <tr
                  key={item.id}
                  role="row"
                  className={`group transition-colors duration-150 ${
                    selected.includes(item.id) 
                      ? 'bg-blue-50 dark:bg-blue-950/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
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
                  {config.columns.map((column) => (
                    <td 
                      key={column} 
                      className="px-4 py-3 text-sm"
                    >
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
