'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Info, Save, X, FileText, Calendar, User, Layers, Building2, Hash, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useDocuments } from '@/hooks/useDocuments';
import { useArchivadores } from '@/hooks/useArchivadores';
import { useDocumentTypes } from '@/hooks/useDocumentTypes';
import { useOffices } from '@/hooks/useOffices';
import { Document, UpdateDocumentData } from '@/types/document.types';
import { FieldWithHelp } from '@/components/shared/FieldWithHelp';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const updateDocumentSchema = z.object({
  documentTypeId: z.string().min(1, 'Selecciona un tipo de documento'),
  officeId: z.string().min(1, 'Selecciona una oficina'),
  documentNumber: z.string().min(1, 'Ingresa el numero de documento'),
  documentDate: z.string().min(1, 'Ingresa la fecha del documento'),
  sender: z.string().min(1, 'Ingresa el remitente'),
  folioCount: z.number().int().positive('Debe ser mayor a 0'),
  annotations: z.string().optional(),
});

type FormData = z.infer<typeof updateDocumentSchema>;

const fieldHelp = {
  documentTypeId: 'Categoria del documento: Oficio, Memorando, Resolucion, etc.',
  officeId: 'Area o dependencia que emite o recibe el documento.',
  documentNumber: 'Numero unico que identifica el documento.',
  documentDate: 'Fecha en que se emitio el documento original.',
  sender: 'Persona, entidad o area que emite el documento.',
  folioCount: 'Numero total de paginas del documento fisico.',
  annotations: 'Informacion adicional relevante sobre el documento.',
};

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const { getDocumentById, updateDocument, loading } = useDocuments();
  const { fetchArchivadores } = useArchivadores();
  const { documentTypes, fetchDocumentTypes } = useDocumentTypes();
  const { offices, fetchOffices } = useOffices();

  const [document, setDocument] = useState<Document | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, dirtyFields },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(updateDocumentSchema),
    mode: 'onChange',
  });

  const watchedFields = watch();
  const changedFieldsCount = Object.keys(dirtyFields).length;

  useEffect(() => {
    fetchArchivadores({ limit: 100 });
    fetchDocumentTypes({ limit: 100 });
    fetchOffices({ limit: 100 });
    loadDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty) {
          handleSubmit(onSubmit)();
        }
      }
      if (e.key === 'Escape') {
        if (isDirty) {
          setShowDiscardDialog(true);
        } else {
          router.back();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty]);

  const loadDocument = async () => {
    try {
      setLoadingDoc(true);
      const doc = await getDocumentById(documentId);
      if (doc) {
        setDocument(doc);
        reset({
          documentTypeId: doc.documentType.id,
          officeId: doc.office.id,
          documentNumber: doc.documentNumber,
          documentDate: doc.documentDate.split('T')[0],
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

  const handleCancel = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      router.back();
    }
  };

  const selectClassName = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground',
    'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50'
  );

  if (loadingDoc || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]" role="status">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
        <p className="text-gray-500 dark:text-slate-400">Cargando documento...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Breadcrumb 
          items={[
            { label: 'Documentos', href: '/dashboard/archivo/documentos' },
            { label: document.documentNumber, href: `/dashboard/archivo/documentos/${documentId}` },
            { label: 'Editar', current: true },
          ]}
          showHome={false}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleCancel}
            className="mt-1 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Editar Documento
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              {document.documentNumber}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        {isDirty && (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 animate-pulse">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            {changedFieldsCount} campo{changedFieldsCount > 1 ? 's' : ''} modificado{changedFieldsCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2 columns */}
        <div className="lg:col-span-2">
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Datos del Documento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} id="edit-form" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                      className={cn(
                        selectClassName,
                        dirtyFields.documentTypeId && 'border-amber-400 dark:border-amber-600'
                      )}
                      aria-invalid={!!errors.documentTypeId}
                    >
                      <option value="">Selecciona un tipo</option>
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
                      className={cn(
                        selectClassName,
                        dirtyFields.officeId && 'border-amber-400 dark:border-amber-600'
                      )}
                      aria-invalid={!!errors.officeId}
                    >
                      <option value="">Selecciona una oficina</option>
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
                      className={cn(
                        dirtyFields.documentNumber && 'border-amber-400 dark:border-amber-600'
                      )}
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
                      className={cn(
                        dirtyFields.documentDate && 'border-amber-400 dark:border-amber-600'
                      )}
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
                      className={cn(
                        dirtyFields.sender && 'border-amber-400 dark:border-amber-600'
                      )}
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
                      className={cn(
                        dirtyFields.folioCount && 'border-amber-400 dark:border-amber-600'
                      )}
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
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      dirtyFields.annotations && 'border-amber-400 dark:border-amber-600'
                    )}
                    placeholder="Informacion adicional (opcional)"
                    aria-invalid={!!errors.annotations}
                  />
                </FieldWithHelp>
              </form>
            </CardContent>
          </Card>

          {/* Action buttons - Fixed at bottom on mobile */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sticky bottom-4 sm:static bg-white dark:bg-slate-950 p-4 sm:p-0 rounded-lg shadow-lg sm:shadow-none border sm:border-0 border-gray-200 dark:border-slate-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={loading}
              className="order-2 sm:order-1"
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button 
              type="submit"
              form="edit-form"
              disabled={loading || !isDirty}
              className="order-1 sm:order-2 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar Cambios
            </Button>
          </div>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-4">
          {/* Non-editable info */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Informacion Fija
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Building2 className="h-4 w-4 text-gray-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Archivador</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {document.archivador.code}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-slate-400">
                    {document.archivador.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <FileText className="h-4 w-4 text-gray-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Archivo PDF</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]" title={document.fileName}>
                    {document.fileName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Layers className="h-4 w-4 text-gray-500 dark:text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Version</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    v{document.currentVersion}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-slate-400 pt-2 border-t border-gray-200 dark:border-slate-700">
                Para cambiar el archivador o PDF, crea un nuevo documento.
              </p>
            </CardContent>
          </Card>

          {/* Audit info */}
          <Card className="dark:bg-slate-900 dark:border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                Auditoria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Creado por</span>
                <span className="text-gray-900 dark:text-white font-medium">{document.creator.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Creado el</span>
                <span className="text-gray-900 dark:text-white">{format(new Date(document.createdAt), 'dd/MM/yyyy', { locale: es })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Actualizado</span>
                <span className="text-gray-900 dark:text-white">{format(new Date(document.updatedAt), 'dd/MM/yyyy', { locale: es })}</span>
              </div>
            </CardContent>
          </Card>

          {/* Keyboard hints */}
          <Card className="dark:bg-slate-900 dark:border-slate-700 hidden lg:block">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">Atajos de teclado</p>
              <div className="space-y-1 text-xs text-gray-600 dark:text-slate-400">
                <p><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Ctrl+S</kbd> Guardar</p>
                <p><kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Esc</kbd> Cancelar</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discard changes dialog */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">
              Descartar cambios?
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Tienes {changedFieldsCount} campo{changedFieldsCount > 1 ? 's' : ''} sin guardar. 
              Si sales ahora, perderas los cambios realizados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Continuar editando
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-700"
            >
              Descartar y salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
