'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ExportFormat } from '@/types/report.types';

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
  }
> = {
  pdf: {
    icon: FileText,
    label: 'PDF',
    description: 'Exportar como documento PDF',
    color: 'text-red-600',
  },
  xlsx: {
    icon: FileSpreadsheet,
    label: 'Excel',
    description: 'Exportar como hoja de cálculo Excel',
    color: 'text-green-600',
  },
  csv: {
    icon: File,
    label: 'CSV',
    description: 'Exportar como archivo CSV',
    color: 'text-blue-600',
  },
};

export default function ExportMenu({
  onExport,
  exporting = false,
  disabled = false,
  formats = ['pdf', 'xlsx', 'csv'],
  label = 'Exportar',
  variant = 'outline',
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
        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
          {label}:
        </label>
      )}

      {/* ButtonGroup - ISO 9241-110: Agrupación lógica de acciones relacionadas */}
      <TooltipProvider>
        <div
          className="inline-flex rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm"
          role="group"
          aria-label="Opciones de exportación"
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
                    className={`
                      flex items-center gap-2 rounded-none border-r border-gray-300 dark:border-slate-700 last:border-r-0
                      hover:bg-gray-50 dark:hover:bg-slate-800 focus:z-10 focus:ring-2 focus:ring-blue-500
                      ${index === 0 ? 'rounded-l-lg' : ''}
                      ${index === formats.length - 1 ? 'rounded-r-lg' : ''}
                      ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
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
                        <Icon className={`h-4 w-4 ${config.color}`} />
                        <span className="hidden sm:inline">{config.label}</span>
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{config.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {/* Feedback de estado accesible - WCAG 2.1: Mensajes de estado */}
      {exporting && (
        <div
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Generando exportación...</span>
        </div>
      )}
    </div>
  );
}
