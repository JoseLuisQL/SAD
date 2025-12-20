'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  Trash2, 
  ChevronRight,
  ChevronDown,
  BarChart3,
  AlertCircle,
  FileSpreadsheet,
  File
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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

const REPORT_TYPE_LABELS: Record<ReportType, { label: string; description: string }> = {
  documents: { label: 'Documentos', description: 'Estadisticas de documentos digitalizados' },
  activity: { label: 'Actividad', description: 'Registro de actividad de usuarios' },
  signatures: { label: 'Firmas', description: 'Analisis de firmas digitales' },
};

export default function ReportFilters({ onGenerate, onExport, loading = false, exporting = false }: ReportFiltersProps) {
  const { periods, fetchPeriods } = usePeriods();
  const { offices, fetchOffices } = useOffices();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { users, fetchUsers } = useUsers();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<FilterPreset>('last-month');
  
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
    setActivePreset(preset);
    trackPresetUsage(preset);
  };

  const handleClearFilters = () => {
    const dates = getPresetDates(defaultPreset);
    reset({
      reportType,
      dateFrom: dates.dateFrom,
      dateTo: dates.dateTo,
    });
    setActivePreset('last-month');
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Indicador de progreso compacto - ISO 25010: Reconocimiento de adecuacion */}
      <div className="flex items-center gap-3 text-sm pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
            reportType ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
          )}>1</span>
          <span className={cn(
            "font-medium",
            reportType ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-slate-400"
          )}>Tipo</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
            dateFrom && dateTo ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
          )}>2</span>
          <span className={cn(
            "font-medium",
            dateFrom && dateTo ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-slate-400"
          )}>Fechas</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600" />
        <div className="flex items-center gap-2">
          <span className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            loading ? "bg-blue-600 text-white animate-pulse" : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400"
          )}>3</span>
          <span className="text-gray-500 dark:text-slate-400">Generar</span>
        </div>
      </div>

      {/* Presets de periodo - ISO 25010: Operabilidad (menos clics) */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          Periodo de tiempo
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Seleccion rapida de periodo">
          <button
            type="button"
            onClick={() => applyPreset('last-week')}
            disabled={loading || exporting}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              activePreset === 'last-week'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            )}
            aria-pressed={activePreset === 'last-week'}
          >
            Ultima semana
          </button>
          <button
            type="button"
            onClick={() => applyPreset('last-month')}
            disabled={loading || exporting}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              activePreset === 'last-month'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            )}
            aria-pressed={activePreset === 'last-month'}
          >
            Ultimo mes
          </button>
          <button
            type="button"
            onClick={() => setActivePreset('custom')}
            disabled={loading || exporting}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
              activePreset === 'custom'
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
            )}
            aria-pressed={activePreset === 'custom'}
          >
            Personalizado
          </button>
        </div>

        {/* Selector de fechas personalizado */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Controller
              name="dateFrom"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    setActivePreset('custom');
                  }}
                  selectsStart
                  startDate={dateFrom}
                  endDate={dateTo}
                  dateFormat="dd/MM/yyyy"
                  className={cn(
                    "w-full px-3 py-2 text-sm border rounded-lg transition-colors",
                    "bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.dateFrom 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-slate-700"
                  )}
                  placeholderText="Desde"
                  aria-label="Fecha desde"
                />
              )}
            />
          </div>
          <span className="text-gray-400 dark:text-slate-500 font-medium">-</span>
          <div className="flex-1">
            <Controller
              name="dateTo"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    setActivePreset('custom');
                  }}
                  selectsEnd
                  startDate={dateFrom}
                  endDate={dateTo}
                  minDate={dateFrom}
                  dateFormat="dd/MM/yyyy"
                  className={cn(
                    "w-full px-3 py-2 text-sm border rounded-lg transition-colors",
                    "bg-white dark:bg-slate-900 text-gray-900 dark:text-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    errors.dateTo 
                      ? "border-red-500 focus:ring-red-500" 
                      : "border-gray-300 dark:border-slate-700"
                  )}
                  placeholderText="Hasta"
                  aria-label="Fecha hasta"
                />
              )}
            />
          </div>
        </div>
        {/* ISO 25010: Proteccion contra errores - validacion visual inline */}
        {errors.dateTo && (
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.dateTo.message}</span>
          </div>
        )}
      </div>

      {/* Selector de tipo de reporte - Tarjetas visuales */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
          Tipo de reporte
        </label>
        <Controller
          name="reportType"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Tipo de reporte">
              {(['documents', 'activity', 'signatures'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => field.onChange(type)}
                  disabled={loading || exporting}
                  className={cn(
                    "p-4 rounded-xl border-2 text-left transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    field.value === type
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                      : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-white dark:bg-slate-900"
                  )}
                  role="radio"
                  aria-checked={field.value === type}
                >
                  <p className={cn(
                    "font-semibold text-sm",
                    field.value === type ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white"
                  )}>
                    {REPORT_TYPE_LABELS[type].label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    {REPORT_TYPE_LABELS[type].description}
                  </p>
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Filtros avanzados - Colapsables por defecto - ISO 25010: Operabilidad */}
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors w-full py-2">
          <Filter className="w-4 h-4" />
          <span>Filtros avanzados</span>
          <ChevronDown className={cn(
            "w-4 h-4 ml-auto transition-transform duration-200",
            advancedOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtros especificos por tipo de reporte */}
            {reportType === 'documents' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Tipo de documento
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Accion
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
                          <SelectItem value="LOGIN">Inicio de sesion</SelectItem>
                          <SelectItem value="LOGOUT">Cierre de sesion</SelectItem>
                          <SelectItem value="DOCUMENT_CREATED">Documento creado</SelectItem>
                          <SelectItem value="DOCUMENT_UPDATED">Documento actualizado</SelectItem>
                          <SelectItem value="DOCUMENT_SIGNED">Documento firmado</SelectItem>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
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
                          <SelectItem value="VALID">Valida</SelectItem>
                          <SelectItem value="PENDING">Pendiente</SelectItem>
                          <SelectItem value="INVALID">Invalida</SelectItem>
                          <SelectItem value="INDETERMINATE">Indeterminada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Acciones - ISO 25010: Operabilidad (CTA destacado) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
        {/* CTA Principal - Destacado */}
        <Button
          type="submit"
          disabled={loading || exporting}
          className="flex-1 sm:flex-none px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
          size="lg"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          {loading ? 'Generando...' : 'Generar reporte'}
        </Button>

        {/* Acciones secundarias */}
        <Button
          type="button"
          onClick={handleClearFilters}
          variant="ghost"
          disabled={loading || exporting}
          size="sm"
          className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Trash2 className="w-4 h-4 mr-1.5" />
          Limpiar
        </Button>

        {/* Separador */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-slate-700 mx-2" />

        {/* Exportacion - ISO 25010: Aprendibilidad (tooltips descriptivos) */}
        <TooltipProvider>
          <div className="flex items-center gap-1" role="group" aria-label="Opciones de exportacion">
            <span className="text-xs text-gray-500 dark:text-slate-400 mr-2 hidden sm:inline">Exportar:</span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() => handleExport('pdf')}
                  variant="ghost"
                  disabled={exporting || loading}
                  size="sm"
                  className="px-3"
                  aria-label="Exportar como PDF"
                >
                  <FileText className="w-4 h-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar como PDF</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() => handleExport('xlsx')}
                  variant="ghost"
                  disabled={exporting || loading}
                  size="sm"
                  className="px-3"
                  aria-label="Exportar como Excel"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar como Excel</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  onClick={() => handleExport('csv')}
                  variant="ghost"
                  disabled={exporting || loading}
                  size="sm"
                  className="px-3"
                  aria-label="Exportar como CSV"
                >
                  <File className="w-4 h-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Descargar como CSV</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </form>
  );
}
