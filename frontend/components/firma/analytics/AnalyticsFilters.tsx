'use client';

import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { subDays, subMonths, startOfMonth, startOfYear, endOfMonth, endOfYear } from 'date-fns';

interface AnalyticsFiltersProps {
  dateFrom: Date;
  dateTo: Date;
  onDateRangeChange: (from: Date, to: Date) => void;
  onExport: () => void;
}

export default function AnalyticsFilters({
  dateFrom,
  dateTo,
  onDateRangeChange,
  onExport,
}: AnalyticsFiltersProps) {
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  const handleApply = () => {
    onDateRangeChange(localDateFrom, localDateTo);
  };

  const setQuickRange = (from: Date, to: Date) => {
    setLocalDateFrom(from);
    setLocalDateTo(to);
    onDateRangeChange(from, to);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Date Range Selectors */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Fecha Desde
            </label>
            <div className="relative">
              <DatePicker
                selected={localDateFrom}
                onChange={(date) => date && setLocalDateFrom(date)}
                selectsStart
                startDate={localDateFrom}
                endDate={localDateTo}
                maxDate={localDateTo}
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Seleccionar fecha"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Fecha Hasta
            </label>
            <div className="relative">
              <DatePicker
                selected={localDateTo}
                onChange={(date) => date && setLocalDateTo(date)}
                selectsEnd
                startDate={localDateFrom}
                endDate={localDateTo}
                minDate={localDateFrom}
                maxDate={new Date()}
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Seleccionar fecha"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Quick Range Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setQuickRange(new Date(), new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => setQuickRange(subDays(new Date(), 7), new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            7 Días
          </button>
          <button
            onClick={() => setQuickRange(subDays(new Date(), 30), new Date())}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            30 Días
          </button>
          <button
            onClick={() => setQuickRange(startOfMonth(new Date()), endOfMonth(new Date()))}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Este Mes
          </button>
          <button
            onClick={() => setQuickRange(startOfYear(new Date()), endOfYear(new Date()))}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Este Año
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Aplicar
          </button>
          <button
            onClick={onExport}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
}
