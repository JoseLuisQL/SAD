'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { DocumentMetadata } from '@/types/document.types';

const documentMetadataSchema = z.object({
  archivadorId: z.string().min(1, 'Selecciona un archivador'),
  documentTypeId: z.string().min(1, 'Selecciona un tipo de documento'),
  officeId: z.string().min(1, 'Selecciona una oficina'),
  documentNumber: z.string().min(1, 'Ingresa el número de documento'),
  documentDate: z.string().min(1, 'Ingresa la fecha del documento'),
  sender: z.string().min(1, 'Ingresa el remitente'),
  folioCount: z.number().int().positive('Debe ser mayor a 0'),
  annotations: z.string().optional(),
});

type MetadataFormData = z.infer<typeof documentMetadataSchema>;

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
    formState: { errors },
    setValue,
    watch,
  } = useForm<MetadataFormData>({
    resolver: zodResolver(documentMetadataSchema),
    defaultValues: defaultValues ? {
      ...defaultValues,
      folioCount: defaultValues.folioCount || 1,
    } : {
      folioCount: 1,
    },
  });

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
  }, [fetchArchivadores, fetchDocumentTypes, fetchOffices]);

  const handleFormSubmit = (data: MetadataFormData) => {
    onSubmit(data as DocumentMetadata);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="archivadorId" className="text-gray-900 dark:text-white font-semibold">
            Archivador <span className="text-red-500">*</span>
          </Label>
          <select
            id="archivadorId"
            {...register('archivadorId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un archivador</option>
            {archivadores.map((archivador) => (
              <option key={archivador.id} value={archivador.id}>
                {archivador.code} - {archivador.name}
              </option>
            ))}
          </select>
          {errors.archivadorId && (
            <p className="text-sm text-red-500">{errors.archivadorId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentTypeId" className="text-gray-900 dark:text-white font-semibold">
            Tipo de Documento <span className="text-red-500">*</span>
          </Label>
          <select
            id="documentTypeId"
            {...register('documentTypeId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona un tipo</option>
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.documentTypeId && (
            <p className="text-sm text-red-500">{errors.documentTypeId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="officeId" className="text-gray-900 dark:text-white font-semibold">
            Oficina <span className="text-red-500">*</span>
          </Label>
          <select
            id="officeId"
            {...register('officeId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Selecciona una oficina</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
          {errors.officeId && (
            <p className="text-sm text-red-500">{errors.officeId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentNumber" className="text-gray-900 dark:text-white font-semibold">
            Número de Documento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="documentNumber"
            {...register('documentNumber')}
            placeholder="Ej: 001-2025"
          />
          {errors.documentNumber && (
            <p className="text-sm text-red-500">{errors.documentNumber.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentDate" className="text-gray-900 dark:text-white font-semibold">
            Fecha del Documento <span className="text-red-500">*</span>
          </Label>
          <Input id="documentDate" type="date" {...register('documentDate')} />
          {errors.documentDate && (
            <p className="text-sm text-red-500">{errors.documentDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sender" className="text-gray-900 dark:text-white font-semibold">
            Remitente <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sender"
            {...register('sender')}
            placeholder="Ej: Ministerio de Salud"
          />
          {errors.sender && (
            <p className="text-sm text-red-500">{errors.sender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="folioCount" className="text-gray-900 dark:text-white font-semibold">
            Número de Folios <span className="text-red-500">*</span>
          </Label>
          <Input
            id="folioCount"
            type="number"
            {...register('folioCount', { valueAsNumber: true })}
            min="1"
            placeholder="1"
          />
          {errors.folioCount && (
            <p className="text-sm text-red-500">{errors.folioCount.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="annotations" className="text-gray-900 dark:text-white font-semibold">Anotaciones (opcional)</Label>
        <textarea
          id="annotations"
          {...register('annotations')}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Anotaciones adicionales (opcional)"
        />
        {errors.annotations && (
          <p className="text-sm text-red-500">{errors.annotations.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
