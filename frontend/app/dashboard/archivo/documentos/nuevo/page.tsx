'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Upload, CheckCircle2, FileText, ExternalLink, Save, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FileUploader from '@/components/documents/FileUploader';
import DocumentMetadataForm from '@/components/documents/DocumentMetadataForm';
import PDFPreview from '@/components/documents/PDFPreview';
import { Stepper, Step } from '@/components/shared/Stepper';
import { HelpPanel } from '@/components/shared/HelpPanel';
import { RequirementsChecklist, Requirement } from '@/components/shared/RequirementsChecklist';
import { useDocuments } from '@/hooks/useDocuments';
import { useWizardDraft } from '@/hooks/useWizardDraft';
import { DocumentMetadata } from '@/types/document.types';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const steps: Step[] = [
  { id: 1, name: 'Archivo', description: 'Selecciona el PDF' },
  { id: 2, name: 'Metadatos', description: 'Informacion del documento' },
  { id: 3, name: 'Confirmar', description: 'Revisar antes de subir' },
  { id: 4, name: 'Completado', description: 'Documento procesado' },
];

const wizardFAQs = [
  {
    question: 'Que formato de archivo puedo subir?',
    answer: 'Solo se aceptan archivos PDF. El tamano maximo es de 50 MB.',
  },
  {
    question: 'Que es el numero de folios?',
    answer: 'Es el numero total de paginas del documento. Debe coincidir con la cantidad de paginas fisicas.',
  },
  {
    question: 'Puedo editar los metadatos despues?',
    answer: 'Si, puedes editar los metadatos desde el detalle del documento, excepto el archivo PDF.',
  },
  {
    question: 'Que pasa si me equivoco al subir?',
    answer: 'Puedes eliminar el documento desde la lista si tienes permisos de Administrador u Operador.',
  },
  {
    question: 'Se procesa el OCR automaticamente?',
    answer: 'Si, el sistema procesara el texto del PDF automaticamente. Puedes ver el progreso en el detalle.',
  },
  {
    question: 'Que pasa si cierro la pagina?',
    answer: 'Tu progreso se guarda automaticamente. Al volver, podras continuar donde lo dejaste.',
  },
];

interface WizardData {
  currentStep: number;
  fileName: string | null;
  fileSize: number | null;
  metadata: DocumentMetadata | null;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const { uploadDocument, loading } = useDocuments();
  
