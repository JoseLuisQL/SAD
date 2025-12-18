'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  Eye,
  Download,
  Trash2,
  FileText,
  ChevronDown,
  ChevronRight,
  Building2,
  User,
  FolderArchive,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Document } from '@/types/document.types';
import { DocumentStatusIndicator } from './DocumentStatusIndicator';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';

interface DocumentsTableProps {
  documents: Document[];
  loading?: boolean;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
}

export default function DocumentsTable({
  documents,
  loading = false,
  onView,
  onDownload,
  onDelete,
}: DocumentsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
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
      <div className="flex flex-col items-center justify-center py-12" role="status" aria-label="Cargando documentos">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
        <p className="text-gray-500 dark:text-slate-400">Cargando documentos...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No hay documentos"
        description="No se encontraron documentos con los filtros aplicados. Intenta ajustar los filtros o crea un nuevo documento."
      />
    );
  }

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
            <TableHead className="w-10" aria-label="Expandir"></TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300">
              Documento
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300">
              Fecha
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300">
              Remitente
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300">
              Estado
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300">
              Archivador
            </TableHead>
            <TableHead className="font-semibold text-xs uppercase text-gray-700 dark:text-slate-300 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document, index) => {
            const isExpanded = expandedRows.has(document.id);
            
            return (
              <>
                <TableRow
                  key={document.id}
                  className={cn(
                    'transition-colors cursor-pointer',
                    index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50',
                    'hover:bg-blue-50/50 dark:hover:bg-slate-700/50'
                  )}
                  onClick={() => toggleRow(document.id)}
                  role="row"
                  aria-expanded={isExpanded}
                >
                  <TableCell className="w-10">
                    <button
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
                      aria-label={isExpanded ? 'Colapsar detalles' : 'Expandir detalles'}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(document.id);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                      )}
                    </button>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {document.documentNumber}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {document.documentType.name}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-gray-700 dark:text-slate-300">
                    {format(new Date(document.documentDate), 'dd MMM yyyy', { locale: es })}
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-gray-700 dark:text-slate-300 max-w-[200px] truncate block">
                      {document.sender}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <DocumentStatusIndicator
                      ocrStatus={document.ocrStatus}
                      signatureStatus={document.signatureStatus}
                      compact
                    />
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {document.archivador.code}
                    </span>
                  </TableCell>
                  
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                              onClick={() => onView?.(document)}
                              aria-label={`Ver documento ${document.documentNumber}`}
                            >
                              <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ver detalles</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-green-100 dark:hover:bg-green-900/30"
                              onClick={() => onDownload?.(document)}
                              aria-label={`Descargar documento ${document.documentNumber}`}
                            >
                              <Download className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Descargar PDF</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/30"
                              onClick={() => onDelete?.(document)}
                              aria-label={`Eliminar documento ${document.documentNumber}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Eliminar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>

                {isExpanded && (
                  <TableRow 
                    key={`${document.id}-details`}
                    className="bg-gray-50 dark:bg-slate-800/70"
                  >
                    <TableCell colSpan={7} className="p-0">
                      <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Oficina</p>
                            <p className="text-sm text-gray-900 dark:text-white">{document.office.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <FolderArchive className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Archivador</p>
                            <p className="text-sm text-gray-900 dark:text-white">{document.archivador.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Folios</p>
                            <p className="text-sm text-gray-900 dark:text-white">{document.folioCount} paginas</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <HardDrive className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Archivo</p>
                            <p className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]" title={document.fileName}>
                              {document.fileName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{formatFileSize(document.fileSize)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Creado por</p>
                            <p className="text-sm text-gray-900 dark:text-white">{document.creator.fullName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Fecha creacion</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </p>
                          </div>
                        </div>

                        {document.annotations && (
                          <div className="col-span-2 flex items-start gap-2">
                            <FileText className="h-4 w-4 text-gray-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Anotaciones</p>
                              <p className="text-sm text-gray-900 dark:text-white">{document.annotations}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
