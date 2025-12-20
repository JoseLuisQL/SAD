'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, startOfMonth, format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/api';
import toast from 'react-hot-toast';

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
  getDates: () => [Date, Date];
}

const QUICK_RANGES: QuickRange[] = [
  { id: '7d', label: '7 dias', getDates: () => [subDays(new Date(), 7), new Date()] },
  { id: '30d', label: '30 dias', getDates: () => [subDays(new Date(), 30), new Date()] },
  { id: 'month', label: 'Este mes', getDates: () => [startOfMonth(new Date()), new Date()] },
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

      const blob = new Blob([response.data]);
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
        
        {/* Rangos rapidos - Chips seleccionables */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide mr-1">
            Periodo:
          </span>
          {QUICK_RANGES.map((range) => (
            <button
              key={range.id}
              onClick={() => handleQuickRange(range)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-full transition-all
                ${activePreset === range.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }
              `}
              aria-pressed={activePreset === range.id}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Separador visual */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700" />

        {/* Selector de fechas personalizado */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <DatePicker
              selected={dateFrom}
              onChange={handleCustomDateFrom}
              maxDate={dateTo}
              dateFormat="dd/MM/yy"
              locale={es}
              className={`
                w-28 px-3 py-1.5 text-sm border rounded-lg
                ${activePreset === 'custom' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                  : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                focus:outline-none
              `}
              placeholderText="Desde"
              aria-label="Fecha desde"
            />
          </div>
          <span className="text-gray-400 dark:text-slate-500">→</span>
          <div className="relative">
            <DatePicker
              selected={dateTo}
              onChange={handleCustomDateTo}
              minDate={dateFrom}
              maxDate={new Date()}
              dateFormat="dd/MM/yy"
              locale={es}
              className={`
                w-28 px-3 py-1.5 text-sm border rounded-lg
                ${activePreset === 'custom' 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' 
                  : 'border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                }
                text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                focus:outline-none
              `}
              placeholderText="Hasta"
              aria-label="Fecha hasta"
            />
          </div>
        </div>

        {/* Boton de exportacion - Al final, menor jerarquia */}
        <div className="sm:ml-auto">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Exportar reporte CSV"
            aria-label="Exportar reporte en formato CSV"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
