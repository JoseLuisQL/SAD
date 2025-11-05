'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import {
  Eye,
  Download,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
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
import { Document } from '@/types/document.types';
import OCRStatusBadge from './OCRStatusBadge';
import { SignatureStatusBadge } from './SignatureStatusBadge';

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
  onEdit,
  onDelete,
}: DocumentsTableProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay documentos</h3>
        <p className="text-gray-500 dark:text-slate-400">
          No se encontraron documentos con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
      <Table className="bg-white dark:bg-slate-900">
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800">
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Número
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Fecha
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Tipo
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Remitente
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Oficina
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Archivador
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Folios
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Archivo
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Estado OCR
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300">
              Estado Firma
            </TableHead>
            <TableHead className="font-semibold uppercase text-xs text-gray-700 dark:text-slate-300 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document, index) => (
            <TableRow
              key={document.id}
              className={`${
                index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-gray-50/50 dark:bg-slate-800/50'
              } hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors`}
            >
              <TableCell className="font-semibold text-gray-900 dark:text-slate-100">{document.documentNumber}</TableCell>
              <TableCell className="text-gray-800 dark:text-slate-200 font-medium">
                {format(new Date(document.documentDate), 'dd MMM yyyy', { locale: es })}
              </TableCell>
              <TableCell className="text-gray-800 dark:text-slate-200 font-medium">{document.documentType.name}</TableCell>
              <TableCell className="text-gray-800 dark:text-slate-200 font-medium">{document.sender}</TableCell>
              <TableCell className="text-gray-800 dark:text-slate-200 font-medium">{document.office.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900 dark:text-slate-100">{document.archivador.code}</div>
                  <div className="text-gray-600 dark:text-slate-400 text-xs font-medium">{document.archivador.name}</div>
                </div>
              </TableCell>
              <TableCell className="text-gray-800 dark:text-slate-200 font-medium">{document.folioCount}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900 dark:text-slate-100 truncate max-w-[150px]">
                    {document.fileName}
                  </div>
                  <div className="text-gray-600 dark:text-slate-400 text-xs font-medium">
                    {formatFileSize(document.fileSize)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <OCRStatusBadge 
                  status={document.ocrStatus} 
                  error={document.ocrError}
                />
              </TableCell>
              <TableCell>
                <SignatureStatusBadge
                  status={document.signatureStatus || 'UNSIGNED'}
                  showTooltip={true}
                  size="sm"
                />
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
                      <DropdownMenuItem onClick={() => onView(document)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                        <Eye className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                        Ver detalles
                      </DropdownMenuItem>
                    )}
                    {onDownload && (
                      <DropdownMenuItem onClick={() => onDownload(document)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                        <Download className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                        Descargar
                      </DropdownMenuItem>
                    )}
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(document)} className="cursor-pointer dark:hover:bg-slate-700 dark:text-slate-200">
                        <Edit className="mr-2 h-4 w-4 text-gray-700 dark:text-slate-300" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(document)}
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
