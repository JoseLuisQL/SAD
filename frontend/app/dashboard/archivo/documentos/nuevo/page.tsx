'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import FileUploader from '@/components/documents/FileUploader';
import DocumentMetadataForm from '@/components/documents/DocumentMetadataForm';
import PDFPreview from '@/components/documents/PDFPreview';
import { useDocuments } from '@/hooks/useDocuments';
import { DocumentMetadata } from '@/types/document.types';
import { pdfjs } from 'react-pdf';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, label: 'Archivo' },
  { id: 2, label: 'Metadatos' },
  { id: 3, label: 'Confirmar' },
];

export default function NewDocumentPage() {
  const router = useRouter();
  const { uploadDocument, loading } = useDocuments();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [detectedPages, setDetectedPages] = useState<number | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  const detectPdfPages = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setDetectedPages(pdf.numPages);
    } catch {
      setDetectedPages(null);
    }
  }, []);

  const handleFileSelect = useCallback(async (files: File[]) => {
    const file = files[0] || null;
    setSelectedFile(file);
    if (file) {
      await detectPdfPages(file);
    } else {
      setDetectedPages(null);
    }
  }, [detectPdfPages]);

  const handleMetadataSubmit = useCallback((data: DocumentMetadata) => {
    setMetadata(data);
    setCurrentStep(3);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !metadata) return;
    try {
      const result = await uploadDocument(selectedFile, metadata);
      setUploadedId(result.id);
      setCurrentStep(4);
      toast.success('Documento subido correctamente');
    } catch (error) {
      console.error('Error:', error);
    }
  }, [selectedFile, metadata, uploadDocument]);

  const goBack = useCallback(() => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  }, [currentStep]);

  const goNext = useCallback(() => {
    if (currentStep === 1 && selectedFile) setCurrentStep(2);
  }, [currentStep, selectedFile]);

  // Pantalla de exito
  if (currentStep === 4 && uploadedId) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <Card className="p-8 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
            {/* Icono con animacion */}
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-100 dark:bg-emerald-950/50 animate-ping opacity-20" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>

            {/* Texto */}
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Subido exitosamente
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              Tu documento ha sido procesado y guardado correctamente
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                variant="outline" 
                onClick={() => router.push(`/dashboard/archivo/documentos/${uploadedId}`)}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver documento
              </Button>
              <Button 
                onClick={() => router.push('/dashboard/archivo/documentos')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Ir a documentos
              </Button>
            </div>

            {/* Link para subir otro */}
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedFile(null);
                setMetadata(null);
                setUploadedId(null);
                setDetectedPages(null);
              }}
              className="mt-6 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Subir otro documento
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/archivo/documentos')}
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Nuevo Documento</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Paso {currentStep} de 3</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                currentStep === step.id && 'bg-blue-600 text-white',
                currentStep > step.id && 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
                currentStep < step.id && 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className={cn(
                  'w-5 h-5 flex items-center justify-center rounded-full text-xs',
                  currentStep === step.id ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                )}>
                  {step.id}
                </span>
              )}
              {step.label}
            </button>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-1',
                currentStep > step.id ? 'bg-emerald-500 dark:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Step 1: Archivo */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Seleccionar archivo PDF</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Arrastra o selecciona un archivo PDF (max. 50MB)</p>
            </div>
            
            <FileUploader
              files={selectedFile ? [selectedFile] : []}
              onFilesChange={handleFileSelect}
              maxFiles={1}
            />

            {detectedPages && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {detectedPages} paginas detectadas
              </p>
            )}
          </div>
        )}

        {/* Step 2: Metadatos */}
        {currentStep === 2 && selectedFile && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Informacion del documento</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completa los datos requeridos</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Formulario */}
              <div>
                <DocumentMetadataForm
                  onSubmit={handleMetadataSubmit}
                  onCancel={goBack}
                  defaultValues={metadata || undefined}
                  submitLabel="Continuar"
                  suggestedFolioCount={detectedPages || undefined}
                />
              </div>
              
              {/* Vista previa del PDF */}
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">Vista previa</h3>
                <div className="sticky top-4">
                  <PDFPreview file={selectedFile} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmar */}
        {currentStep === 3 && selectedFile && metadata && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100">Confirmar datos</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Revisa la informacion antes de subir</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumen */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">Resumen</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Archivo</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{selectedFile.name}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Tamano</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Numero</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{metadata.documentNumber}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Fecha</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{metadata.documentDate}</dd>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <dt className="text-slate-500 dark:text-slate-400">Remitente</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100 truncate max-w-[200px]">{metadata.sender}</dd>
                  </div>
                  <div className="flex justify-between py-2">
                    <dt className="text-slate-500 dark:text-slate-400">Folios</dt>
                    <dd className="font-medium text-slate-900 dark:text-slate-100">{metadata.folioCount}</dd>
                  </div>
                </dl>
              </div>

              {/* Preview */}
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">Vista previa</h3>
                <PDFPreview file={selectedFile} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        {currentStep !== 2 && (
          <div className="flex justify-between pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <div>
              {currentStep > 1 && (
                <Button 
                  variant="ghost" 
                  onClick={goBack}
                  className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentStep === 1 && (
                <Button 
                  onClick={goNext} 
                  disabled={!selectedFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
              {currentStep === 3 && (
                <Button 
                  onClick={handleUpload} 
                  disabled={loading} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Subir documento
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