  // Draft management
  const {
    data: draftData,
    setData: setDraftData,
    hasDraft,
    lastSaved,
    isSaving,
    saveDraft,
    clearDraft,
    restoreDraft,
  } = useWizardDraft<WizardData>({
    key: 'new-document',
    initialData: {
      currentStep: 1,
      fileName: null,
      fileSize: null,
      metadata: null,
    },
    autoSaveInterval: 30000,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [uploadedDocumentId, setUploadedDocumentId] = useState<string | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([
    { id: 'file', label: 'Archivo PDF seleccionado', status: 'unmet' },
    { id: 'size', label: 'Tamano menor a 50 MB', status: 'unmet' },
    { id: 'metadata', label: 'Metadatos completos', status: 'unmet' },
  ]);

  // Check for draft on mount
  useEffect(() => {
    if (hasDraft) {
      setShowDraftDialog(true);
    }
  }, []);

  // Update draft when data changes
  useEffect(() => {
    if (currentStep < 4) {
      setDraftData({
        currentStep,
        fileName: selectedFile?.name || null,
        fileSize: selectedFile?.size || null,
        metadata,
      });
    }
  }, [currentStep, selectedFile, metadata, setDraftData]);

  // Update requirements based on state
  useEffect(() => {
    const newRequirements: Requirement[] = [
      {
        id: 'file',
        label: 'Archivo PDF seleccionado',
        status: selectedFile ? 'met' : 'unmet',
        message: selectedFile ? selectedFile.name : 'Selecciona un archivo PDF',
      },
      {
        id: 'size',
        label: 'Tamano menor a 50 MB',
        status: selectedFile
          ? selectedFile.size <= 50 * 1024 * 1024
            ? 'met'
            : 'warning'
          : 'unmet',
        message: selectedFile
          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
          : 'El archivo debe ser menor a 50 MB',
      },
      {
        id: 'metadata',
        label: 'Metadatos completos',
        status: metadata ? 'met' : 'unmet',
        message: metadata ? 'Todos los campos completados' : 'Completa el formulario',
      },
    ];
    setRequirements(newRequirements);
  }, [selectedFile, metadata]);

  const handleRestoreDraft = () => {
    const restored = restoreDraft();
    if (restored && draftData) {
      setCurrentStep(draftData.currentStep);
      setMetadata(draftData.metadata);
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const handleFileChange = (files: File[]) => {
    setSelectedFile(files[0] || null);
  };

  const handleNext = () => {
    if (currentStep === 1 && !selectedFile) {
      return;
    }
    if (currentStep === 2 && !metadata) {
      return;
    }
    saveDraft();
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    saveDraft();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMetadataSubmit = (data: DocumentMetadata) => {
    setMetadata(data);
    saveDraft();
    setCurrentStep(3);
  };

  const handleUpload = async () => {
    if (!selectedFile || !metadata) return;

    try {
      const result = await uploadDocument(selectedFile, metadata);
      setUploadedDocumentId(result.id);
      clearDraft();
      setCurrentStep(4);
    } catch (error) {
      console.error('Error al subir documento:', error);
    }
  };

  const handleCancel = () => {
    if (selectedFile || metadata) {
      saveDraft();
    }
    router.push('/dashboard/archivo/documentos');
  };

  const handleSaveAndExit = () => {
    saveDraft();
    router.push('/dashboard/archivo/documentos');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Nuevo Documento
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Sigue los pasos para subir un nuevo documento al sistema
            </p>
          </div>
          
          {/* Auto-save indicator */}
          {currentStep < 4 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 animate-pulse" aria-hidden="true" />
                  <span>Guardando...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>
                    Guardado {format(lastSaved, 'HH:mm', { locale: es })}
                  </span>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Seleccionar Archivo PDF
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Arrastra o selecciona un archivo PDF para subirlo al sistema
                </p>
                <FileUploader
                  files={selectedFile ? [selectedFile] : []}
                  onFilesChange={handleFileChange}
                  maxFiles={1}
                />
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Ingresar Metadatos
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                  Completa la informacion del documento. Los campos con * son obligatorios.
                </p>
                <DocumentMetadataForm
                  onSubmit={handleMetadataSubmit}
                  onCancel={handleBack}
                  defaultValues={metadata || undefined}
                  submitLabel="Siguiente"
                />
              </div>
            )}

            {currentStep === 3 && selectedFile && metadata && (
              <div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Revisar y Confirmar
                </h2>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                  Revisa la informacion antes de subir el documento
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      Informacion del Documento
                    </h3>
                    <dl className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Archivo
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {selectedFile.name}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Tamano
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Numero de Documento
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {metadata.documentNumber}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Fecha
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {metadata.documentDate}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Remitente
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {metadata.sender}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                          Numero de Folios
                        </dt>
                        <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {metadata.folioCount}
                        </dd>
                      </div>
                      {metadata.annotations && (
                        <div className="col-span-2">
                          <dt className="text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                            Anotaciones
                          </dt>
                          <dd className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                            {metadata.annotations}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      Vista Previa del PDF
                    </h3>
                    <PDFPreview file={selectedFile} />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && uploadedDocumentId && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-950 rounded-full mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Documento subido exitosamente
                </h2>
                <p className="text-gray-600 dark:text-slate-400 mb-8">
                  El documento ha sido procesado y agregado al sistema. El OCR se procesara automaticamente.
                </p>

                <div className="flex justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/dashboard/archivo/documentos/${uploadedDocumentId}`)}
                  >
                    <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
                    Ver Documento
                  </Button>
                  <Button onClick={() => router.push('/dashboard/archivo/documentos')}>
                    Ir a Documentos
                    <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setCurrentStep(1);
                      setSelectedFile(null);
                      setMetadata(null);
                      setUploadedDocumentId(null);
                    }}
                  >
                    Subir otro documento
                  </Button>
                </div>
              </div>
            )}

            {currentStep < 4 && currentStep !== 2 && (
              <div className="mt-6 flex justify-between border-t border-gray-200 dark:border-slate-700 pt-6">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button variant="outline" onClick={handleBack} disabled={loading}>
                      <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                      Anterior
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={handleSaveAndExit} disabled={loading}>
                    <Save className="mr-2 h-4 w-4" aria-hidden="true" />
                    Guardar y salir
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={loading}>
                    Cancelar
                  </Button>
                  {currentStep < 3 ? (
                    <Button
                      onClick={handleNext}
                      disabled={loading || (currentStep === 1 && !selectedFile)}
                    >
                      Siguiente
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <Button onClick={handleUpload} disabled={loading}>
                      {loading ? (
                        <>Subiendo...</>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                          Subir Documento
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar - Requirements and Help */}
        {currentStep < 4 && (
          <div className="space-y-6">
            <RequirementsChecklist
              title="Requisitos del Documento"
              requirements={requirements}
            />
            
            {/* Draft status card */}
            {hasDraft && lastSaved && (
              <Card className="p-4 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                      Borrador guardado
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                      Ultimo guardado: {format(lastSaved, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Help Panel */}
      <HelpPanel title="Preguntas Frecuentes" faqs={wizardFAQs} />

      {/* Draft restore dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="dark:text-white">
                Borrador encontrado
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="dark:text-slate-400">
              Tienes un borrador guardado de un documento que no terminaste de subir.
              Deseas continuar donde lo dejaste?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleDiscardDraft}
              className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Empezar de nuevo
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreDraft}>
              Continuar borrador
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
