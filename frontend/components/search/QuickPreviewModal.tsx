'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import Cookies from 'js-cookie';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  ExternalLink,
  FileText,
  Calendar,
  User,
  Building2,
  FolderOpen,
  Archive,
  X,
  AlertCircle,
} from 'lucide-react';
import PDFPreview from '@/components/documents/PDFPreview';
import OCRStatusBadge from '@/components/documents/OCRStatusBadge';
import HighlightedText from './HighlightedText';
import DocumentTimeline from './DocumentTimeline';
import { SearchResultDocument } from '@/types/search.types';
import { STORAGE_KEYS } from '@/lib/constants';

interface QuickPreviewModalProps {
  document: SearchResultDocument | null;
  open: boolean;
  onClose: () => void;
  onDownload?: (document: SearchResultDocument) => void;
}

export default function QuickPreviewModal({
  document,
  open,
  onClose,
  onDownload,
}: QuickPreviewModalProps) {
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (document && open) {
      const fetchPDF = async () => {
        setLoading(true);
        setError(null);
        
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
          const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
          
          if (!token) {
            throw new Error('No se encontró token de autenticación');
          }

          const response = await fetch(`${apiUrl}/documents/${document.id}/download`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error(`Error al cargar PDF: ${response.statusText}`);
          }

          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          setPdfUrl(objectUrl);
        } catch (error) {
          console.error('Error loading PDF:', error);
          setError(error instanceof Error ? error.message : 'Error al cargar el documento');
          setPdfUrl(null);
        } finally {
          setLoading(false);
        }
      };

      fetchPDF();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [document, open]);

  if (!document) return null;

  const handleViewFull = () => {
    router.push(`/dashboard/archivo/documentos/${document.id}`);
    onClose();
  };

  const handleViewExpediente = () => {
    if (document.expediente) {
      router.push(`/dashboard/archivo/expedientes/${document.expediente.id}`);
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="w-full max-w-[98vw] sm:max-w-[1600px] max-h-[95vh] overflow-hidden p-0 bg-white dark:bg-slate-900"
        showCloseButton={false}
        onEscapeKeyDown={onClose}
        aria-describedby="quick-preview-description"
      >
        <DialogTitle className="sr-only">
          Vista Rápida - {document.documentNumber}
        </DialogTitle>
        <div className="flex flex-col h-full max-h-[95vh]">
          <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 
                  id="quick-preview-title"
                  className="text-xl font-bold mb-2 text-slate-900 dark:text-white"
                >
                  Vista Rápida - {document.documentNumber}
                </h2>
                <div className="flex flex-wrap gap-2" id="quick-preview-description">
                  <Badge variant="outline" className="border-slate-200 dark:border-slate-700">{document.documentType.name}</Badge>
                  <OCRStatusBadge status={document.ocrStatus} />
                  {document.expediente && (
                    <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                      Expediente: {document.expediente.code}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="flex-shrink-0 -mr-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Cerrar vista rápida"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden px-6 py-4 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 h-full">
              {/* Columna PDF - Scroll Independiente */}
              <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(95vh - 180px)' }}>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                      Vista Previa del Documento
                    </h3>
                    {loading ? (
                      <div className="space-y-3">
                        <Skeleton className="h-[500px] w-full rounded-lg" />
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                    ) : error ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ) : pdfUrl ? (
                      <PDFPreview file={pdfUrl} />
                    ) : (
                      <div className="flex items-center justify-center h-[500px] bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="text-center">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
                          <p className="text-slate-600 dark:text-slate-300">Preparando documento...</p>
                        </div>
                      </div>
                    )}
                  </div>

            {document.searchMetadata && (
              <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Coincidencias Encontradas
                </h3>
                <div className="space-y-3">
                  {document.searchMetadata.ocrSnippets.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 text-xs">
                          OCR
                        </Badge>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                          Contenido digitalizado
                        </p>
                      </div>
                      {document.searchMetadata.ocrSnippets.map((snippet, idx) => (
                        <div
                          key={`ocr-${idx}`}
                          className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-800 mb-2"
                        >
                          <HighlightedText 
                            text={snippet}
                            terms={document.searchMetadata?.matchedTerms}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {document.searchMetadata.annotationSnippets.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 text-xs">
                          Anotaciones
                        </Badge>
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                          Notas del documento
                        </p>
                      </div>
                      {document.searchMetadata.annotationSnippets.map((snippet, idx) => (
                        <div
                          key={`ann-${idx}`}
                          className="text-sm text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-800"
                        >
                          <HighlightedText 
                            text={snippet}
                            terms={document.searchMetadata?.matchedTerms}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
                </div>
              </div>

              {/* Columna Información - Scroll Independiente */}
              <div className="overflow-y-auto pl-2" style={{ maxHeight: 'calc(95vh - 180px)' }}>
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Información del Documento
                    </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Número</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {document.documentNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Fecha</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {format(new Date(document.documentDate), 'dd MMM yyyy', { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Remitente</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {document.sender}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Oficina</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                      {document.office.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Archive className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Archivador</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {document.archivador.code}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                      {document.archivador.name}
                    </p>
                  </div>
                </div>

                {document.expediente && (
                  <div className="flex items-start gap-3">
                    <FolderOpen className="h-5 w-5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Expediente</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {document.expediente.code}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                        {document.expediente.name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Archivo</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white break-words">
                    {document.fileName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatFileSize(document.fileSize)} • {document.folioCount} folio(s)
                  </p>
                </div>

                {document.annotations && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Anotaciones</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 break-words">
                      {document.annotations}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline de actividad */}
            <DocumentTimeline documentId={document.id} />

            {/* Botones de acción */}
            <div className="space-y-3">
              <Button
                onClick={handleViewFull}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                variant="default"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Detalle Completo
              </Button>

              {onDownload && (
                <Button
                  onClick={() => onDownload(document)}
                  className="w-full h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700"
                  variant="secondary"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Documento
                </Button>
              )}

              {document.expediente && (
                <Button
                  onClick={handleViewExpediente}
                  className="w-full h-11 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  variant="outline"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Ver Expediente
                </Button>
              )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
