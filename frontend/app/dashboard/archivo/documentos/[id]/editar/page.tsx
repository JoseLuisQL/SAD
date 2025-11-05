'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDocuments } from '@/hooks/useDocuments';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { Document, UpdateDocumentData } from '@/types/document.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const updateDocumentSchema = z.object({
  documentTypeId: z.string().min(1, 'Selecciona un tipo de documento'),
  officeId: z.string().min(1, 'Selecciona una oficina'),
  documentNumber: z.string().min(1, 'Ingresa el número de documento'),
  documentDate: z.string().min(1, 'Ingresa la fecha del documento'),
  sender: z.string().min(1, 'Ingresa el remitente'),
  folioCount: z.number().int().positive('Debe ser mayor a 0'),
  annotations: z.string().optional(),
});

type FormData = z.infer<typeof updateDocumentSchema>;

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const { getDocumentById, updateDocument, loading } = useDocuments();
  const { archivadores, fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();

  const [document, setDocument] = useState<Document | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(updateDocumentSchema),
  });

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoadingDoc(true);
      const doc = await getDocumentById(documentId);
      if (doc) {
        setDocument(doc);
        // Pre-llenar el formulario con los datos actuales
        reset({
          documentTypeId: doc.documentType.id,
          officeId: doc.office.id,
          documentNumber: doc.documentNumber,
          documentDate: doc.documentDate.split('T')[0], // Formato YYYY-MM-DD
          sender: doc.sender,
          folioCount: doc.folioCount,
          annotations: doc.annotations || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar documento:', error);
    } finally {
      setLoadingDoc(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      const updateData: UpdateDocumentData = {
        documentTypeId: data.documentTypeId,
        officeId: data.officeId,
        documentNumber: data.documentNumber,
        documentDate: data.documentDate,
        sender: data.sender,
        folioCount: data.folioCount,
        annotations: data.annotations,
      };

      await updateDocument(documentId, updateData);
      router.push(`/dashboard/archivo/documentos/${documentId}`);
    } catch (error) {
      console.error('Error al actualizar documento:', error);
    }
  };

  if (loadingDoc || !document) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Documento</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-2">
          Documento {document.documentNumber} - {document.archivador.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">
          Nota: No se puede cambiar el archivador ni el archivo PDF. Solo los metadatos.
        </p>
      </div>

      <Card className="p-6 dark:bg-slate-900 dark:border-slate-700">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="documentTypeId" className="dark:text-white">
                Tipo de Documento <span className="text-red-500">*</span>
              </Label>
              <select
                id="documentTypeId"
                {...register('documentTypeId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="officeId" className="dark:text-white">
                Oficina <span className="text-red-500">*</span>
              </Label>
              <select
                id="officeId"
                {...register('officeId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="documentNumber" className="dark:text-white">
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
              <Label htmlFor="documentDate" className="dark:text-white">
                Fecha del Documento <span className="text-red-500">*</span>
              </Label>
              <Input id="documentDate" type="date" {...register('documentDate')} />
              {errors.documentDate && (
                <p className="text-sm text-red-500">{errors.documentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender" className="dark:text-white">
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
              <Label htmlFor="folioCount" className="dark:text-white">
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
            <Label htmlFor="annotations" className="dark:text-white">Anotaciones</Label>
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

          <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-700">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Información No Editable</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-slate-400">Archivador:</span>{' '}
                <span className="font-medium dark:text-white">{document.archivador.code} - {document.archivador.name}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-slate-400">Archivo:</span>{' '}
                <span className="font-medium dark:text-white">{document.fileName}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar Cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
