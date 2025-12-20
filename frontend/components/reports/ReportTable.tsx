'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface ReportTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  captionSrOnly?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  stickyHeader?: boolean;
}

export default function ReportTable<T extends Record<string, any>>({
  data,
  columns,
  caption = 'Tabla de datos del reporte',
  captionSrOnly = true,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  pagination,
  onSort,
  stickyHeader = true,
}: ReportTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string, sortable?: boolean) => {
    if (!sortable || !onSort) return;

    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort(columnKey, newDirection);
  };

  const getSortIcon = (columnKey: string, sortable?: boolean) => {
    if (!sortable) return null;

    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 dark:text-slate-500" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
    );
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    return row[column.key];
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  // Calcular rango para paginacion
  const startIndex = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 1;
  const endIndex = pagination 
    ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems) 
    : data.length;

  return (
    <div className="w-full space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          {/* Caption para accesibilidad */}
          <caption className={captionSrOnly ? 'sr-only' : 'p-4 text-left text-sm text-gray-600 dark:text-slate-400'}>
            {caption}
          </caption>

          {/* Header con sticky opcional */}
          <thead className={cn(
            "bg-gray-50 dark:bg-slate-800/50",
            stickyHeader && "sticky top-0 z-10"
          )}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider",
                    getAlignClass(column.align),
                    column.sortable && "cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors",
                    index === 0 && "rounded-tl-lg",
                    index === columns.length - 1 && "rounded-tr-lg",
                    column.headerClassName
                  )}
                  onClick={() => handleSort(column.key, column.sortable)}
                  tabIndex={column.sortable ? 0 : undefined}
                  role={column.sortable ? 'button' : undefined}
                  aria-sort={
                    sortColumn === column.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  onKeyDown={(e) => {
                    if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(column.key, column.sortable);
                    }
                  }}
                >
                  <div className={cn(
                    "flex items-center gap-1.5",
                    column.align === 'right' && "justify-end",
                    column.align === 'center' && "justify-center"
                  )}>
                    <span>{column.header}</span>
                    {getSortIcon(column.key, column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400">
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-slate-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
                    <span className="text-sm">Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 dark:text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors duration-150"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={cn(
                        "px-4 py-3 text-sm whitespace-nowrap",
                        getAlignClass(column.align),
                        colIndex === 0 
                          ? "font-medium text-gray-900 dark:text-white" 
                          : "text-gray-600 dark:text-slate-400",
                        column.className
                      )}
                      {...(colIndex === 0 ? { scope: 'row' } : {})}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginacion compacta - ISO 25010: Operabilidad */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {startIndex}-{endIndex} de {pagination.totalItems}
          </span>

          <nav
            className="flex items-center gap-1"
            role="navigation"
            aria-label="Paginacion de tabla"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Pagina anterior"
              className="px-2"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="text-sm text-gray-600 dark:text-slate-400 px-2 tabular-nums">
              {pagination.currentPage} / {pagination.totalPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Pagina siguiente"
              className="px-2"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </nav>

          {pagination.onPageSizeChange && (
            <select
              value={pagination.pageSize}
              onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
              className="text-sm border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filas por pagina"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}
