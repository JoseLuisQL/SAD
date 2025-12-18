'use client';

import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type OcrStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';
type SignatureStatus = 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';

interface DocumentStatusIndicatorProps {
  ocrStatus?: OcrStatus;
  signatureStatus?: SignatureStatus;
  compact?: boolean;
  className?: string;
}

const ocrConfig: Record<OcrStatus, { icon: typeof Clock; color: string; bg: string; label: string; animate?: boolean }> = {
  PENDING: { icon: Clock, color: 'text-gray-400 dark:text-slate-500', bg: 'bg-gray-100 dark:bg-slate-700', label: 'OCR Pendiente' },
  PROCESSING: { icon: Loader2, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Procesando OCR', animate: true },
  COMPLETED: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'OCR Completo' },
  ERROR: { icon: AlertCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Error OCR' },
};

const signatureConfig: Record<SignatureStatus, { icon: typeof Clock; color: string; bg: string; label: string; animate?: boolean }> = {
  UNSIGNED: { icon: Clock, color: 'text-gray-400 dark:text-slate-500', bg: 'bg-gray-100 dark:bg-slate-700', label: 'Sin firmar' },
  SIGNED: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Firmado' },
  PARTIALLY_SIGNED: { icon: Clock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Firma parcial' },
  REVERTED: { icon: AlertCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Firma revertida' },
  IN_FLOW: { icon: Loader2, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'En proceso', animate: true },
};

export function DocumentStatusIndicator({
  ocrStatus = 'PENDING',
  signatureStatus = 'UNSIGNED',
  compact = false,
  className,
}: DocumentStatusIndicatorProps) {
  const ocr = ocrConfig[ocrStatus];
  const signature = signatureConfig[signatureStatus];

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn('flex items-center gap-1', className)}
              role="status"
              aria-label={`${ocr.label}, ${signature.label}`}
            >
              <StatusDot status={ocrStatus === 'COMPLETED' ? 'success' : ocrStatus === 'ERROR' ? 'error' : 'pending'} />
              <StatusDot status={signatureStatus === 'SIGNED' ? 'success' : signatureStatus === 'REVERTED' ? 'error' : signatureStatus === 'IN_FLOW' || signatureStatus === 'PARTIALLY_SIGNED' ? 'warning' : 'pending'} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">OCR:</span> {ocr.label}</p>
              <p><span className="font-medium">Firma:</span> {signature.label}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)} role="status">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('p-1.5 rounded-full', ocr.bg)}>
              <ocr.icon 
                className={cn('h-4 w-4', ocr.color, ocr.animate && 'animate-spin')} 
                aria-hidden="true"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{ocr.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('p-1.5 rounded-full', signature.bg)}>
              <signature.icon 
                className={cn('h-4 w-4', signature.color, signature.animate && 'animate-spin')} 
                aria-hidden="true"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{signature.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function StatusDot({ status }: { status: 'success' | 'warning' | 'error' | 'pending' }) {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    pending: 'bg-gray-300 dark:bg-slate-600',
  };

  return (
    <span 
      className={cn('w-2 h-2 rounded-full', colors[status])}
      aria-hidden="true"
    />
  );
}
