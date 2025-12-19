'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { usePeriods } from '@/hooks/usePeriods';
import { useExpedientes } from '@/hooks/useExpedientes';
import { SearchFilters } from '@/types/search.types';

const searchFiltersSchema = z.object({
  documentNumber: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  documentTypeId: z.string().optional(),
  sender: z.string().optional(),
  officeId: z.string().optional(),
  archivadorId: z.string().optional(),
  periodId: z.string().optional(),
  expedienteId: z.string().optional(),
});

type FiltersFormData = z.infer<typeof searchFiltersSchema>;

interface AdvancedSearchFiltersProps {
  onApply: (filters: SearchFilters) => void;
  onClear: () => void;
  defaultValues?: Partial<SearchFilters>;
  loading?: boolean;
}

export default function AdvancedSearchFilters({
  onApply,
  onClear,
  defaultValues,
  loading = false,
}: AdvancedSearchFiltersProps) {
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();
  const { periods, fetchPeriods } = usePeriods();
  const { expedientes, fetchExpedientes } = useExpedientes();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<FiltersFormData>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: defaultValues || {},
  });

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
    fetchPeriods({ limit: 50 });
    fetchExpedientes({ limit: 100 });
  }, [fetchArchivadores, fetchDocumentTypes, fetchOffices, fetchPeriods, fetchExpedientes]);

  const handleFormSubmit = (data: FiltersFormData) => {
    const cleanedFilters: SearchFilters = {};
    
    Object.entries(data).forEach(([key, value]) => {
      if (value && value !== '') {
        cleanedFilters[key as keyof SearchFilters] = value;
      }
    });

    onApply(cleanedFilters);
  };

  const handleClear = () => {
    reset({});
    onClear();
  };

  const hasFilters = Object.values(watch()).some(value => value && value !== '');

  const activeFiltersCount = Object.values(watch()).filter(value => value && value !== '').length;

  return (
    <ScrollArea className="max-h-[500px]" data-tour="search-filters">
      {/* M5: Panel de filtros con mejor contraste y organización */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header con contador de filtros activos */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Filtros Avanzados</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Limpiar todo
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-4 space-y-5">
          {/* Sección: Identificación */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Identificación del documento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="documentNumber" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Número de Documento
                </Label>
                <Input
                  id="documentNumber"
                  type="text"
                  placeholder="Ej: 001-2025"
                  className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 
                             text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  {...register('documentNumber')}
                  aria-label="Número de documento"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sender" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Remitente
                </Label>
                <Input
                  id="sender"
                  type="text"
                  placeholder="Ej: Ministerio de Salud"
                  className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 
                             text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  {...register('sender')}
                  aria-label="Remitente del documento"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documentTypeId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tipo de Documento
                </Label>
                <Select
                  value={watch('documentTypeId') || undefined}
                  onValueChange={(value) => setValue('documentTypeId', value || '')}
                >
                  <SelectTrigger 
                    className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" 
                    aria-label="Tipo de documento"
                  >
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sección: Ubicación */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Ubicación física
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="officeId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Oficina
                </Label>
                <Select
                  value={watch('officeId') || undefined}
                  onValueChange={(value) => setValue('officeId', value || '')}
                >
                  <SelectTrigger 
                    className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" 
                    aria-label="Oficina"
                  >
                    <SelectValue placeholder="Todas las oficinas" />
                  </SelectTrigger>
                  <SelectContent>
                    {offices.map((office) => (
                      <SelectItem key={office.id} value={office.id}>
                        {office.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="archivadorId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Archivador
                </Label>
                <Select
                  value={watch('archivadorId') || undefined}
                  onValueChange={(value) => setValue('archivadorId', value || '')}
                >
                  <SelectTrigger 
                    className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" 
                    aria-label="Archivador"
                  >
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {archivadores.map((archivador) => (
                      <SelectItem key={archivador.id} value={archivador.id}>
                        {archivador.code} - {archivador.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="periodId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Periodo
                </Label>
                <Select
                  value={watch('periodId') || undefined}
                  onValueChange={(value) => setValue('periodId', value || '')}
                >
                  <SelectTrigger 
                    className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" 
                    aria-label="Periodo"
                  >
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map((period) => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expedienteId" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Expediente
                </Label>
                <Select
                  value={watch('expedienteId') || undefined}
                  onValueChange={(value) => setValue('expedienteId', value || '')}
                >
                  <SelectTrigger 
                    className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800" 
                    aria-label="Expediente"
                  >
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    {expedientes.map((expediente) => (
                      <SelectItem key={expediente.id} value={expediente.id}>
                        {expediente.code} - {expediente.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Sección: Fechas */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              Rango de fechas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateFrom" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 
                             text-slate-900 dark:text-white
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  {...register('dateFrom')}
                  aria-label="Fecha desde"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateTo" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  className="h-9 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 
                             text-slate-900 dark:text-white
                             focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  {...register('dateTo')}
                  aria-label="Fecha hasta"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={loading || !hasFilters}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 
                         hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Limpiar
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white
                         focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2"
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {loading ? 'Aplicando...' : 'Aplicar filtros'}
            </Button>
          </div>
        </form>
      </div>
    </ScrollArea>
  );
}
