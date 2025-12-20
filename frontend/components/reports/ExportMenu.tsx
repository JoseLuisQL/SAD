'use client';

import { useState } from 'react';
import { FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExportFormat } from '@/types/report.types';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  exporting?: boolean;
  disabled?: boolean;
  formats?: ExportFormat[];
  label?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

const formatConfig: Record<
  ExportFormat,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
    color: string;
    bgHover: string;
  }
> = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    description: 'Documento PDF para impresion o archivo',
    color: 'text-red-600 dark:text-red-500',
    bgHover: 'hover:bg-red-50 dark:hover:bg-red-500/10',
  },
  xlsx: {
    icon: FileSpreadsheet,
    label: 'Excel',
    description: 'Hoja de calculo para analisis de datos',
    color: 'text-green-600 dark:text-green-500',
    bgHover: 'hover:bg-green-50 dark:hover:bg-green-500/10',
  },
  csv: {
    icon: File,
    label: 'CSV',
    description: 'Formato universal para importar en otros sistemas',
    color: 'text-blue-600 dark:text-blue-500',
    bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-500/10',
  },
};

export default function ExportMenu({
  onExport,
  exporting = false,
  disabled = false,
  formats = ['pdf', 'xlsx', 'csv'],
  label = 'Exportar',
  size = 'default',
}: ExportMenuProps) {
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label accesible */}
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {/* Grupo de botones - ISO 25010: Agrupacion logica */}
      <TooltipProvider delayDuration={300}>
        <div
          className="inline-flex rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
          role="group"
          aria-label="Opciones de exportacion"
        >
          {formats.map((format, index) => {
            const config = formatConfig[format];
            const Icon = config.icon;
            const isExporting = exportingFormat === format;
            const isDisabled = disabled || exporting;

            return (
              <Tooltip key={format}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size={size}
                    onClick={() => handleExport(format)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2 rounded-none border-r border-gray-200 dark:border-slate-700 last:border-r-0",
                      "focus:z-10 focus:ring-2 focus:ring-blue-500 focus:ring-inset",
                      "transition-colors duration-150",
                      index === 0 && "rounded-l-lg",
                      index === formats.length - 1 && "rounded-r-lg",
                      isDisabled ? "opacity-50 cursor-not-allowed" : config.bgHover
                    )}
                    aria-label={`${config.description}${isExporting ? ' - Exportando...' : ''}`}
                    aria-busy={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="sr-only">Exportando {config.label}...</span>
                      </>
                    ) : (
                      <>
                        <Icon className={cn("h-4 w-4", config.color)} />
                        <span className="hidden sm:inline text-gray-700 dark:text-slate-300">
                          {config.label}
                        </span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium">{config.label}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {config.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Feedback de estado accesible - WCAG 2.1 */}
      {exporting && (
        <div
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Generando archivo...</span>
        </div>
      )}
    </div>
  );
}
