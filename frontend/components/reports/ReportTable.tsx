'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
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
      return <ChevronsUpDown className="h-4 w-4 text-slate-400" />;
    }

    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-slate-700" />
    ) : (
      <ChevronDown className="h-4 w-4 text-slate-700" />
    );
  };

  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      return column.accessor(row);
    }
    return row[column.key];
  };

  return (
    <div className="w-full space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          {/* Caption para accesibilidad - ISO 9241-110: Auto-explicación */}
          <caption className={captionSrOnly ? 'sr-only' : 'p-4 text-left text-sm text-gray-600 dark:text-slate-400'}>
            {caption}
          </caption>

          {/* Thead con sticky header */}
          <thead className={`bg-slate-50 dark:bg-slate-800 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors' : ''
                  } ${column.headerClassName || ''}`}
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
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {getSortIcon(column.key, column.sortable)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Tbody con zebra stripes */}
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-slate-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 dark:border-slate-400"></div>
                    <span>Cargando datos...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${
                    rowIndex % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column.key}`}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        colIndex === 0 ? 'font-medium text-gray-900 dark:text-white' : 'text-gray-600 dark:text-slate-400'
                      } ${column.className || ''}`}
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

      {/* Paginación accesible - WCAG 2.1: Navegación con teclado */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando{' '}
            <span className="font-medium">
              {(pagination.currentPage - 1) * pagination.pageSize + 1}
            </span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
            </span>{' '}
            de <span className="font-medium">{pagination.totalItems}</span> resultados
          </div>

          <nav
            className="flex items-center gap-2"
            role="navigation"
            aria-label="Paginación de tabla"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.currentPage === 1}
              aria-label="Primera página"
            >
              Primera
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              aria-label="Página anterior"
            >
              Anterior
            </Button>

            <span className="text-sm text-gray-600 dark:text-slate-400 px-3">
              Página{' '}
              <span className="font-medium">{pagination.currentPage}</span> de{' '}
              <span className="font-medium">{pagination.totalPages}</span>
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Página siguiente"
            >
              Siguiente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              aria-label="Última página"
            >
              Última
            </Button>
          </nav>

          {pagination.onPageSizeChange && (
            <div className="flex items-center gap-2">
              <label htmlFor="pageSize" className="text-sm text-gray-600 dark:text-slate-400">
                Mostrar:
              </label>
              <select
                id="pageSize"
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange!(Number(e.target.value))}
                className="border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
