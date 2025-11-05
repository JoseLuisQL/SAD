'use client';

import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CheckCircle, Clock, FileX, XCircle, ArrowRightCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SignatureStatus = 'UNSIGNED' | 'SIGNED' | 'PARTIALLY_SIGNED' | 'REVERTED' | 'IN_FLOW';

interface SignatureStatusBadgeProps {
  status: SignatureStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
  totalSignatures?: number;
  lastSignedBy?: string | null;
  lastSignedAt?: Date | null;
  className?: string;
}

const statusConfig = {
  UNSIGNED: {
    label: 'Sin Firmar',
    color: 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600',
    icon: FileX,
    description: 'Este documento no ha sido firmado'
  },
  SIGNED: {
    label: 'Firmado',
    color: 'bg-green-500 dark:bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-500',
    icon: CheckCircle,
    description: 'Documento firmado correctamente'
  },
  PARTIALLY_SIGNED: {
    label: 'Parcialmente Firmado',
    color: 'bg-yellow-500 dark:bg-yellow-600 text-white hover:bg-yellow-600 dark:hover:bg-yellow-500',
    icon: Clock,
    description: 'Documento con firmas parciales'
  },
  REVERTED: {
    label: 'Revertido',
    color: 'bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-500',
    icon: XCircle,
    description: 'Las firmas han sido revertidas'
  },
  IN_FLOW: {
    label: 'En Proceso',
    color: 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-500',
    icon: ArrowRightCircle,
    description: 'Documento en flujo de firma'
  }
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
};

export function SignatureStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  showTooltip = true,
  totalSignatures,
  lastSignedBy,
  lastSignedAt,
  className
}: SignatureStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const badge = (
    <Badge
      className={cn(
        config.color,
        sizeClasses[size],
        'transition-all duration-200 flex items-center gap-1.5 font-medium',
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-2">
            <p className="font-semibold">{config.description}</p>
            {totalSignatures !== undefined && totalSignatures > 0 && (
              <p className="text-xs text-muted-foreground">
                Total de firmas: {totalSignatures}
              </p>
            )}
            {lastSignedBy && (
              <p className="text-xs text-muted-foreground">
                Última firma por: {lastSignedBy}
              </p>
            )}
            {lastSignedAt && (
              <p className="text-xs text-muted-foreground">
                Fecha: {formatDate(lastSignedAt)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
