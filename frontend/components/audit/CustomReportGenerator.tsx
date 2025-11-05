'use client';

import { useState } from 'react';
import { auditApi } from '@/lib/api/audit';
import { CustomReportFilters } from '@/types/audit.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Filter,
  Calendar,
  Users,
  Layers,
  Activity,
  BarChart3,
  FileSpreadsheet,
  FileJson,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

const AVAILABLE_MODULES = [
  'USERS', 'ROLES', 'OFFICES', 'DOCUMENT_TYPES', 'PERIODS', 'DOCUMENTS', 
  'AUTH', 'ARCHIVADORES', 'EXPEDIENTES', 'SIGNATURES', 'REPORTS'
];

const AVAILABLE_ACTIONS = [
  'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
  'LOGIN', 'LOGOUT',
  'DOCUMENT_CREATED', 'DOCUMENT_UPDATED', 'DOCUMENT_DELETED', 'DOCUMENT_DOWNLOADED',
  'DOCUMENT_SIGNED', 'DOCUMENT_SIGN_FAILED',
  'ROLE_CREATED', 'ROLE_UPDATED', 'ROLE_DELETED'
];

export function CustomReportGenerator() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState<'user' | 'module' | 'action' | 'date'>('date');
  const [reportData, setReportData] = useState<{ data: Record<string, unknown>[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const addModule = (module: string) => {
    if (!selectedModules.includes(module)) {
      setSelectedModules([...selectedModules, module]);
    }
  };

  const removeModule = (module: string) => {
    setSelectedModules(selectedModules.filter(m => m !== module));
  };

  const addAction = (action: string) => {
    if (!selectedActions.includes(action)) {
      setSelectedActions([...selectedActions, action]);
    }
  };

  const removeAction = (action: string) => {
    setSelectedActions(selectedActions.filter(a => a !== action));
  };

  const generateReport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Por favor selecciona un rango de fechas');
      return;
    }

    const filters: CustomReportFilters = {
      dateFrom,
      dateTo,
      groupBy,
    };

    if (selectedModules.length > 0) {
      filters.modules = selectedModules;
    }

    if (selectedActions.length > 0) {
      filters.actions = selectedActions;
    }

    try {
      setLoading(true);
      const response = await auditApi.generateCustomReport(filters);
      setReportData(response.data.data);
      toast.success('Reporte generado correctamente');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = Object.keys(reportData.data[0] || {}).join(',');
    const rows = reportData.data.map((row: Record<string, unknown>) => 
      Object.values(row).map((v: unknown) => `"${v}"`).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-auditoria-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    if (!reportData) return;

    const json = JSON.stringify(reportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-auditoria-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedModules([]);
    setSelectedActions([]);
    setGroupBy('date');
    setReportData(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Filter className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Configuración del Reporte
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-slate-400">
            Configura los filtros y parámetros para generar tu reporte personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom" className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Fecha Desde
              </Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo" className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Fecha Hasta
              </Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Agrupar por
            </Label>
            <Select value={groupBy} onValueChange={(value: 'user' | 'module' | 'action' | 'date') => setGroupBy(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Fecha</SelectItem>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="module">Módulo</SelectItem>
                <SelectItem value="action">Acción</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
              <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Filtrar por Módulos
            </Label>
            <Select onValueChange={addModule}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona módulos..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODULES.filter(m => !selectedModules.includes(m)).map(module => (
                  <SelectItem key={module} value={module}>{module}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedModules.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedModules.map(module => (
                  <Badge key={module} variant="secondary" className="flex items-center gap-1">
                    {module}
                    <button onClick={() => removeModule(module)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 font-medium text-gray-700 dark:text-slate-300">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Filtrar por Acciones
            </Label>
            <Select onValueChange={addAction}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona acciones..." />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ACTIONS.filter(a => !selectedActions.includes(a)).map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedActions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedActions.map(action => (
                  <Badge key={action} variant="secondary" className="flex items-center gap-1">
                    {action}
                    <button onClick={() => removeAction(action)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={loading || !dateFrom || !dateTo}>
              <FileText className="h-4 w-4 mr-2" />
              {loading ? 'Generando...' : 'Generar Reporte'}
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Vista Previa del Reporte
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-slate-400">
                  {reportData.data.length} registros encontrados | Agrupado por: {groupBy}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
                <Button variant="outline" size="sm" onClick={exportToJSON}>
                  <FileJson className="h-4 w-4 mr-2" />
                  Exportar JSON
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      {Object.keys(reportData.data[0] || {}).map(key => (
                        <th key={key} className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                    {reportData.data.slice(0, 50).map((row: Record<string, unknown>, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                        {Object.values(row).map((value: unknown, i: number) => (
                          <td key={i} className="px-4 py-3 text-gray-700 dark:text-slate-300">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reportData.data.length > 50 && (
                <div className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 py-3 text-sm text-gray-600 dark:text-slate-400 text-center">
                  Mostrando 50 de {reportData.data.length} registros. Exporta para ver todos.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
