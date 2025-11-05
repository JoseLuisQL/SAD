'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Loader2,
  Sparkles
} from 'lucide-react';
import { Document } from '@/types/document.types';
import { documentsApi } from '@/lib/api/documents';
import { useFirma } from '@/hooks/useFirma';
import { useConfigurationStore } from '@/store/configurationStore';
import { Skeleton } from '@/components/ui/skeleton';
import { SignatureSuccessModal } from './SignatureSuccessModal';
import { useRouter, useSearchParams } from 'next/navigation';
import PDFPreview from '@/components/documents/PDFPreview';
import Cookies from 'js-cookie';
import { STORAGE_KEYS, API_URL } from '@/lib/constants';
import { useOnboarding } from '@/hooks/useOnboarding';

interface Step {
  id: number;
  title: string;
  description: string;
}

const steps: Step[] = [
  { id: 1, title: 'Seleccionar Documento', description: 'Elige el documento a firmar' },
  { id: 2, title: 'Revisar Detalles', description: 'Verifica la información' },
  { id: 3, title: 'Firmar', description: 'Firma digitalmente' }
];

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

const getSignatureStatusBadge = (status?: string) => {
  switch (status) {
    case 'SIGNED':
      return { label: 'Firmado', className: 'bg-green-100 text-green-800 border-green-200' };
    case 'PARTIALLY_SIGNED':
      return { label: 'Parcialmente firmado', className: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'IN_FLOW':
      return { label: 'En flujo de firma', className: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'REVERTED':
      return { label: 'Firma revertida', className: 'bg-red-100 text-red-800 border-red-200' };
    case 'UNSIGNED':
    default:
      return { label: 'Sin firma', className: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export function SignatureWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [signatureReason, setSignatureReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [signatureAppearance, setSignatureAppearance] = useState<'horizontal' | 'vertical'>('horizontal');
  const [useLogo, setUseLogo] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [fromFlowId, setFromFlowId] = useState<string | null>(null);
  const { signDocument, loading, progressState, progressMessage } = useFirma();
  const { config, fetchConfig } = useConfigurationStore();
  const { startTour, resetTour } = useOnboarding();

  useEffect(() => {
    fetchDocuments();
    fetchConfig();
    
    // Check if coming from signature flow
    const flowId = searchParams.get('flowId');
    if (flowId) {
      setFromFlowId(flowId);
    }
  }, [fetchConfig, searchParams]);

  // Monitor signature completion
  useEffect(() => {
    if (progressState === 'completed') {
      setShowSuccessModal(true);
    }
  }, [progressState]);

  // Auto-select document from URL parameters
  useEffect(() => {
    const documentId = searchParams.get('documentId');
    if (documentId && documents.length > 0 && !selectedDocument) {
      const doc = documents.find(d => d.id === documentId);
      if (doc) {
        setSelectedDocument(doc);
        setCurrentStep(2);
        toast.success('Documento seleccionado automáticamente desde el flujo de firma');
      } else {
        toast.error('No se encontró el documento especificado');
      }
    }
  }, [documents, searchParams, selectedDocument]);

  // Load PDF when document is selected
  useEffect(() => {
    if (selectedDocument && currentStep === 2) {
      loadPdfPreview();
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

  const loadPdfPreview = async () => {
    if (!selectedDocument) return;

    setLoadingPdf(true);
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const response = await fetch(`${API_URL}/documents/${selectedDocument.id}/download`, {
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
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('No se pudo cargar la vista previa del documento');
      setPdfUrl(null);
    } finally {
      setLoadingPdf(false);
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChecklist = (): ChecklistItem[] => {
    const hasReason = signatureReason && (signatureReason !== 'custom' || customReason.trim().length > 0);
    
    return [
      {
        id: 'document',
        label: 'Documento seleccionado',
        completed: !!selectedDocument,
        required: true
      },
      {
        id: 'reason',
        label: 'Motivo de firma especificado',
        completed: hasReason,
        required: true
      },
      {
        id: 'appearance',
        label: 'Apariencia configurada',
        completed: !!signatureAppearance,
        required: false
      },
      {
        id: 'token',
        label: 'Token USB conectado',
        completed: true,
        required: true
      },
      {
        id: 'drivers',
        label: 'Drivers instalados',
        completed: true,
        required: true
      },
      {
        id: 'logo',
        label: 'Logo institucional incluido',
        completed: true,
        required: false
      }
    ];
  };

  const canProceedToStep = (step: number): boolean => {
    if (step === 2) {
      return !!selectedDocument;
    }
    if (step === 3) {
      const hasReason = signatureReason && (signatureReason !== 'custom' || customReason.trim().length > 0);
      return !!selectedDocument && hasReason;
    }
    return true;
  };

  const getDisplayReason = (): string => {
    const reasonMap: Record<string, string> = {
      'author': 'Soy el autor del documento',
      'conformidad': 'En señal de conformidad',
      'voBo': 'Doy V° B°',
      'encargo': 'Por encargo',
      'fe': 'Doy fé',
      'revision': 'Revisado y aprobado',
      'autorizacion': 'Autorización',
      'recepcion': 'Recepción conforme',
      'custom': customReason
    };
    return reasonMap[signatureReason] || signatureReason;
  };

  const handleNextStep = () => {
    if (currentStep < 3 && canProceedToStep(currentStep + 1)) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) {
      if (!signatureReason) {
        toast.error('Por favor, seleccione el motivo de la firma');
      } else if (signatureReason === 'custom' && !customReason.trim()) {
        toast.error('Por favor, escriba el motivo personalizado de la firma');
      }
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentSelect = (document: Document) => {
    // Si viene desde un flujo, permitir firmar documentos en flujo o parcialmente firmados
    if (fromFlowId) {
      if (document.signatureStatus === 'IN_FLOW' || document.signatureStatus === 'PARTIALLY_SIGNED') {
        setSelectedDocument(document);
        setCurrentStep(2);
        return;
      }
    }
    
    // Validar que el documento no esté completamente firmado (fuera de flujo)
    if (document.signatureStatus === 'SIGNED') {
      toast.error('Este documento ya está firmado. No se puede firmar nuevamente desde este módulo.');
      return;
    }
    
    setSelectedDocument(document);
    setCurrentStep(2);
  };

  const handleSign = async () => {
    const displayReason = getDisplayReason();
    
    if (!selectedDocument || !displayReason.trim()) {
      toast.error('Por favor complete todos los campos requeridos');
      return;
    }

    // Use configured stamp URL if signature stamp is enabled and useLogo is checked
    let logoUrl: string | undefined;
    if (useLogo && config?.signatureStampEnabled && config?.stampUrl) {
      logoUrl = config.stampUrl;
    } else if (useLogo && config?.signatureStampEnabled === false) {
      toast.warning('El sello de firma está desactivado en la configuración');
    } else if (useLogo) {
      // Fallback to default logo if stamp is not configured
      logoUrl = `${API_URL}/firma/assets/logo_firma.png`;
    }

    // Callback para después de firmar exitosamente
    const onSuccess = () => {
      if (fromFlowId) {
        // Si viene desde un flujo, redirigir de vuelta a flujos con refresh
        console.log('✅ Firma completada desde flujo, redirigiendo a flujos...');
      }
    };

    await signDocument(selectedDocument.id, displayReason, logoUrl, fromFlowId || undefined, onSuccess);
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  const handleSignAnother = () => {
    // Reset wizard state para firmar otro documento
    setShowSuccessModal(false);
    setCurrentStep(1);
    setSelectedDocument(null);
    setSignatureReason('');
    setCustomReason('');
    setSignatureAppearance('horizontal');
    setShowPreview(false);
    setUseLogo(true);
    setPdfUrl(null);
    
    // Si venía de un flujo, limpiar el flowId para evitar confusiones
    if (fromFlowId) {
      setFromFlowId(null);
      // Opcional: actualizar la URL para remover el parámetro
      router.replace('/dashboard/firma/firmar');
    }
    
    toast.success('Puede seleccionar otro documento para firmar');
  };

  const handleStartTour = () => {
    resetTour('firma-firmar-tour');
    setTimeout(() => {
      startTour('firma-firmar-tour');
    }, 100);
  };

  return (
    <>
      <SignatureSuccessModal
        open={showSuccessModal}
        onOpenChange={setShowSuccessModal}
        document={selectedDocument}
        signatureStatus="VALID"
        onSignAnother={handleSignAnother}
      />
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="px-6 lg:px-8 py-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900" data-tour="firma-wizard-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Asistente de Firma Digital</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Complete los pasos para firmar su documento de forma segura
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartTour}
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Iniciar Tour
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-6 lg:px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm" data-tour="firma-stepper">
          <CardContent className="pt-6">
            <div className="mb-6">
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                        currentStep > step.id
                          ? 'bg-green-500 border-green-500 text-white'
                          : currentStep === step.id
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-sm font-medium ${
                          currentStep >= step.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 hidden md:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-0.5 bg-slate-200 mx-4 -mt-10 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        {currentStep > 1 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePreviousStep}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            {currentStep < 3 && (
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToStep(currentStep + 1)}
              >
                Siguiente
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Main Panel */}
          <div className="lg:col-span-2 overflow-y-auto border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950">
            <div className="p-6 lg:p-8 h-full">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                  {steps[currentStep - 1].title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  {steps[currentStep - 1].description}
                </p>
              </div>
              <div>
                {/* Step 1: Document Selection */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                      <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <AlertDescription className="text-sm text-blue-900 dark:text-blue-300">
                        {fromFlowId ? (
                          <>
                            Usted ha sido redirigido desde un flujo de firma. El documento asignado se seleccionará automáticamente.
                            Puede firmar documentos que estén en flujo o parcialmente firmados como parte del proceso colaborativo.
                          </>
                        ) : (
                          <>
                            Los documentos que ya han sido firmados completamente no pueden ser firmados nuevamente desde este módulo. 
                            Varios usuarios pueden firmar el mismo documento, pero cada documento solo puede recibir una firma completa.
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                    
                    <div className="relative" data-tour="firma-search">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <Input
                        type="text"
                        placeholder="Buscar por nombre, número o remitente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {loadingDocuments ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : filteredDocuments.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-600 dark:text-slate-400">
                          {searchTerm ? 'No se encontraron documentos' : 'No hay documentos disponibles'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto pr-2">
                        {filteredDocuments.map((doc) => {
                          // Si viene desde un flujo, solo bloquear documentos completamente firmados
                          // Permitir IN_FLOW y PARTIALLY_SIGNED cuando viene desde flujo
                          const isAlreadySigned = doc.signatureStatus === 'SIGNED';
                          const canSignInFlow = fromFlowId && (doc.signatureStatus === 'IN_FLOW' || doc.signatureStatus === 'PARTIALLY_SIGNED');
                          const isBlocked = isAlreadySigned && !canSignInFlow;
                          
                          return (
                          <div
                            key={doc.id}
                            className={`relative transition-all rounded-lg border-2 p-4 ${
                              isBlocked
                                ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                                : selectedDocument?.id === doc.id
                                ? 'border-blue-500 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md cursor-pointer'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-sm cursor-pointer'
                            }`}
                            onClick={() => !isBlocked && handleDocumentSelect(doc)}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`mt-1 flex-shrink-0 p-2 rounded-lg ${
                                isBlocked
                                  ? 'bg-slate-200 dark:bg-slate-700'
                                  : selectedDocument?.id === doc.id 
                                  ? 'bg-blue-500 dark:bg-blue-600' 
                                  : 'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                <FileText className={`h-5 w-5 ${
                                  isBlocked
                                    ? 'text-slate-500 dark:text-slate-400'
                                    : selectedDocument?.id === doc.id 
                                    ? 'text-white' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                        {doc.documentNumber}
                                      </h3>
                                      <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getSignatureStatusBadge(doc.signatureStatus).className}`}
                                      >
                                        {getSignatureStatusBadge(doc.signatureStatus).label}
                                      </Badge>
                                      {isBlocked && (
                                        <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                                          No disponible
                                        </Badge>
                                      )}
                                      {canSignInFlow && (
                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                          Disponible para flujo
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                                      {doc.fileName}
                                    </p>
                                  </div>
                                  {selectedDocument?.id === doc.id && (
                                    <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  )}
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Tipo:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{doc.documentType.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Folios:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{doc.folioCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Archivador:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{doc.office.name}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Remitente:</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{doc.sender}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {isBlocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/5 dark:bg-slate-950/40 rounded-lg">
                                <div className="bg-white dark:bg-slate-800 px-3 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                    Documento ya firmado
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Review Details */}
                {currentStep === 2 && selectedDocument && (
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">
                        Información del Documento
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Nombre:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.fileName}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Número:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.documentNumber}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Tipo:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.documentType.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Oficina:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.office.name}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Remitente:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.sender}</span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Fecha:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">
                            {new Date(selectedDocument.documentDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-slate-900 dark:text-white">Folios:</span>{' '}
                          <span className="text-slate-600 dark:text-slate-400">{selectedDocument.folioCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Configuración de Firma - MOVED BEFORE PDF */}
                    <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          Configuración de la Firma
                        </CardTitle>
                        <CardDescription>
                          Personalice la apariencia y el motivo de su firma digital
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Razón de la Firma */}
                        <div className="space-y-3">
                          <Label htmlFor="signatureReason" className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            Motivo de la Firma *
                            <span className="text-red-500">*</span>
                          </Label>
                          
                          <Select value={signatureReason} onValueChange={setSignatureReason}>
                            <SelectTrigger className="w-full bg-white dark:bg-slate-800">
                              <SelectValue placeholder="Seleccione el motivo de la firma" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="author">Soy el autor del documento</SelectItem>
                              <SelectItem value="conformidad">En señal de conformidad</SelectItem>
                              <SelectItem value="voBo">Doy V° B°</SelectItem>
                              <SelectItem value="encargo">Por encargo</SelectItem>
                              <SelectItem value="fe">Doy fé</SelectItem>
                              <SelectItem value="revision">Revisado y aprobado</SelectItem>
                              <SelectItem value="autorizacion">Autorización</SelectItem>
                              <SelectItem value="recepcion">Recepción conforme</SelectItem>
                              <SelectItem value="custom">Otro (personalizar)</SelectItem>
                            </SelectContent>
                          </Select>

                          {signatureReason === 'custom' && (
                            <Textarea
                              id="customReason"
                              placeholder="Escriba el motivo personalizado de su firma..."
                              value={customReason}
                              onChange={(e) => setCustomReason(e.target.value)}
                              rows={2}
                              required
                              className="bg-white dark:bg-slate-800 mt-2"
                            />
                          )}

                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            Este campo es obligatorio y se incluirá en los metadatos de la firma digital.
                          </p>
                        </div>

                        <Separator className="dark:bg-slate-700" />

                        {/* Apariencia de la Firma */}
                        <div className="space-y-3">
                          <Label htmlFor="signatureAppearance" className="text-sm font-semibold text-slate-900 dark:text-white">
                            Apariencia de la Firma
                          </Label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setSignatureAppearance('horizontal')}
                              className={`relative p-4 rounded-lg border-2 transition-all ${
                                signatureAppearance === 'horizontal'
                                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                              }`}
                            >
                              {signatureAppearance === 'horizontal' && (
                                <div className="absolute top-2 right-2">
                                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded flex items-center justify-center">
                                  <FileSignature className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                              </div>
                              <p className="text-xs font-medium text-slate-900 dark:text-white text-left">
                                Sello + Descripción Horizontal
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-left mt-0.5">
                                Logo a la izquierda, texto a la derecha
                              </p>
                            </button>

                            <button
                              type="button"
                              onClick={() => setSignatureAppearance('vertical')}
                              className={`relative p-4 rounded-lg border-2 transition-all ${
                                signatureAppearance === 'vertical'
                                  ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                              }`}
                            >
                              {signatureAppearance === 'vertical' && (
                                <div className="absolute top-2 right-2">
                                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                              )}
                              <div className="flex flex-col items-center gap-1 mb-2">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded flex items-center justify-center">
                                  <FileSignature className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded"></div>
                              </div>
                              <p className="text-xs font-medium text-slate-900 dark:text-white text-left">
                                Sello + Descripción Vertical
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 text-left mt-0.5">
                                Logo arriba, texto abajo
                              </p>
                            </button>
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="w-full mt-2"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {showPreview ? 'Ocultar' : 'Ver'} Previsualización
                          </Button>

                          {showPreview && (
                            <div className="mt-3 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-3">
                                Vista previa de la firma:
                              </p>
                              <div className={`inline-flex ${
                                signatureAppearance === 'horizontal' ? 'flex-row items-center gap-3' : 'flex-col items-center gap-2'
                              } p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700`}>
                                {config?.stampUrl ? (
                                  <img 
                                    src={config.stampUrl} 
                                    alt="Logo institucional" 
                                    className="w-12 h-12 object-contain"
                                  />
                                ) : (
                                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded flex items-center justify-center">
                                    <FileSignature className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                )}
                                <div className={signatureAppearance === 'horizontal' ? '' : 'text-center'}>
                                  <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                    {signatureReason === 'author' && 'Soy el autor del documento'}
                                    {signatureReason === 'conformidad' && 'En señal de conformidad'}
                                    {signatureReason === 'voBo' && 'Doy V° B°'}
                                    {signatureReason === 'encargo' && 'Por encargo'}
                                    {signatureReason === 'fe' && 'Doy fé'}
                                    {signatureReason === 'revision' && 'Revisado y aprobado'}
                                    {signatureReason === 'autorizacion' && 'Autorización'}
                                    {signatureReason === 'recepcion' && 'Recepción conforme'}
                                    {signatureReason === 'custom' && (customReason || 'Motivo personalizado')}
                                    {!signatureReason && 'Seleccione un motivo'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Firmado digitalmente
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {config?.signatureStampEnabled === false && (
                          <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <AlertDescription className="text-sm text-amber-900 dark:text-amber-300">
                              El sello de firma está desactivado en la configuración del sistema. 
                              Se usará el logo predeterminado si está disponible.
                            </AlertDescription>
                          </Alert>
                        )}

                        {config?.signatureStampEnabled && config?.stampUrl && (
                          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <AlertDescription className="text-sm text-green-900 dark:text-green-300">
                              Se utilizará el sello corporativo configurado para la firma.
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>

                    <Separator className="dark:bg-slate-700" />

                    {/* PDF Viewer */}
                    <div>
                      <h3 className="text-sm font-semibold mb-3 text-slate-900 dark:text-white">
                        Vista Previa del Documento
                      </h3>
                      {loadingPdf ? (
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 p-8 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-3"></div>
                          <p className="text-slate-600 dark:text-slate-400 text-sm">Cargando vista previa...</p>
                        </div>
                      ) : pdfUrl ? (
                        <PDFPreview file={pdfUrl} className="w-full" />
                      ) : (
                        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                          <AlertCircle className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-600 dark:text-slate-400 text-sm">
                            No se pudo cargar la vista previa del documento
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3"
                            onClick={loadPdfPreview}
                          >
                            Reintentar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Sign */}
                {currentStep === 3 && selectedDocument && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-1">
                            Preparando firma digital
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-400">
                            Al continuar, se abrirá el componente de Firma Perú para completar el proceso
                            con su certificado digital.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Resumen de Firma Digital</CardTitle>
                        <CardDescription>Verifique los detalles antes de firmar</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Documento</Label>
                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 break-words">
                              {selectedDocument.fileName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              Nº {selectedDocument.documentNumber}
                            </p>
                          </div>

                          <Separator className="dark:bg-slate-700" />

                          <div>
                            <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Motivo</Label>
                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                              {getDisplayReason()}
                            </p>
                          </div>

                          <Separator className="dark:bg-slate-700" />

                          <div>
                            <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Apariencia</Label>
                            <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                              {signatureAppearance === 'horizontal' ? 'Sello + Descripción Horizontal' : 'Sello + Descripción Vertical'}
                            </p>
                          </div>

                          <Separator className="dark:bg-slate-700" />

                          <div className="pt-2">
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm text-slate-900 dark:text-white font-medium">
                                Logo institucional incluido
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="text-xs text-slate-700 dark:text-slate-300 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                      <p className="font-medium mb-1 text-amber-900 dark:text-amber-300">Requisitos técnicos:</p>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                        <li>Token USB de Firma Perú conectado</li>
                        <li>Drivers del token instalados y configurados</li>
                        <li>Certificado digital vigente</li>
                        <li>Navegador compatible con el componente web</li>
                      </ul>
                    </div>

                    {loading ? (
                      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
                        <CardContent className="pt-8 pb-8">
                          <div className="flex flex-col items-center space-y-6">
                            <div className="relative">
                              <div className="absolute inset-0 animate-ping">
                                <div className="w-20 h-20 rounded-full bg-blue-400/30"></div>
                              </div>
                              <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                                <Loader2 className="h-10 w-10 text-white animate-spin" />
                              </div>
                            </div>

                            <div className="text-center space-y-2">
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Procesando Firma Digital
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                                {progressMessage || 'Por favor, espere mientras se procesa su firma...'}
                              </p>
                            </div>

                            <div className="w-full max-w-xs">
                              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-2">
                                <span>Progreso</span>
                                <span>
                                  {progressState === 'preparing' && '25%'}
                                  {progressState === 'initiated' && '75%'}
                                  {progressState === 'completed' && '100%'}
                                  {progressState === 'idle' && '0%'}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                                  style={{
                                    width: progressState === 'preparing' ? '25%' : 
                                           progressState === 'initiated' ? '75%' : 
                                           progressState === 'completed' ? '100%' : '0%'
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 text-xs text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 rounded-lg p-4 w-full">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${progressState !== 'idle' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <span>Preparando documento para firma</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${progressState === 'initiated' || progressState === 'completed' ? 'bg-green-500' : progressState === 'preparing' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <span>Aplicando firma con certificado digital</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${progressState === 'completed' ? 'bg-green-500' : progressState === 'initiated' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <span>Verificando integridad de la firma</span>
                              </div>
                            </div>

                            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 w-full">
                              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                              <AlertDescription className="text-xs text-amber-900 dark:text-amber-300">
                                No cierre esta ventana ni desconecte el token USB hasta que finalice el proceso.
                              </AlertDescription>
                            </Alert>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        onClick={handleSign}
                        disabled={loading}
                        className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                      >
                        <span className="flex items-center gap-2">
                          <FileSignature className="h-5 w-5" />
                          Iniciar Firma Digital
                        </span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block overflow-y-auto bg-slate-50 dark:bg-slate-900">
            <div className="p-6 lg:p-8" data-tour="firma-checklist">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Resumen</h2>
              <div className="space-y-4">
                {selectedDocument ? (
                  <>
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Documento</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-1 break-words">
                        {selectedDocument.fileName}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        {selectedDocument.documentNumber}
                      </p>
                    </div>
                    <Separator className="dark:bg-slate-700" />
                    <div>
                      <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Estado</Label>
                      <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                        Paso {currentStep} de {steps.length}
                      </p>
                    </div>
                    {signatureReason && (
                      <>
                        <Separator className="dark:bg-slate-700" />
                        <div>
                          <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Motivo</Label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1 break-words">
                            {getDisplayReason()}
                          </p>
                        </div>
                      </>
                    )}
                    {signatureAppearance && (
                      <>
                        <Separator className="dark:bg-slate-700" />
                        <div>
                          <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase">Apariencia</Label>
                          <p className="text-sm text-slate-900 dark:text-white mt-1">
                            {signatureAppearance === 'horizontal' ? 'Horizontal' : 'Vertical'}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FileSignature className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Seleccione un documento para comenzar
                    </p>
                  </div>
                )}

                <Separator className="dark:bg-slate-700" />

                <div>
                  <Label className="text-xs text-slate-600 dark:text-slate-400 uppercase mb-3 block">
                    Checklist
                  </Label>
                  <div className="space-y-2">
                    {getChecklist().map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.completed ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        ) : item.required ? (
                          <X className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        )}
                        <span
                          className={`text-xs ${
                            item.completed ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {item.label}
                          {item.required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
