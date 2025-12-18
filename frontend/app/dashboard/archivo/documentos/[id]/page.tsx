'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { 
  ArrowLeft, 
  Download, 
  Edit, 
  Trash2, 
  FileText, 
  Calendar, 
  User, 
  Building2, 
  Hash, 
  Layers,
  FolderArchive,
  HardDrive,
  Clock,
  RotateCcw, 
  CheckCircle2, 
  FileSignature,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import PDFPreview from '@/components/documents/PDFPreview';
import { DocumentSummaryCard } from '@/components/documents/DocumentSummaryCard';
import { VersionHistory } from '@/components/documents/VersionHistory';
import { RevertSignatureModal } from '@/components/firma/RevertSignatureModal';
import { CompareVersionsModal } from '@/components/documents/CompareVersionsModal';
import { InfoRow } from '@/components/shared/InfoRow';
import { useDocuments } from '@/hooks/useDocuments';
import { Document, Signature } from '@/types/document.types';
import { documentsApi } from '@/lib/api/documents';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
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

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  const { user } = useAuthStore();

  const { getDocumentById, downloadDocument, deleteDocument, loading } = useDocuments();
  const [document, setDocument] = useState<Document | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [canRevertSignatures, setCanRevertSignatures] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string, string] | null>(null);
  
  const [infoSectionsOpen, setInfoSectionsOpen] = useState({
    document: true,
    location: true,
    file: false,
    audit: false,
  });

  const isAdmin = user?.role?.name === 'Administrador';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'd') {
          e.preventDefault();
          handleDownload();
        }
        if (e.key === 'e') {
          e.preventDefault();
          router.push(`/dashboard/archivo/documentos/${documentId}/editar`);
        }
      }

      if (e.key === 'Escape') {
        router.back();
      }

      // Tab switching
      if (e.key === '1') setActiveTab('info');
      if (e.key === '2') setActiveTab('versions');
      if (e.key === '3') setActiveTab('signatures');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  useEffect(() => {
    loadDocument();
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  useEffect(() => {
    if (document) {
      loadSignatures();
      if (isAdmin) {
        checkRevertPermission();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document, isAdmin]);

  const loadDocument = async () => {
    const doc = await getDocumentById(documentId);
    if (doc) {
      setDocument(doc);
      await loadPdf(documentId);
    }
  };

  const loadSignatures = async () => {
    try {
      const response = await api.get<{ status: string; data: Signature[] }>(`/documents/${documentId}/signatures`);
      const activeSignatures = response.data.data?.filter((s: Signature) => !s.isReverted) || [];
      setSignatures(activeSignatures);
    } catch (error) {
      console.error('Error al cargar firmas:', error);
      setSignatures([]);
    }
  };

  const checkRevertPermission = async () => {
    try {
      const response = await api.get<{ status: string; data: { canRevert: boolean } }>(`/firma/revert/${documentId}/can-revert`);
      setCanRevertSignatures(response.data.data.canRevert);
    } catch {
      setCanRevertSignatures(false);
    }
  };

  const loadPdf = async (id: string) => {
    try {
      setLoadingPdf(true);
      const response = await documentsApi.download(id);
      const blob = response.data as unknown as Blob;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error al cargar PDF:', error);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (document) {
      downloadDocument(document.id, document.fileName);
    }
  }, [document, downloadDocument]);

  const handleDelete = async () => {
    if (document && deleteConfirmText === 'ELIMINAR') {
      await deleteDocument(document.id);
      router.push('/dashboard/archivo/documentos');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading || !document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]" role="status" aria-label="Cargando documento">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
        <p className="text-gray-500 dark:text-slate-400">Cargando documento...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto">
      {/* Skip links for accessibility */}
      <a 
        href="#pdf-viewer" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg"
      >
        Ir al visor PDF
      </a>
      <a 
        href="#document-details" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:p-2 focus:rounded focus:shadow-lg"
      >
        Ir a detalles del documento
      </a>

      {/* Header with Breadcrumb */}
      <header className="mb-6" role="banner">
        <div className="mb-4">
          <Breadcrumb 
            items={[
              { label: 'Documentos', href: '/dashboard/archivo/documentos' },
              { label: document.documentNumber, current: true },
            ]}
            showHome={false}
          />
        </div>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div className="flex items-start gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()} 
              className="mt-1 text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
              aria-label="Volver a la pagina anterior"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 
                id="document-title"
                className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"
              >
                {document.documentNumber}
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-1">
                {document.documentType.name} - {format(new Date(document.documentDate), 'dd/MM/yyyy', { locale: es })}
              </p>
            </div>
          </div>

          {/* Actions - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              aria-label="Descargar documento"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Descargar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push(`/dashboard/archivo/documentos/${document.id}/editar`)}
              aria-label="Editar documento"
            >
              <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
              Editar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 dark:text-red-400 dark:border-red-800"
              aria-label="Eliminar documento"
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Eliminar
            </Button>
          </div>

          {/* Actions - Mobile */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Menu de acciones">
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/dashboard/archivo/documentos/${document.id}/editar`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* PDF Preview - 8 columns */}
        <div className="xl:col-span-8" id="pdf-viewer">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardContent className="p-4">
              {loadingPdf ? (
                <div className="flex justify-center items-center h-[600px]" role="status">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-gray-600 dark:text-slate-400">Cargando documento...</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <PDFPreview file={pdfUrl} />
              ) : (
                <div className="flex justify-center items-center h-[600px] bg-gray-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-gray-500 dark:text-slate-400 font-medium">No se pudo cargar el PDF</p>
                    <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">Intente descargar el documento</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 4 columns */}
        <div className="xl:col-span-4 space-y-6" id="document-details">
          {/* Summary Card */}
          <DocumentSummaryCard
            documentNumber={document.documentNumber}
            documentType={document.documentType.name}
            signatureStatus={document.signatureStatus || 'UNSIGNED'}
            ocrStatus={document.ocrStatus}
            folioCount={document.folioCount}
            currentVersion={document.currentVersion}
            documentDate={document.documentDate}
            signaturesCount={signatures.length}
            onDownload={handleDownload}
            onEdit={() => router.push(`/dashboard/archivo/documentos/${document.id}/editar`)}
            onViewInfo={() => setActiveTab('info')}
            onViewHistory={() => setActiveTab('versions')}
          />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <TabsTrigger 
                value="info"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700"
                aria-label="Informacion del documento"
              >
                Info
              </TabsTrigger>
              <TabsTrigger 
                value="versions"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700"
                aria-label="Historial de versiones"
              >
                Historial
              </TabsTrigger>
              <TabsTrigger 
                value="signatures"
                className="data-[state=active]:bg-gray-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 relative"
                aria-label="Firmas del documento"
              >
                Firmas
                {signatures.length > 0 && (
                  <Badge className="ml-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs bg-green-600">
                    {signatures.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Tab: Info */}
            <TabsContent value="info" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                <CardContent className="p-4 space-y-0 divide-y divide-gray-100 dark:divide-slate-800">
                  {/* Seccion Documento */}
                  <Collapsible 
                    open={infoSectionsOpen.document} 
                    onOpenChange={(open) => setInfoSectionsOpen(prev => ({ ...prev, document: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 dark:hover:bg-slate-800 -mx-4 px-4 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">Documento</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${infoSectionsOpen.document ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-3">
                      <InfoRow label="Numero" value={document.documentNumber} icon={Hash} copyable />
                      <InfoRow label="Fecha" value={format(new Date(document.documentDate), 'dd/MM/yyyy', { locale: es })} icon={Calendar} />
                      <InfoRow label="Tipo" value={document.documentType.name} icon={FileText} />
                      <InfoRow label="Remitente" value={document.sender} icon={User} copyable truncate />
                      <InfoRow label="Folios" value={`${document.folioCount} pagina${document.folioCount > 1 ? 's' : ''}`} icon={Layers} />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Seccion Ubicacion */}
                  <Collapsible 
                    open={infoSectionsOpen.location} 
                    onOpenChange={(open) => setInfoSectionsOpen(prev => ({ ...prev, location: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 dark:hover:bg-slate-800 -mx-4 px-4 rounded">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">Ubicacion</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${infoSectionsOpen.location ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-3">
                      <InfoRow label="Archivador" value={`${document.archivador.code} - ${document.archivador.name}`} icon={FolderArchive} />
                      <InfoRow label="Oficina" value={document.office.name} icon={Building2} />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Seccion Archivo */}
                  <Collapsible 
                    open={infoSectionsOpen.file} 
                    onOpenChange={(open) => setInfoSectionsOpen(prev => ({ ...prev, file: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 dark:hover:bg-slate-800 -mx-4 px-4 rounded">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">Archivo Digital</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${infoSectionsOpen.file ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-3">
                      <InfoRow label="Nombre" value={document.fileName} icon={FileText} copyable truncate />
                      <InfoRow label="Tamano" value={formatFileSize(document.fileSize)} icon={HardDrive} />
                      <InfoRow label="Version" value={`v${document.currentVersion}`} icon={Layers} />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Seccion Auditoria */}
                  <Collapsible 
                    open={infoSectionsOpen.audit} 
                    onOpenChange={(open) => setInfoSectionsOpen(prev => ({ ...prev, audit: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 hover:bg-gray-50 dark:hover:bg-slate-800 -mx-4 px-4 rounded">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600 dark:text-slate-400" aria-hidden="true" />
                        <span className="font-medium text-gray-900 dark:text-white">Auditoria</span>
                      </div>
                      <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${infoSectionsOpen.audit ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2 pb-3">
                      <InfoRow label="Creado por" value={document.creator.fullName} icon={User} />
                      <InfoRow label="Creado el" value={format(new Date(document.createdAt), "dd/MM/yyyy HH:mm", { locale: es })} icon={Calendar} />
                      <InfoRow label="Actualizado" value={format(new Date(document.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })} icon={Clock} />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Anotaciones */}
                  {document.annotations && (
                    <div className="pt-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Anotaciones</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        {document.annotations}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Versions */}
            <TabsContent value="versions" className="mt-4">
              <VersionHistory
                documentId={documentId}
                onRestoreVersion={loadDocument}
                onCompareVersions={(v1, v2) => {
                  setCompareVersions([v1, v2]);
                  setShowCompareModal(true);
                }}
                isAdmin={isAdmin}
              />
            </TabsContent>

            {/* Tab: Signatures */}
            <TabsContent value="signatures" className="mt-4">
              <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                      Firmas del Documento
                    </CardTitle>
                    {canRevertSignatures && signatures.length > 0 && isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowRevertModal(true)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Revertir
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {signatures.length === 0 ? (
                    <div className="text-center py-8">
                      <FileSignature className="h-12 w-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" aria-hidden="true" />
                      <p className="text-gray-600 dark:text-slate-400 font-medium">Sin firmas activas</p>
                      <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Las firmas apareceran aqui</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {signatures.map((sig) => (
                        <div 
                          key={sig.id} 
                          className="border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-800"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" aria-hidden="true" />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{sig.signer.fullName}</p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {format(new Date(sig.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                              Completada
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Dialog - Improved */}
      <AlertDialog open={showDeleteDialog} onOpenChange={(open) => {
        setShowDeleteDialog(open);
        if (!open) setDeleteConfirmText('');
      }}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
              </div>
              <AlertDialogTitle className="dark:text-white">
                Eliminar documento
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="dark:text-slate-400 space-y-3">
              <p>
                Esta accion eliminara permanentemente el documento{' '}
                <strong className="text-gray-900 dark:text-white">{document.documentNumber}</strong>
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm">
                <p className="font-medium text-red-800 dark:text-red-300 mb-1">Se eliminara:</p>
                <ul className="list-disc list-inside text-red-700 dark:text-red-400 space-y-1">
                  <li>El archivo PDF ({document.fileName})</li>
                  <li>Todas las versiones del documento</li>
                  <li>{signatures.length} firma(s) registradas</li>
                  <li>Historial de cambios</li>
                </ul>
              </div>
              
              <div className="pt-2">
                <label 
                  htmlFor="delete-confirm"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
                >
                  Escribe <strong>ELIMINAR</strong> para confirmar:
                </label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="ELIMINAR"
                  className="uppercase"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmText !== 'ELIMINAR'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revert Signature Modal */}
      {document && (
        <RevertSignatureModal
          open={showRevertModal}
          onClose={() => setShowRevertModal(false)}
          documentId={documentId}
          documentNumber={document.documentNumber}
          signatures={signatures.map(sig => ({
            id: sig.id,
            timestamp: sig.timestamp,
            status: sig.status,
            signer: {
              id: sig.signer.id,
              firstName: sig.signer.fullName.split(' ')[0] || '',
              lastName: sig.signer.fullName.split(' ').slice(1).join(' ') || '',
              username: sig.signer.id,
            }
          }))}
          onSuccess={() => {
            loadDocument();
            loadSignatures();
            setShowRevertModal(false);
            toast.success('Firmas revertidas correctamente');
          }}
        />
      )}

      {/* Compare Versions Modal */}
      {compareVersions && (
        <CompareVersionsModal
          open={showCompareModal}
          onClose={() => {
            setShowCompareModal(false);
            setCompareVersions(null);
          }}
          versionId1={compareVersions[0]}
          versionId2={compareVersions[1]}
          onRestoreVersion={async (versionId) => {
            try {
              await api.post(`/documents/${documentId}/versions/${versionId}/restore`);
              toast.success('Version restaurada correctamente');
              loadDocument();
              setShowCompareModal(false);
            } catch (error: unknown) {
              const apiError = error as { response?: { data?: { message?: string } } };
              toast.error(apiError.response?.data?.message || 'Error al restaurar version');
            }
          }}
          isAdmin={isAdmin}
        />
      )}

      {/* Keyboard shortcuts hint */}
      <div className="hidden lg:block fixed bottom-4 right-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-3 text-xs text-gray-500 dark:text-slate-400">
        <p className="font-medium mb-1">Atajos de teclado:</p>
        <div className="space-y-0.5">
          <p><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Ctrl+D</kbd> Descargar</p>
          <p><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Ctrl+E</kbd> Editar</p>
          <p><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">1</kbd> <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">2</kbd> <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">3</kbd> Tabs</p>
          <p><kbd className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded">Esc</kbd> Volver</p>
        </div>
      </div>
    </div>
  );
}
