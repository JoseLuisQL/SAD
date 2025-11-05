'use client';

import { useState } from 'react';
import { X, Download, FileText, FileSpreadsheet, File } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateFrom: Date;
  dateTo: Date;
}

type ExportFormat = 'pdf' | 'xlsx' | 'csv';

export default function ExportReportModal({
  isOpen,
  onClose,
  dateFrom,
  dateTo,
}: ExportReportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');
  const [includeGraphs, setIncludeGraphs] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [sections, setSections] = useState({
    metrics: true,
    trend: true,
    distribution: true,
    topSigners: true,
    flows: true,
    reversions: true,
  });

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setExporting(true);

      const response = await api.get('/firma/analytics/export', {
        params: {
          type: exportFormat,
          dateFrom: dateFrom.toISOString(),
          dateTo: dateTo.toISOString(),
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const filename = `reporte-firmas-${format(dateFrom, 'yyyy-MM-dd')}-${format(dateTo, 'yyyy-MM-dd')}.${exportFormat}`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte exportado exitosamente');
      onClose();
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error(error.response?.data?.error || 'Error al exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Exportar Reporte Analítico</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Formato de Exportación
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  exportFormat === 'csv'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-500/20'
                    : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'
                }`}
              >
                <File className={`w-8 h-8 ${exportFormat === 'csv' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'}`} />
                <span className={`text-sm font-medium ${exportFormat === 'csv' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-slate-300'}`}>
                  CSV
                </span>
              </button>

              <button
                onClick={() => setExportFormat('xlsx')}
                disabled
                className="p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed"
              >
                <FileSpreadsheet className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-400">Excel</span>
                <span className="text-xs text-gray-500 dark:text-slate-500">(Próximamente)</span>
              </button>

              <button
                onClick={() => setExportFormat('pdf')}
                disabled
                className="p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 opacity-50 cursor-not-allowed"
              >
                <FileText className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-slate-400">PDF</span>
                <span className="text-xs text-gray-500 dark:text-slate-500">(Próximamente)</span>
              </button>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Rango de Fechas
            </label>
            <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-700 dark:text-slate-300">
                Desde: <span className="font-medium">{format(dateFrom, 'dd/MM/yyyy')}</span>
                {' → '}
                Hasta: <span className="font-medium">{format(dateTo, 'dd/MM/yyyy')}</span>
              </p>
            </div>
          </div>

          {/* Include Graphs */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeGraphs"
              checked={includeGraphs}
              onChange={(e) => setIncludeGraphs(e.target.checked)}
              disabled
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 rounded focus:ring-blue-500"
            />
            <label htmlFor="includeGraphs" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
              Incluir gráficos en el reporte
              <span className="text-xs text-gray-500 dark:text-slate-500 ml-1">(Próximamente para PDF)</span>
            </label>
          </div>

          {/* Sections to Include */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Secciones a Incluir
            </label>
            <div className="space-y-2">
              {Object.entries({
                metrics: 'Métricas Generales',
                trend: 'Tendencia de Firmas',
                distribution: 'Distribución por Tipo',
                topSigners: 'Top Firmantes',
                flows: 'Estadísticas de Flujos',
                reversions: 'Análisis de Reversiones',
              }).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={sections[key as keyof typeof sections]}
                    onChange={() => toggleSection(key as keyof typeof sections)}
                    disabled
                    className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-700 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={key} className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                    {label}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2">
              * Actualmente se exportan todas las secciones en formato CSV
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            disabled={exporting}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Generando...' : 'Generar Reporte'}
          </button>
        </div>
      </div>
    </div>
  );
}
