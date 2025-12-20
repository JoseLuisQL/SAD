'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, startOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AnalyticsFiltersProps {
  dateFrom: Date;
  dateTo: Date;
  onDateRangeChange: (from: Date, to: Date) => void;
  onExport: () => void;
}

type PresetId = '7d' | '30d' | 'month' | 'custom';

interface QuickRange {
  id: PresetId;
  label: string;
  shortLabel: string;
  getDates: () => [Date, Date];
}

const QUICK_RANGES: QuickRange[] = [
  { id: '7d', label: '7 dias', shortLabel: '7d', getDates: () => [subDays(new Date(), 7), new Date()] },
  { id: '30d', label: '30 dias', shortLabel: '30d', getDates: () => [subDays(new Date(), 30), new Date()] },
  { id: 'month', label: 'Este mes', shortLabel: 'Mes', getDates: () => [startOfMonth(new Date()), new Date()] },
];

export default function AnalyticsFilters({
  dateFrom,
  dateTo,
  onDateRangeChange,
}: AnalyticsFiltersProps) {
  const [activePreset, setActivePreset] = useState<PresetId>('30d');
  const [exporting, setExporting] = useState(false);

  const handleQuickRange = (range: QuickRange) => {
    const [from, to] = range.getDates();
    setActivePreset(range.id);
    onDateRangeChange(from, to);
  };

  const handleCustomDateFrom = (date: Date | null) => {
    if (date) {
      setActivePreset('custom');
      onDateRangeChange(date, dateTo);
    }
  };

  const handleCustomDateTo = (date: Date | null) => {
    if (date) {
      setActivePreset('custom');
      onDateRangeChange(dateFrom, date);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await api.get('/firma/analytics/export', {
        params: {
          type: 'csv',
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `firmas-${format(dateFrom, 'yyyy-MM-dd')}-${format(dateTo, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte descargado exitosamente');
    } catch (error: unknown) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        
        {/* Rangos rapidos - Chips con seleccion clara */}
        <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="Seleccion de periodo">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mr-1">
            Periodo:
          </span>
          {QUICK_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => handleQuickRange(range)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                activePreset === range.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-slate-700"
              )}
              aria-pressed={activePreset === range.id}
              role="radio"
              aria-checked={activePreset === range.id}
            >
              <span className="hidden sm:inline">{range.label}</span>
              <span className="sm:hidden">{range.shortLabel}</span>
            </button>
          ))}
        </div>

        {/* Separador visual */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700" aria-hidden="true" />

        {/* Selector de fechas personalizado */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <DatePicker
              selected={dateFrom}
              onChange={handleCustomDateFrom}
              maxDate={dateTo}
              dateFormat="dd/MM/yy"
              locale={es}
              className={cn(
                "w-28 px-3 py-2 text-sm border rounded-lg transition-colors",
                "bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none",
                activePreset === 'custom' 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" 
                  : "border-gray-300 dark:border-slate-700"
              )}
              placeholderText="Desde"
              aria-label="Fecha desde"
            />
          </div>
          <span className="text-gray-400 dark:text-slate-500 font-medium">-</span>
          <div className="relative">
            <DatePicker
              selected={dateTo}
              onChange={handleCustomDateTo}
              minDate={dateFrom}
              maxDate={new Date()}
              dateFormat="dd/MM/yy"
              locale={es}
              className={cn(
                "w-28 px-3 py-2 text-sm border rounded-lg transition-colors",
                "bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none",
                activePreset === 'custom' 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" 
                  : "border-gray-300 dark:border-slate-700"
              )}
              placeholderText="Hasta"
              aria-label="Fecha hasta"
            />
          </div>
        </div>

        {/* Boton de exportacion - Menos prominente */}
        <div className="sm:ml-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white",
                    "hover:bg-gray-100 dark:hover:bg-slate-800",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                  aria-label="Exportar reporte en formato CSV"
                >
                  {exporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">CSV</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Descargar datos como CSV</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
