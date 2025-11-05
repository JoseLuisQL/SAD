'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  Eye,
  Download,
  FolderOpen,
  MoreVertical,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
        <Search className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Intenta ajustar tus criterios de búsqueda o filtros para obtener mejores resultados.
        </p>
      </div>
    );
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

      <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
        <Table>
          <TableHeader className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
            <TableRow className="border-slate-200 dark:border-slate-700">
              <TableHead>
                <SortableHeader
                  label="Número"
                  field="documentNumber"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>
                <SortableHeader
                  label="Fecha"
                  field="documentDate"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>
                <SortableHeader
                  label="Remitente"
                  field="sender"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead>Oficina</TableHead>
              <TableHead>Archivador</TableHead>
              <TableHead>Folios</TableHead>
              <TableHead>Estado OCR</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((document, idx) => (
              <TableRow 
                key={document.id} 
                className="hover:bg-slate-50 dark:hover:bg-slate-800 odd:bg-slate-50/50 dark:odd:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                data-tour={idx === 0 ? "search-result-row" : undefined}
              >
                <TableCell className="font-medium text-slate-900 dark:text-white">
                  <HighlightedText 
                    text={document.documentNumber}
                    terms={document.searchMetadata?.matchedTerms}
                  />
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">
                  {format(new Date(document.documentDate), 'dd MMM yyyy', { locale: es })}
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">{document.documentType.name}</TableCell>
                <TableCell className="max-w-xs text-slate-700 dark:text-slate-300">
                  <HighlightedText 
                    text={document.sender}
                    terms={document.searchMetadata?.matchedTerms}
                  />
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">{document.office.name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div className="font-medium text-slate-900 dark:text-white">{document.archivador.code}</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      {document.archivador.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-slate-700 dark:text-slate-300">{document.folioCount}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <OCRStatusBadge 
                      status={document.ocrStatus} 
                    />
                    {document.searchMetadata && (
                      <div className="flex gap-1">
                        {document.searchMetadata.hasOcrMatch && (
                          <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            OCR
                          </Badge>
                        )}
                        {document.searchMetadata.hasAnnotationMatch && (
                          <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                            Anotaciones
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(document)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Vista rápida
                        </DropdownMenuItem>
                      )}
                      {onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(document)}>
                          <Download className="mr-2 h-4 w-4" />
                          Descargar
                        </DropdownMenuItem>
                      )}
                      {document.expediente && onViewExpediente && (
                        <DropdownMenuItem 
                          onClick={() => onViewExpediente(document.expediente!.id)}
                        >
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Ver Expediente
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

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            Página {pagination.page} de {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="border-slate-200 dark:border-slate-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="border-slate-200 dark:border-slate-700"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
