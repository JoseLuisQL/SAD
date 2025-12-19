'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  Eye,
  Download,
  FolderOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SearchResultDocument } from '@/types/search.types';
import OCRStatusBadge from '@/components/documents/OCRStatusBadge';
import { Badge } from '@/components/ui/badge';
import SortableHeader from './SortableHeader';
import HighlightedText from './HighlightedText';

interface SearchResultsTableProps {
  results: SearchResultDocument[];
  loading?: boolean;
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
  };
  onView?: (document: SearchResultDocument) => void;
  onDownload?: (document: SearchResultDocument) => void;
  onViewExpediente?: (expedienteId: string) => void;
  onPageChange?: (page: number) => void;
  onSort?: (field: string, order: 'asc' | 'desc') => void;
}

export default function SearchResultsTable({
  results,
  loading = false,
  pagination,
  onView,
  onDownload,
  onViewExpediente,
  onPageChange,
}: SearchResultsTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    field: string;
    order: 'asc' | 'desc';
  }>({ field: 'documentDate', order: 'desc' });

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSortConfig({ field, order });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
        <p className="ml-3 text-gray-600 dark:text-slate-300">Buscando documentos...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4" data-tour="search-results-table">
      {pagination && (
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
          <span>
            Mostrando {results.length} de {pagination.total} resultados
          </span>
        </div>
      )}

      {/* M7: Tabla con columnas reducidas y mejor contraste */}
      <div 
        className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
        role="grid"
        aria-label="Resultados de búsqueda"
      >
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur z-10">
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead className="w-[180px] text-slate-700 dark:text-slate-200 font-semibold">
                <SortableHeader
                  label="Documento"
                  field="documentNumber"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[100px] text-slate-700 dark:text-slate-200 font-semibold">
                <SortableHeader
                  label="Fecha"
                  field="documentDate"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="text-slate-700 dark:text-slate-200 font-semibold">
                <SortableHeader
                  label="Remitente"
                  field="sender"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="w-[100px] text-slate-700 dark:text-slate-200 font-semibold">Estado</TableHead>
              <TableHead className="w-[130px] text-right text-slate-700 dark:text-slate-200 font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((document, idx) => (
              <TableRow 
                key={document.id} 
                className={`group cursor-pointer transition-colors border-slate-100 dark:border-slate-800
                  ${idx % 2 === 0 
                    ? 'bg-white dark:bg-slate-900' 
                    : 'bg-slate-50/50 dark:bg-slate-800/30'
                  }
                  hover:bg-blue-50/50 dark:hover:bg-blue-900/20`}
                data-tour={idx === 0 ? "search-result-row" : undefined}
                onClick={() => onView?.(document)}
                tabIndex={0}
                role="row"
                aria-label={`Documento ${document.documentNumber}, ${document.sender}`}
                onKeyDown={(e) => e.key === 'Enter' && onView?.(document)}
              >
                {/* Columna combinada: Número + Tipo */}
                <TableCell className="py-3">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900 dark:text-white">
                      <HighlightedText 
                        text={document.documentNumber}
                        terms={document.searchMetadata?.matchedTerms}
                      />
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {document.documentType.name}
                    </p>
                  </div>
                </TableCell>
                
                {/* Fecha */}
                <TableCell className="text-slate-600 dark:text-slate-300 py-3">
                  {format(new Date(document.documentDate), 'dd/MM/yyyy')}
                </TableCell>
                
                {/* Remitente + Oficina en línea secundaria */}
                <TableCell className="py-3">
                  <div className="space-y-1">
                    <p className="text-slate-900 dark:text-white truncate max-w-[280px]">
                      <HighlightedText 
                        text={document.sender}
                        terms={document.searchMetadata?.matchedTerms}
                      />
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {document.office.name}
                    </p>
                  </div>
                </TableCell>
                
                {/* Estado OCR con badges minimalistas */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <OCRStatusBadge status={document.ocrStatus} />
                    {document.searchMetadata && (
                      <div className="flex flex-wrap gap-1">
                        {document.searchMetadata.hasOcrMatch && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            OCR
                          </Badge>
                        )}
                        {document.searchMetadata.hasAnnotationMatch && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Nota
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* M6: Acciones visibles en hover */}
                <TableCell className="text-right py-3">
                  <div 
                    className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            onClick={() => onView?.(document)}
                            aria-label="Vista rápida"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Vista rápida</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30"
                            onClick={() => onDownload?.(document)}
                            aria-label="Descargar documento"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Descargar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    {document.expediente && (
                      <TooltipProvider>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                              onClick={() => onViewExpediente?.(document.expediente!.id)}
                              aria-label="Ver expediente"
                            >
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Ver expediente</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación con mejor contraste */}
      {pagination && pagination.totalPages > 1 && (
        <nav 
          className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4"
          aria-label="Navegación de páginas"
        >
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Página <span className="font-medium text-slate-900 dark:text-white">{pagination.page}</span> de{' '}
            <span className="font-medium text-slate-900 dark:text-white">{pagination.totalPages}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700
                         disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Página siguiente"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
