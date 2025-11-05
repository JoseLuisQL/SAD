'use client';

import { FileSearch, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type OCRStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

interface OCRStatusBadgeProps {
  status?: OCRStatus;
  error?: string | null;
  compact?: boolean;
}

export default function OCRStatusBadge({ 
  status = 'PENDING', 
  error, 
  compact = false 
}: OCRStatusBadgeProps) {
  const getStatusConfig = (status: OCRStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          label: 'Pendiente',
          description: 'El documento está en cola para procesamiento OCR',
          bgColor: 'bg-amber-50 dark:bg-amber-950/50',
          textColor: 'text-amber-700 dark:text-amber-400',
          borderColor: 'border-amber-200 dark:border-amber-800',
          iconColor: 'text-amber-500 dark:text-amber-400',
        };
      case 'PROCESSING':
        return {
          icon: Loader2,
          label: 'Procesando',
          description: 'Extrayendo texto del documento...',
          bgColor: 'bg-blue-50 dark:bg-blue-950/50',
          textColor: 'text-blue-700 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-500 dark:text-blue-400',
          animate: true,
        };
      case 'COMPLETED':
        return {
          icon: CheckCircle,
          label: 'Completado',
          description: 'Texto extraído exitosamente',
          bgColor: 'bg-green-50 dark:bg-green-950/50',
          textColor: 'text-green-700 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-800',
          iconColor: 'text-green-500 dark:text-green-400',
        };
      case 'ERROR':
        return {
          icon: AlertCircle,
          label: 'Error',
          description: error || 'Error al procesar el documento',
          bgColor: 'bg-red-50 dark:bg-red-950/50',
          textColor: 'text-red-700 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-800',
          iconColor: 'text-red-500 dark:text-red-400',
        };
      default:
        return {
          icon: FileSearch,
          label: 'Desconocido',
          description: 'Estado desconocido',
          bgColor: 'bg-gray-50 dark:bg-slate-800',
          textColor: 'text-gray-700 dark:text-slate-300',
          borderColor: 'border-gray-200 dark:border-slate-700',
          iconColor: 'text-gray-500 dark:text-slate-400',
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${config.bgColor} border ${config.borderColor} cursor-help transition-all hover:scale-110`}
            >
              <Icon
                className={`h-4 w-4 ${config.iconColor} ${
                  config.animate ? 'animate-spin' : ''
                }`}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor} text-xs font-medium transition-all hover:shadow-sm cursor-help`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${config.iconColor} ${
                config.animate ? 'animate-spin' : ''
              }`}
            />
            <span className="whitespace-nowrap">{config.label}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-sm">Estado OCR: {config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
            {status === 'COMPLETED' && (
              <p className="text-xs text-green-600 mt-2">
                ✓ El contenido del documento está disponible para búsqueda
              </p>
            )}
            {status === 'PROCESSING' && (
              <p className="text-xs text-blue-600 mt-2">
                ⏳ Esto puede tomar algunos momentos...
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
