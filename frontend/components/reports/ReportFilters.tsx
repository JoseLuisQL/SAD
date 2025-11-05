'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Download, FileText, Filter, Trash2, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportType, ReportFilters as Filters, ExportFormat } from '@/types/report.types';
import { usePeriods } from '@/hooks/usePeriods';
import { useOffices } from '@/hooks/useOffices';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useUsers } from '@/hooks/useUsers';
import { useUserPreferences, FilterPreset } from '@/store/userPreferences.store';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
  onGenerate: (type: ReportType, filters: Filters) => void;
  onExport: (type: ReportType, filters: Filters, format: ExportFormat) => void;
  loading?: boolean;
  exporting?: boolean;
}

const reportFiltersSchema = z.object({
  reportType: z.enum(['documents', 'activity', 'signatures']),
  dateFrom: z.date(),
  dateTo: z.date(),
  periodId: z.string().optional(),
  officeId: z.string().optional(),
  documentTypeId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  signerId: z.string().optional(),
  status: z.string().optional(),
}).refine((data) => data.dateFrom <= data.dateTo, {
  message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin',
  path: ['dateTo'],
});

type ReportFiltersFormData = z.infer<typeof reportFiltersSchema>;

export default function ReportFilters({ onGenerate, onExport, loading = false, exporting = false }: ReportFiltersProps) {
  const { periods, fetchPeriods } = usePeriods();
  const { offices, fetchOffices } = useOffices();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { users, fetchUsers } = useUsers();
  
  const {
    defaultPreset,
    getPresetDates,
    trackPresetUsage,
    lastUsedReportType,
    setLastUsedReportType,
  } = useUserPreferences();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ReportFiltersFormData>({
    resolver: zodResolver(reportFiltersSchema),
    defaultValues: {
      reportType: lastUsedReportType,
      ...getPresetDates(defaultPreset),
    },
  });

  const reportType = watch('reportType');
  const dateFrom = watch('dateFrom');
  const dateTo = watch('dateTo');

  useEffect(() => {
    fetchPeriods();
    fetchOffices();
    fetchDocumentTypes();
    fetchUsers();
  }, [fetchPeriods, fetchOffices, fetchDocumentTypes, fetchUsers]);

  const applyPreset = (preset: FilterPreset) => {
    const dates = getPresetDates(preset);
    setValue('dateFrom', dates.dateFrom);
    setValue('dateTo', dates.dateTo);
    trackPresetUsage(preset);
  };

  const handleClearFilters = () => {
    const dates = getPresetDates(defaultPreset);
    reset({
      reportType,
      dateFrom: dates.dateFrom,
      dateTo: dates.dateTo,
    });
  };

  const onSubmit = (data: ReportFiltersFormData) => {
    setLastUsedReportType(data.reportType);
    
    const filters: Filters = {
      dateFrom: data.dateFrom.toISOString().split('T')[0],
      dateTo: data.dateTo.toISOString().split('T')[0],
    };

    if (data.periodId && data.periodId !== 'all') filters.periodId = data.periodId;
    if (data.officeId && data.officeId !== 'all') filters.officeId = data.officeId;
    if (data.documentTypeId && data.documentTypeId !== 'all') filters.documentTypeId = data.documentTypeId;
    if (data.userId && data.userId !== 'all') filters.userId = data.userId;
    if (data.action && data.action !== 'all') filters.action = data.action;
    if (data.signerId && data.signerId !== 'all') filters.signerId = data.signerId;
    if (data.status && data.status !== 'all') filters.status = data.status;

    onGenerate(data.reportType, filters);
  };

  const handleExport = (format: ExportFormat) => {
    const data = watch();
    const filters: Filters = {
      dateFrom: data.dateFrom.toISOString().split('T')[0],
      dateTo: data.dateTo.toISOString().split('T')[0],
    };

    if (data.periodId && data.periodId !== 'all') filters.periodId = data.periodId;
    if (data.officeId && data.officeId !== 'all') filters.officeId = data.officeId;
    if (data.documentTypeId && data.documentTypeId !== 'all') filters.documentTypeId = data.documentTypeId;
    if (data.userId && data.userId !== 'all') filters.userId = data.userId;
    if (data.action && data.action !== 'all') filters.action = data.action;
    if (data.signerId && data.signerId !== 'all') filters.signerId = data.signerId;
    if (data.status && data.status !== 'all') filters.status = data.status;

    onExport(data.reportType, filters, format);
  };

  const currentStep: 1 | 2 | 3 | 4 = loading ? 3 : exporting ? 4 : 1;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configuración de Reporte</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Seleccione los parámetros para generar su reporte personalizado</p>
        </div>
        <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-xl">
          <FileText className="h-5 w-5" />
        </div>
      </div>

      {/* Guía Rápida con pasos numerados */}
      <div className="bg-gradient-to-r from-blue-50 dark:from-blue-500/10 to-indigo-50 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Guía Rápida</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className={cn(
            "flex items-center gap-2 text-sm",
            currentStep >= 1 ? "text-gray-900 dark:text-white font-medium" : "text-slate-500 dark:text-slate-400"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              currentStep > 1 ? "bg-green-500 text-white" : currentStep === 1 ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}>
              {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : "1"}
            </div>
            <span>Selecciona tipo</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            currentStep >= 2 ? "text-gray-900 dark:text-white font-medium" : "text-slate-500 dark:text-slate-400"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              currentStep > 2 ? "bg-green-500 text-white" : currentStep === 2 ? "bg-blue-600 dark:bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}>
              {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : "2"}
            </div>
            <span>Ajusta filtros</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            currentStep >= 3 ? "text-gray-900 dark:text-white font-medium" : "text-slate-500 dark:text-slate-400"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              currentStep > 3 ? "bg-green-500 text-white" : currentStep === 3 ? "bg-blue-600 dark:bg-blue-500 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}>
              {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : currentStep === 3 ? <Clock className="h-4 w-4" /> : "3"}
            </div>
            <span>Genera reporte</span>
          </div>
          <div className={cn(
            "flex items-center gap-2 text-sm",
            currentStep >= 4 ? "text-gray-900 dark:text-white font-medium" : "text-slate-500 dark:text-slate-400"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              currentStep === 4 ? "bg-blue-600 dark:bg-blue-500 text-white animate-pulse" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
            )}>
              {currentStep === 4 ? <Clock className="h-4 w-4" /> : "4"}
            </div>
            <span>Exporta</span>
          </div>
        </div>
      </div>

      {/* Presets de filtros */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyPreset('last-week')}
          disabled={loading || exporting}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Última Semana
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyPreset('last-month')}
          disabled={loading || exporting}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Último Mes
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => applyPreset('custom')}
          disabled={loading || exporting}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Personalizado
        </Button>
      </div>

      {/* Selector de tipo de reporte */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
          Tipo de Reporte
        </label>
        <Controller
          name="reportType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="documents">Reporte Documental</SelectItem>
                <SelectItem value="activity">Actividad de Usuarios</SelectItem>
                <SelectItem value="signatures">Reporte de Firmas</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.reportType && (
          <p className="text-sm text-red-600 mt-1">{errors.reportType.message}</p>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600 dark:text-slate-400" />
          Filtros Avanzados
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filtros comunes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              Fecha Desde
            </label>
            <Controller
              name="dateFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  selectsStart
                  startDate={dateFrom}
                  endDate={dateTo}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Seleccionar fecha"
                />
              )}
            />
            {errors.dateFrom && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.dateFrom.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-500 dark:text-slate-400" />
              Fecha Hasta
            </label>
            <Controller
              name="dateTo"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={field.onChange}
                  selectsEnd
                  startDate={dateFrom}
                  endDate={dateTo}
                  minDate={dateFrom}
                  dateFormat="dd/MM/yyyy"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Seleccionar fecha"
                />
              )}
            />
            {errors.dateTo && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.dateTo.message}</p>
            )}
          </div>

          {/* Filtros específicos por tipo de reporte */}
          {reportType === 'documents' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Periodo
                </label>
                <Controller
                  name="periodId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los periodos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los periodos</SelectItem>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Oficina
                </label>
                <Controller
                  name="officeId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas las oficinas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las oficinas</SelectItem>
                        {offices.map((office) => (
                          <SelectItem key={office.id} value={office.id}>
                            {office.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Tipo de Documento
                </label>
                <Controller
                  name="documentTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}

          {reportType === 'activity' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Usuario
                </label>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los usuarios" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los usuarios</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Acción
                </label>
                <Controller
                  name="action"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas las acciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las acciones</SelectItem>
                        <SelectItem value="LOGIN">Inicio de Sesión</SelectItem>
                        <SelectItem value="LOGOUT">Cierre de Sesión</SelectItem>
                        <SelectItem value="DOCUMENT_CREATED">Documento Creado</SelectItem>
                        <SelectItem value="DOCUMENT_UPDATED">Documento Actualizado</SelectItem>
                        <SelectItem value="DOCUMENT_SIGNED">Documento Firmado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}

          {reportType === 'signatures' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Firmante
                </label>
                <Controller
                  name="signerId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los firmantes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los firmantes</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.firstName} {user.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                  Estado
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'all'} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="VALID">Válida</SelectItem>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="INVALID">Inválida</SelectItem>
                        <SelectItem value="INDETERMINATE">Indeterminada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={loading || exporting}
            className="flex-1 md:flex-none"
          >
            <FileText className="h-4 w-4 mr-2" />
            {loading ? 'Generando...' : 'Generar Reporte'}
          </Button>

          <Button
            type="button"
            onClick={handleClearFilters}
            variant="outline"
            disabled={loading || exporting}
            className="flex-1 md:flex-none"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar Filtros
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Exportar Reporte:</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Opciones de exportación">
          <Button
            type="button"
            onClick={() => handleExport('pdf')}
            variant="outline"
            disabled={exporting || loading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>

          <Button
            type="button"
            onClick={() => handleExport('xlsx')}
            variant="outline"
            disabled={exporting || loading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>

          <Button
            type="button"
            onClick={() => handleExport('csv')}
            variant="outline"
            disabled={exporting || loading}
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
