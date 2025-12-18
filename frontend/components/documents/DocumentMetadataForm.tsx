'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { DocumentMetadata } from '@/types/document.types';
import { FieldWithHelp } from '@/components/shared/FieldWithHelp';
import { cn } from '@/lib/utils';

const documentMetadataSchema = z.object({
  archivadorId: z.string().min(1, 'Selecciona un archivador'),
  documentTypeId: z.string().min(1, 'Selecciona un tipo de documento'),
  officeId: z.string().min(1, 'Selecciona una oficina'),
  documentNumber: z.string().min(1, 'Ingresa el numero de documento'),
  documentDate: z.string().min(1, 'Ingresa la fecha del documento'),
  sender: z.string().min(1, 'Ingresa el remitente'),
  folioCount: z.number().int().positive('Debe ser mayor a 0'),
  annotations: z.string().optional(),
});

type MetadataFormData = z.infer<typeof documentMetadataSchema>;

const fieldHelp = {
  archivadorId: 'Carpeta fisica donde se guardara el documento original escaneado. Selecciona segun la clasificacion del archivo.',
  documentTypeId: 'Categoria del documento: Oficio, Memorando, Resolucion, etc. Determina como se organiza en el sistema.',
  officeId: 'Area o dependencia que emite o recibe el documento.',
  documentNumber: 'Numero unico que identifica el documento. Ejemplo: OF-001-2025 o MEMO-123-2025.',
  documentDate: 'Fecha en que se emitio el documento original (no la fecha de digitalizacion).',
  sender: 'Persona, entidad o area que emite el documento.',
  folioCount: 'Numero total de paginas del documento fisico. Debe coincidir con las paginas del PDF.',
  annotations: 'Informacion adicional relevante sobre el documento (opcional).',
};

interface DocumentMetadataFormProps {
  onSubmit: (data: DocumentMetadata) => void;
  onCancel?: () => void;
  defaultValues?: Partial<DocumentMetadata>;
  submitLabel?: string;
  loading?: boolean;
}

export default function DocumentMetadataForm({
  onSubmit,
  onCancel,
  defaultValues,
  submitLabel = 'Guardar',
  loading = false,
}: DocumentMetadataFormProps) {
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
    watch,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(documentMetadataSchema),
    mode: 'onChange',
    defaultValues: defaultValues ? {
      ...defaultValues,
      folioCount: defaultValues.folioCount || 1,
    } : {
      folioCount: 1,
    },
  });

  const watchedFields = watch();
  const totalFields = 7;
  const completedFields = Object.keys(dirtyFields).filter(key => {
    const value = watchedFields[key as keyof MetadataFormData];
    return value !== undefined && value !== '' && value !== null;
  }).length;
  const progress = Math.round((completedFields / totalFields) * 100);

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  const handleFormSubmit = (data: MetadataFormData) => {
    onSubmit(data as DocumentMetadata);
  };

  const selectClassName = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
    'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Progress indicator */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Progreso del formulario
          </span>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {completedFields} de {totalFields} campos
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              progress === 100 ? 'bg-green-500' : 'bg-blue-500'
            )}
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Formulario completado al ${progress}%`}
          />
        </div>
        {progress === 100 && (
          <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Todos los campos requeridos completados
          </p>
        )}
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWithHelp
          label="Archivador"
          help={fieldHelp.archivadorId}
          required
          htmlFor="archivadorId"
          error={errors.archivadorId?.message}
        >
          <select
            id="archivadorId"
            {...register('archivadorId')}
            className={selectClassName}
            aria-invalid={!!errors.archivadorId}
            aria-describedby={errors.archivadorId ? 'archivadorId-error' : undefined}
          >
            <option value="">Selecciona un archivador...</option>
            {archivadores.map((archivador) => (
              <option key={archivador.id} value={archivador.id}>
                {archivador.code} - {archivador.name}
              </option>
            ))}
          </select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Tipo de Documento"
          help={fieldHelp.documentTypeId}
          required
          htmlFor="documentTypeId"
          error={errors.documentTypeId?.message}
        >
          <select
            id="documentTypeId"
            {...register('documentTypeId')}
            className={selectClassName}
            aria-invalid={!!errors.documentTypeId}
          >
            <option value="">Selecciona un tipo...</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Oficina"
          help={fieldHelp.officeId}
          required
          htmlFor="officeId"
          error={errors.officeId?.message}
        >
          <select
            id="officeId"
            {...register('officeId')}
            className={selectClassName}
            aria-invalid={!!errors.officeId}
          >
            <option value="">Selecciona una oficina...</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </FieldWithHelp>

        <FieldWithHelp
          label="Numero de Documento"
          help={fieldHelp.documentNumber}
          required
          htmlFor="documentNumber"
          error={errors.documentNumber?.message}
        >
          <Input
            id="documentNumber"
            {...register('documentNumber')}
            placeholder="Ej: OF-001-2025"
            aria-invalid={!!errors.documentNumber}
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Fecha del Documento"
          help={fieldHelp.documentDate}
          required
          htmlFor="documentDate"
          error={errors.documentDate?.message}
        >
          <Input 
            id="documentDate" 
            type="date" 
            {...register('documentDate')}
            aria-invalid={!!errors.documentDate}
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Remitente"
          help={fieldHelp.sender}
          required
          htmlFor="sender"
          error={errors.sender?.message}
        >
          <Input
            id="sender"
            {...register('sender')}
            placeholder="Ej: Direccion Regional de Salud"
            aria-invalid={!!errors.sender}
          />
        </FieldWithHelp>

        <FieldWithHelp
          label="Numero de Folios"
          help={fieldHelp.folioCount}
          required
          htmlFor="folioCount"
          error={errors.folioCount?.message}
        >
          <Input
            id="folioCount"
            type="number"
            {...register('folioCount', { valueAsNumber: true })}
            min="1"
            placeholder="1"
            aria-invalid={!!errors.folioCount}
          />
        </FieldWithHelp>
      </div>

      <FieldWithHelp
        label="Anotaciones"
        help={fieldHelp.annotations}
        htmlFor="annotations"
        error={errors.annotations?.message}
      >
        <textarea
          id="annotations"
          {...register('annotations')}
          rows={3}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          placeholder="Informacion adicional sobre el documento (opcional)"
          aria-invalid={!!errors.annotations}
        />
      </FieldWithHelp>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading || !isValid}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
