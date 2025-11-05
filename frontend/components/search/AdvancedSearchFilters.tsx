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

  return (
    <ScrollArea className="max-h-[500px]" data-tour="search-filters">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Filtros Avanzados</h3>
          </div>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Identificación Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-1.5">
              Identificación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="documentNumber" className="text-sm text-gray-700 dark:text-slate-300">
                  Número de Documento
                </Label>
                <Input
                  id="documentNumber"
                  type="text"
                  placeholder="Ej: 001-2025"
                  className="h-9 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  {...register('documentNumber')}
                  aria-label="Número de documento"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sender" className="text-sm text-gray-700 dark:text-slate-300">
                  Remitente
                </Label>
                <Input
                  id="sender"
                  type="text"
                  placeholder="Ej: Ministerio de Salud"
                  className="h-9 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-slate-400"
                  {...register('sender')}
                  aria-label="Remitente del documento"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="documentTypeId" className="text-sm text-gray-700 dark:text-slate-300">
                  Tipo de Documento
                </Label>
                <Select
                  value={watch('documentTypeId') || undefined}
                  onValueChange={(value) => setValue('documentTypeId', value || '')}
                >
                  <SelectTrigger className="border-gray-300 dark:border-slate-700" aria-label="Tipo de documento">
                    <SelectValue placeholder="Todos" />
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

          {/* Ubicación Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-1.5">
              Ubicación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="officeId" className="text-sm text-gray-700 dark:text-slate-300">
                  Oficina
                </Label>
                <Select
                  value={watch('officeId') || undefined}
                  onValueChange={(value) => setValue('officeId', value || '')}
                >
                  <SelectTrigger className="h-9 border-gray-300 dark:border-slate-700" aria-label="Oficina">
                    <SelectValue placeholder="Todas" />
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
                <Label htmlFor="archivadorId" className="text-sm text-gray-700 dark:text-slate-300">
                  Archivador
                </Label>
                <Select
                  value={watch('archivadorId') || undefined}
                  onValueChange={(value) => setValue('archivadorId', value || '')}
                >
                  <SelectTrigger className="h-9 border-gray-300 dark:border-slate-700" aria-label="Archivador">
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
                <Label htmlFor="periodId" className="text-sm text-gray-700 dark:text-slate-300">
                  Periodo
                </Label>
                <Select
                  value={watch('periodId') || undefined}
                  onValueChange={(value) => setValue('periodId', value || '')}
                >
                  <SelectTrigger className="h-9 border-gray-300 dark:border-slate-700" aria-label="Periodo">
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
                <Label htmlFor="expedienteId" className="text-sm text-gray-700 dark:text-slate-300">
                  Expediente
                </Label>
                <Select
                  value={watch('expedienteId') || undefined}
                  onValueChange={(value) => setValue('expedienteId', value || '')}
                >
                  <SelectTrigger className="h-9 border-gray-300 dark:border-slate-700" aria-label="Expediente">
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

          {/* Fechas Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-slate-300 uppercase tracking-wide border-b border-gray-200 dark:border-slate-700 pb-1.5">
              Fechas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateFrom" className="text-sm text-gray-700 dark:text-slate-300">
                  Desde
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  className="h-9 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  {...register('dateFrom')}
                  aria-label="Fecha desde"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dateTo" className="text-sm text-gray-700 dark:text-slate-300">
                  Hasta
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  className="h-9 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  {...register('dateTo')}
                  aria-label="Fecha hasta"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={loading || !hasFilters}
              className="border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Limpiar
            </Button>
            <Button type="submit" size="sm" disabled={loading}>
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              {loading ? 'Aplicando...' : 'Aplicar'}
            </Button>
          </div>
        </form>
      </div>
    </ScrollArea>
  );
}
