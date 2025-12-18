'use client';

import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSignature,
  Layers,
  Calendar,
  Download,
  Edit,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type SignatureStatus = 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';
type OcrStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

interface DocumentSummaryCardProps {
  documentNumber: string;
  documentType: string;
  signatureStatus: SignatureStatus;
  ocrStatus?: OcrStatus;
  folioCount: number;
  currentVersion: number;
  documentDate: string;
  signaturesCount?: number;
  onDownload?: () => void;
  onEdit?: () => void;
  onViewInfo?: () => void;
  onViewHistory?: () => void;
  className?: string;
}

const statusConfig = {
  UNSIGNED: {
    icon: FileSignature,
    label: 'Sin Firmar',
    color: 'text-gray-600 dark:text-slate-400',
    bg: 'bg-gray-100 dark:bg-slate-700',
    border: 'border-gray-200 dark:border-slate-600',
  },
  SIGNED: {
    icon: CheckCircle2,
    label: 'Firmado',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800',
  },
  PARTIALLY_SIGNED: {
    icon: Clock,
    label: 'Firma Parcial',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
  },
  REVERTED: {
    icon: AlertCircle,
    label: 'Revertido',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    border: 'border-red-200 dark:border-red-800',
  },
  IN_FLOW: {
    icon: Clock,
    label: 'En Proceso',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

export function DocumentSummaryCard({
  documentNumber,
  documentType,
  signatureStatus,
  ocrStatus,
  folioCount,
  currentVersion,
  documentDate,
  signaturesCount = 0,
  onDownload,
  onEdit,
  onViewInfo,
  onViewHistory,
  className,
}: DocumentSummaryCardProps) {
  const status = statusConfig[signatureStatus];
  const StatusIcon = status.icon;

  return (
    <Card className={cn('bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700', className)}>
      <CardContent className="p-5">
        {/* Status visual grande */}
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg mb-4 border',
          status.bg,
          status.border
        )}>
          <div className={cn('p-2 rounded-full', status.bg)}>
            <StatusIcon className={cn('h-6 w-6', status.color)} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className={cn('font-semibold', status.color)}>
              {status.label}
            </p>
            {signaturesCount > 0 && (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {signaturesCount} firma{signaturesCount > 1 ? 's' : ''} aplicada{signaturesCount > 1 ? 's' : ''}
              </p>
            )}
          </div>
          {ocrStatus && (
            <Badge 
              variant="secondary"
              className={cn(
                'text-xs',
                ocrStatus === 'COMPLETED' && 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                ocrStatus === 'PROCESSING' && 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                ocrStatus === 'PENDING' && 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
                ocrStatus === 'ERROR' && 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
              )}
            >
              OCR: {ocrStatus === 'COMPLETED' ? 'Listo' : ocrStatus === 'PROCESSING' ? 'Procesando' : ocrStatus === 'ERROR' ? 'Error' : 'Pendiente'}
            </Badge>
          )}
        </div>

        {/* Metricas clave */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Tipo</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {documentType}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Layers className="h-4 w-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Folios</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {folioCount} pagina{folioCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Fecha</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {format(new Date(documentDate), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <FileSignature className="h-4 w-4 text-gray-500 dark:text-slate-400" aria-hidden="true" />
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400">Version</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                v{currentVersion}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones rapidas */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {onDownload && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onDownload}
                aria-label="Descargar documento"
              >
                <Download className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Descargar
              </Button>
            )}
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={onEdit}
                aria-label="Editar documento"
              >
                <Edit className="h-4 w-4 mr-1.5" aria-hidden="true" />
                Editar
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {onViewInfo && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-gray-600 dark:text-slate-400"
                onClick={onViewInfo}
              >
                Ver detalles
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
              </Button>
            )}
            {onViewHistory && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 text-gray-600 dark:text-slate-400"
                onClick={onViewHistory}
              >
                Historial
                <ExternalLink className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
