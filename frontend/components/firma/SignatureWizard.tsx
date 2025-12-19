'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  ArrowLeft,
  FileSignature,
  Eye,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { Document } from '@/types/document.types';
import { documentsApi } from '@/lib/api/documents';
import { useFirma } from '@/hooks/useFirma';
import { useConfigurationStore } from '@/store/configurationStore';
import { Skeleton } from '@/components/ui/skeleton';
import { SignatureSuccessModal } from './SignatureSuccessModal';
import { SignatureProgressOverlay } from './SignatureProgressOverlay';
import { useRouter, useSearchParams } from 'next/navigation';
import PDFPreview from '@/components/documents/PDFPreview';
import Cookies from 'js-cookie';
import { STORAGE_KEYS, API_URL } from '@/lib/constants';
import { useOnboarding } from '@/hooks/useOnboarding';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: 1, title: 'Seleccionar', description: 'Elegir documento', icon: FileText },
  { id: 2, title: 'Configurar', description: 'Opciones de firma', icon: Settings2 },
  { id: 3, title: 'Firmar', description: 'Confirmar y firmar', icon: FileSignature }
];

const getSignatureStatusBadge = (status?: string) => {
  switch (status) {
    case 'SIGNED':
      return { label: 'Firmado', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'PARTIALLY_SIGNED':
      return { label: 'Parcialmente firmado', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'IN_FLOW':
      return { label: 'En flujo', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'REVERTED':
      return { label: 'Revertida', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'UNSIGNED':
    default:
      return { label: 'Sin firma', className: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

const signatureReasons = [
  { value: 'author', label: 'Soy el autor del documento' },
  { value: 'conformidad', label: 'En señal de conformidad' },
  { value: 'voBo', label: 'Doy V° B°' },
  { value: 'encargo', label: 'Por encargo' },
  { value: 'fe', label: 'Doy fé' },
  { value: 'revision', label: 'Revisado y aprobado' },
  { value: 'autorizacion', label: 'Autorización' },
  { value: 'recepcion', label: 'Recepción conforme' },
  { value: 'custom', label: 'Otro (personalizar)' },
];

export function SignatureWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State principal
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signatureReason, setSignatureReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [signatureAppearance, setSignatureAppearance] = useState<'horizontal' | 'vertical'>('horizontal');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [fromFlowId, setFromFlowId] = useState<string | null>(null);
  
  // State para filtros y paginación
  const [signatureFilter, setSignatureFilter] = useState<'all' | 'unsigned' | 'signed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // State para modales y vistas
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(false);
  const [quickPreviewDocument, setQuickPreviewDocument] = useState<Document | null>(null);
  const [quickPreviewUrl, setQuickPreviewUrl] = useState<string | null>(null);
  const [loadingQuickPreview, setLoadingQuickPreview] = useState(false);
  
  // State para PDF en paso 2
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  
  // State para opciones avanzadas
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [showDocumentDetails, setShowDocumentDetails] = useState(false);
  
  // Hooks
  const { signDocument, loading, progressState, progressMessage, cancelSignature } = useFirma();
  const { config, fetchConfig } = useConfigurationStore();
  const { startTour, resetTour } = useOnboarding();

  // Efectos iniciales
  useEffect(() => {
    fetchDocuments();
    fetchConfig();
    
    const flowId = searchParams.get('flowId');
    if (flowId) {
      setFromFlowId(flowId);
    }
  }, [fetchConfig, searchParams]);

  // Monitor de completado de firma
  useEffect(() => {
    if (progressState === 'completed') {
      setShowSuccessModal(true);
    }
  }, [progressState]);

  // Auto-selección de documento desde URL
  useEffect(() => {
    const documentId = searchParams.get('documentId');
    if (documentId && documents.length > 0 && !selectedDocument) {
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        setSelectedDocument(doc);
        setCurrentStep(2);
        toast.success('Documento seleccionado desde el flujo de firma');
      } else {
        toast.error('No se encontró el documento especificado');
      }
    }
  }, [documents, searchParams, selectedDocument]);

  // Cargar PDF cuando se selecciona documento
  useEffect(() => {
    if (selectedDocument && currentStep === 2) {
      loadPdfPreview(selectedDocument.id);
    }
    
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
        setPdfUrl(null);
      }
    };
  }, [selectedDocument, currentStep]);

  const fetchDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const response = await documentsApi.getAll({ limit: 100 });
      setDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      toast.error('No se pudieron cargar los documentos.');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadPdfPreview = async (documentId: string): Promise<string | null> => {
    setLoadingPdf(true);
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return null;
      }

      const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error al cargar PDF: ${response.statusText}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
      return objectUrl;
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('No se pudo cargar la vista previa');
      setPdfUrl(null);
      return null;
    } finally {
      setLoadingPdf(false);
    }
  };

  // Manejar vista rápida de PDF
  const handleQuickPreview = async (doc: Document) => {
    setQuickPreviewDocument(doc);
    setShowQuickPreview(true);
    setLoadingQuickPreview(true);
    
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/documents/${doc.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Error al cargar PDF');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setQuickPreviewUrl(objectUrl);
    } catch (error) {
      console.error('Error loading quick preview:', error);
      toast.error('No se pudo cargar la vista previa');
    } finally {
      setLoadingQuickPreview(false);
    }
  };

  const handleCloseQuickPreview = useCallback(() => {
    setShowQuickPreview(false);
    if (quickPreviewUrl) {
      URL.revokeObjectURL(quickPreviewUrl);
      setQuickPreviewUrl(null);
    }
    setQuickPreviewDocument(null);
  }, [quickPreviewUrl]);

  const handleSelectFromPreview = () => {
    if (quickPreviewDocument) {
      // Solo seleccionar si no está firmado
      if (quickPreviewDocument.signatureStatus !== 'SIGNED') {
        handleDocumentSelect(quickPreviewDocument);
      }
      handleCloseQuickPreview();
    }
  };

  // Ordenar documentos por fecha (últimos primero) y aplicar filtros
  const sortedAndFilteredDocuments = React.useMemo(() => {
    let filtered = [...documents];
    
    // Ordenar por fecha de creación descendente (últimos primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.documentDate).getTime();
      const dateB = new Date(b.createdAt || b.documentDate).getTime();
      return dateB - dateA;
    });
    
    // Aplicar filtro de estado de firma
    if (signatureFilter === 'unsigned') {
      filtered = filtered.filter(doc => 
        doc.signatureStatus === 'UNSIGNED' || 
        doc.signatureStatus === 'IN_FLOW' || 
        doc.signatureStatus === 'PARTIALLY_SIGNED' ||
        !doc.signatureStatus
      );
    } else if (signatureFilter === 'signed') {
      filtered = filtered.filter(doc => doc.signatureStatus === 'SIGNED');
    }
    
    // Aplicar búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.fileName.toLowerCase().includes(search) ||
        doc.documentNumber.toLowerCase().includes(search) ||
        doc.sender.toLowerCase().includes(search)
      );
    }
    
    return filtered;
  }, [documents, signatureFilter, searchTerm]);

  // Paginación
  const totalPages = Math.ceil(sortedAndFilteredDocuments.length / itemsPerPage);
  const paginatedDocuments = sortedAndFilteredDocuments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset página cuando cambian filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [signatureFilter, searchTerm]);

  const canProceedToStep = (step: number): boolean => {
    if (step === 2) return !!selectedDocument;
    if (step === 3) {
      const hasReason = !!signatureReason && (signatureReason !== 'custom' || customReason.trim().length > 0);
      return !!selectedDocument && hasReason;
    }
    return true;
  };

  const getDisplayReason = (): string => {
    if (signatureReason === 'custom') return customReason;
    const reason = signatureReasons.find(r => r.value === signatureReason);
    return reason?.label || signatureReason;
  };

  const handleNextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      if (!signatureReason) {
        toast.error('Seleccione el motivo de la firma');
      } else if (signatureReason === 'custom' && !customReason.trim()) {
        toast.error('Escriba el motivo personalizado');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    if (fromFlowId) {
      if (document.signatureStatus === 'IN_FLOW' || document.signatureStatus === 'PARTIALLY_SIGNED') {
        setSelectedDocument(document);
        setCurrentStep(2);
        return;
      }
    }
    
    if (document.signatureStatus === 'SIGNED') {
      toast.error('Este documento ya está firmado');
      return;
    }
    
    setSelectedDocument(document);
    setCurrentStep(2);
  };

  const handleConfirmSign = () => {
    setShowConfirmDialog(true);
  };

  const handleSign = async () => {
    setShowConfirmDialog(false);
    const displayReason = getDisplayReason();
    
    if (!selectedDocument || !displayReason.trim()) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    let logoUrl: string | undefined;
    if (config?.signatureStampEnabled && config?.stampUrl) {
      logoUrl = config.stampUrl;
    } else {
      logoUrl = `${API_URL}/firma/assets/logo_firma.png`;
    }

    await signDocument(selectedDocument.id, displayReason, logoUrl, fromFlowId || undefined);
  };

  const handleCancelSignature = () => {
    if (cancelSignature) {
      cancelSignature();
    }
    toast.info('Proceso de firma cancelado');
  };

  const handleSignAnother = () => {
    setShowSuccessModal(false);
    setCurrentStep(1);
    setSelectedDocument(null);
    setSignatureReason('');
    setCustomReason('');
    setSignatureAppearance('horizontal');
    setPdfUrl(null);
    setShowAdvancedOptions(false);
    
    if (fromFlowId) {
      setFromFlowId(null);
      router.replace('/dashboard/firma/firmar');
    }
    
    toast.success('Puede seleccionar otro documento');
  };

  const handleStartTour = () => {
    resetTour('firma-firmar-tour');
    setTimeout(() => startTour('firma-firmar-tour'), 100);
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  return (
    <>
      {/* Modal de éxito */}
      <SignatureSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        document={selectedDocument}
        signatureStatus="VALID"
        onSignAnother={handleSignAnother}
      />

      {/* Overlay de progreso profesional */}
      <SignatureProgressOverlay
        isVisible={loading}
        state={progressState}
        message={progressMessage}
        onCancel={handleCancelSignature}
      />

      {/* Modal de vista rápida de PDF */}
      <Dialog open={showQuickPreview} onOpenChange={handleCloseQuickPreview}>
        <DialogContent className="max-w-[95vw] w-[1200px] h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="truncate">{quickPreviewDocument?.fileName}</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Vista previa del documento - {quickPreviewDocument?.documentNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900">
            {loadingQuickPreview ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Cargando documento...</p>
                </div>
              </div>
            ) : quickPreviewUrl ? (
              <div className="h-full w-full">
                <PDFPreview file={quickPreviewUrl} className="h-full w-full" />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No se pudo cargar el documento</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleCloseQuickPreview}>
              Cerrar
            </Button>
            {quickPreviewDocument?.signatureStatus !== 'SIGNED' && (
              <Button onClick={handleSelectFromPreview} className="gap-2">
                <Check className="h-4 w-4" />
                Seleccionar y Continuar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Confirmar Firma Digital
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">Está a punto de firmar digitalmente:</span>
              <span className="block bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <span className="block font-medium text-slate-900 dark:text-white">
                  {selectedDocument?.fileName}
                </span>
                <span className="block text-sm text-slate-500">
                  Nº {selectedDocument?.documentNumber}
                </span>
              </span>
              <span className="block text-sm text-amber-600 dark:text-amber-400">
                Esta acción es irreversible. ¿Desea continuar?
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSign} className="bg-blue-600 hover:bg-blue-700">
              Sí, Firmar Documento
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contenido principal */}
      <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header compacto */}
        <div className="px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Firma Digital
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                {steps[currentStep - 1].description}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleStartTour} className="gap-2">
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ayuda</span>
            </Button>
          </div>
        </div>

        {/* Stepper minimalista */}
        <div className="px-6 lg:px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-2xl mx-auto">
            {/* Barra de progreso */}
            <Progress value={progressPercentage} className="h-1.5 mb-4" />
            
            {/* Steps */}
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900' 
                            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
                        }
                      `}>
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className={`
                        mt-2 text-xs font-medium transition-colors
                        ${isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}
                      `}>
                        {step.title}
                      </span>
                    </div>
                    
                    {index < steps.length - 1 && (
                      <div className={`
                        w-16 sm:w-24 h-0.5 mx-2 sm:mx-4 -mt-6 transition-colors
                        ${currentStep > step.id ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenido del paso actual */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            
            {/* PASO 1: Selección de documento */}
            {currentStep === 1 && (
              <div className="space-y-4">
                {/* Barra de búsqueda y filtros */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Buscador */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Buscar por nombre, número o remitente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-10"
                    />
                  </div>
                  
                  {/* Filtro de estado de firma */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select value={signatureFilter} onValueChange={(v: 'all' | 'unsigned' | 'signed') => setSignatureFilter(v)}>
                      <SelectTrigger className="w-[160px] h-10">
                        <SelectValue placeholder="Filtrar por estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="unsigned">Sin firmar</SelectItem>
                        <SelectItem value="signed">Firmados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Info sobre flujos */}
                {fromFlowId && (
                  <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-300">
                      Redirigido desde un flujo de firma. Puede firmar documentos en flujo o parcialmente firmados.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Contador de resultados */}
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>
                    {sortedAndFilteredDocuments.length} documento{sortedAndFilteredDocuments.length !== 1 ? 's' : ''} encontrado{sortedAndFilteredDocuments.length !== 1 ? 's' : ''}
                  </span>
                  {totalPages > 1 && (
                    <span>Página {currentPage} de {totalPages}</span>
                  )}
                </div>

                {/* Lista de documentos */}
                {loadingDocuments ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                  </div>
                ) : paginatedDocuments.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">
                      {searchTerm || signatureFilter !== 'all' 
                        ? 'No se encontraron documentos con los filtros aplicados' 
                        : 'No hay documentos disponibles'}
                    </p>
                    {(searchTerm || signatureFilter !== 'all') && (
                      <Button 
                        variant="link" 
                        className="mt-2 text-blue-600"
                        onClick={() => {
                          setSearchTerm('');
                          setSignatureFilter('all');
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {paginatedDocuments.map((doc, index) => {
                      const isAlreadySigned = doc.signatureStatus === 'SIGNED';
                      const canSignInFlow = fromFlowId && (doc.signatureStatus === 'IN_FLOW' || doc.signatureStatus === 'PARTIALLY_SIGNED');
                      const isBlocked = isAlreadySigned && !canSignInFlow;
                      const isSelected = selectedDocument?.id === doc.id;
                      const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;
                      
                      return (
                        <div
                          key={doc.id}
                          className={`
                            group relative flex items-center gap-3 p-4 rounded-xl border-2 transition-all
                            ${isBlocked 
                              ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-default' 
                              : isSelected 
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md cursor-pointer' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-sm cursor-pointer'
                            }
                          `}
                          onClick={() => !isBlocked && handleDocumentSelect(doc)}
                        >
                          {/* Número */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {itemNumber}
                            </span>
                          </div>

                          {/* Icono de documento */}
                          <div className={`
                            flex-shrink-0 p-2.5 rounded-lg transition-colors
                            ${isAlreadySigned 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : isSelected 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }
                          `}>
                            {isAlreadySigned ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          
                          {/* Contenido */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-slate-900 dark:text-white truncate">
                                {doc.documentNumber}
                              </span>
                              <Badge variant="outline" className={`text-[10px] ${getSignatureStatusBadge(doc.signatureStatus).className}`}>
                                {getSignatureStatusBadge(doc.signatureStatus).label}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {doc.fileName}
                            </p>
                            <div className="flex gap-3 mt-1 text-xs text-slate-400">
                              <span>{doc.documentType.name}</span>
                              <span>•</span>
                              <span>{doc.folioCount} folios</span>
                              <span>•</span>
                              <span>{new Date(doc.createdAt || doc.documentDate).toLocaleDateString()}</span>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-2">
                            {/* Botón ver PDF - siempre visible para todos los documentos */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickPreview(doc);
                              }}
                              className={`h-9 w-9 transition-opacity ${isBlocked ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                              title="Vista rápida del PDF"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            
                            {/* Indicador de selección */}
                            {isSelected && (
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-9 w-9 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* PASO 2: Configuración simplificada */}
            {currentStep === 2 && selectedDocument && (
              <div className="space-y-6">
                {/* Card del documento seleccionado - Compacto */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <Collapsible open={showDocumentDetails} onOpenChange={setShowDocumentDetails}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{selectedDocument.documentNumber}</CardTitle>
                              <CardDescription className="text-xs truncate max-w-md">
                                {selectedDocument.fileName}
                              </CardDescription>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {showDocumentDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 pb-4">
                        <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                          <div>
                            <span className="text-slate-500">Tipo:</span>
                            <span className="ml-2 font-medium text-slate-900 dark:text-white">{selectedDocument.documentType.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Oficina:</span>
                            <span className="ml-2 font-medium text-slate-900 dark:text-white">{selectedDocument.office.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Remitente:</span>
                            <span className="ml-2 font-medium text-slate-900 dark:text-white">{selectedDocument.sender}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Folios:</span>
                            <span className="ml-2 font-medium text-slate-900 dark:text-white">{selectedDocument.folioCount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Configuración de firma - Destacado */}
                <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-slate-900">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      Motivo de la Firma
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selector de motivo */}
                    <div>
                      <Label className="text-sm font-medium mb-2 block">
                        Seleccione el motivo <span className="text-red-500">*</span>
                      </Label>
                      <Select value={signatureReason} onValueChange={setSignatureReason}>
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 h-11">
                          <SelectValue placeholder="Seleccione el motivo de la firma" />
                        </SelectTrigger>
                        <SelectContent>
                          {signatureReasons.map(reason => (
                            <SelectItem key={reason.value} value={reason.value}>
                              {reason.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Campo personalizado */}
                    {signatureReason === 'custom' && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Motivo personalizado <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          placeholder="Escriba el motivo de su firma..."
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          rows={2}
                          className="bg-white dark:bg-slate-800"
                        />
                      </div>
                    )}

                    {/* Opciones avanzadas colapsables */}
                    <Collapsible open={showAdvancedOptions} onOpenChange={setShowAdvancedOptions}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between text-sm text-slate-600 hover:text-slate-900">
                          <span className="flex items-center gap-2">
                            <Settings2 className="h-4 w-4" />
                            Opciones avanzadas
                          </span>
                          {showAdvancedOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pt-4">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">Apariencia de la firma</Label>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setSignatureAppearance('horizontal')}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                signatureAppearance === 'horizontal'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded" />
                                <div className="w-12 h-1 bg-slate-300 rounded" />
                              </div>
                              <p className="text-xs font-medium">Horizontal</p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSignatureAppearance('vertical')}
                              className={`p-3 rounded-lg border-2 transition-all text-left ${
                                signatureAppearance === 'vertical'
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1 mb-1">
                                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded" />
                                <div className="w-12 h-1 bg-slate-300 rounded" />
                              </div>
                              <p className="text-xs font-medium">Vertical</p>
                            </button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>

                {/* Vista previa del PDF */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4 text-slate-500" />
                      Vista Previa del Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[400px] border-t border-slate-200 dark:border-slate-700">
                      {loadingPdf ? (
                        <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Cargando...</p>
                          </div>
                        </div>
                      ) : pdfUrl ? (
                        <PDFPreview file={pdfUrl} className="h-full" />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                          <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500 mb-3">No se pudo cargar el documento</p>
                          <Button variant="outline" size="sm" onClick={() => loadPdfPreview(selectedDocument.id)}>
                            Reintentar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PASO 3: Resumen y firma */}
            {currentStep === 3 && selectedDocument && (
              <div className="space-y-6">
                {/* Resumen */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen de Firma</CardTitle>
                    <CardDescription>Verifique los detalles antes de firmar</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Documento</p>
                          <p className="font-medium text-slate-900 dark:text-white">{selectedDocument.fileName}</p>
                          <p className="text-sm text-slate-500">Nº {selectedDocument.documentNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <FileSignature className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Motivo</p>
                          <p className="font-medium text-slate-900 dark:text-white">{getDisplayReason()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Requisitos técnicos */}
                <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium mb-1">Requisitos:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>Token USB de Firma Perú conectado</li>
                      <li>Drivers del token instalados</li>
                      <li>Certificado digital vigente</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Botón de firma */}
                <Button
                  onClick={handleConfirmSign}
                  disabled={loading}
                  className="
                    w-full h-14 text-lg font-semibold
                    bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600
                    hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700
                    shadow-lg hover:shadow-xl transition-all duration-300
                    group
                  "
                >
                  <span className="flex items-center justify-center gap-3">
                    <div className="relative">
                      <FileSignature className="h-6 w-6" />
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <span>Iniciar Firma Digital</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Navegación inferior */}
        {currentStep > 1 && (
          <div className="px-6 lg:px-8 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="max-w-4xl mx-auto flex justify-between">
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={loading}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              {currentStep < 3 && (
                <Button
                  onClick={handleNextStep}
                  disabled={!canProceedToStep(currentStep + 1)}
                  className="gap-2"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
