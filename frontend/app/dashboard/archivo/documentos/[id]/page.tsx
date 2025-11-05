'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { ArrowLeft, Download, Edit, Trash2, FileText, Calendar, User, Building2, Hash, FileDigit, RotateCcw, CheckCircle2, Clock, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import PDFPreview from '@/components/documents/PDFPreview';
import { VersionHistory } from '@/components/documents/VersionHistory';
import { RevertSignatureModal } from '@/components/firma/RevertSignatureModal';
import { CompareVersionsModal } from '@/components/documents/CompareVersionsModal';
import { SignatureStatusBadge } from '@/components/shared/SignatureStatusBadge';
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
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  // Estados para firmas y versiones
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [canRevertSignatures, setCanRevertSignatures] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareVersions, setCompareVersions] = useState<[string, string] | null>(null);
  
  // Calcular si es admin desde el usuario
  // El usuario tiene roleName directamente, no user.role.name
  const isAdmin = user?.roleName === 'Administrador';

  useEffect(() => {
    loadDocument();
    return () => {
      // Cleanup: liberar el blob URL cuando se desmonte el componente
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId]);

  useEffect(() => {
    if (document) {
      loadSignatures();
      if (isAdmin) {
        checkRevertPermission();
      }
    }
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
      const response = await api.get(`/firma/revert/${documentId}/can-revert`);
      setCanRevertSignatures(response.data.data.canRevert);
    } catch (error) {
      setCanRevertSignatures(false);
    }
  };

  const loadPdf = async (id: string) => {
    try {
      setLoadingPdf(true);
      
      // Usar la API que ya maneja la autenticación
      const response = await documentsApi.download(id);
      
      // response.data es el blob
      const blob = response.data as unknown as Blob;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error al cargar PDF:', error);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownload = () => {
    if (document) {
      downloadDocument(document.id, document.fileName);
    }
  };

  const handleDelete = async () => {
    if (document) {
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto max-w-[1920px]">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Documento {document.documentNumber}</h1>
              <SignatureStatusBadge status={document.signatureStatus || 'UNSIGNED'} />
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Creado el {format(new Date(document.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleDownload} className="border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button variant="outline" onClick={() => router.push(`/dashboard/archivo/documentos/${document.id}/editar`)} className="border-slate-300 dark:border-slate-700 dark:hover:bg-slate-800">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-red-300 hover:border-red-400 dark:border-red-800 dark:hover:border-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7">
          <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Vista Previa</h2>
            {loadingPdf ? (
              <div className="flex justify-center items-center h-[600px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <p className="text-slate-600 dark:text-slate-400">Cargando documento...</p>
                </div>
              </div>
            ) : pdfUrl ? (
              <PDFPreview file={pdfUrl} />
            ) : (
              <div className="flex justify-center items-center h-[600px] bg-slate-50 dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
                <div className="text-center">
                  <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No se pudo cargar el PDF</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Intente descargar el documento</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="xl:col-span-5 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <TabsTrigger 
                value="info"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 dark:text-slate-400 dark:data-[state=active]:text-white"
              >
                Información
              </TabsTrigger>
              <TabsTrigger 
                value="versions"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 dark:text-slate-400 dark:data-[state=active]:text-white"
              >
                Historial
              </TabsTrigger>
              <TabsTrigger 
                value="signatures"
                className="data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-700 dark:text-slate-400 dark:data-[state=active]:text-white"
              >
                Firmas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-6 space-y-4">
              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  Información del Documento
                </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Hash className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Número de Documento</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.documentNumber}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Fecha del Documento</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {format(new Date(document.documentDate), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tipo de Documento</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.documentType.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Oficina</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.office.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Remitente</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5 break-words">{document.sender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileDigit className="w-5 h-5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Número de Folios</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.folioCount}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Archivador</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Código</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.archivador.code}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Nombre</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{document.archivador.name}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Archivo</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Nombre del Archivo</p>
                <p className="font-semibold text-slate-900 dark:text-white break-all mt-0.5">{document.fileName}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Tamaño</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{formatFileSize(document.fileSize)}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Versión</p>
                <p className="font-semibold text-slate-900 dark:text-white mt-0.5">v{document.currentVersion}</p>
              </div>
            </div>
          </Card>

              {document.annotations && (
                <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                  <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Anotaciones</h2>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{document.annotations}</p>
                </Card>
              )}

              <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Creado por</h2>
                <p className="font-semibold text-slate-900 dark:text-white">{document.creator.fullName}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {format(new Date(document.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="versions" className="mt-6">
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

            <TabsContent value="signatures" className="mt-6">
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <CardTitle className="text-slate-900 dark:text-white font-semibold">Firmas del Documento</CardTitle>
                    {canRevertSignatures && signatures.length > 0 && isAdmin && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowRevertModal(true)}
                        className="w-full sm:w-auto"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Revertir Firmas
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {signatures.length === 0 ? (
                    <div className="text-center py-12">
                      <FileSignature className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 font-medium">Este documento no tiene firmas activas</p>
                      <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">Las firmas aparecerán aquí una vez aplicadas</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {signatures.map((sig) => (
                        <div key={sig.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">{sig.signer.fullName}</p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Firmante</p>
                              </div>
                            </div>
                            <Badge className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 flex-shrink-0">
                              {sig.status === 'VÁLIDO' || sig.status === 'VALID' ? 'Completada' : sig.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                            <span>{format(new Date(sig.timestamp), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                          {sig.observations && sig.observations.length > 0 && (
                            <div className="text-sm pt-3 border-t border-slate-200 dark:border-slate-700">
                              <p className="font-semibold text-slate-900 dark:text-white mb-2">Observaciones:</p>
                              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                                {sig.observations.map((obs, idx) => (
                                  <li key={idx}>{obs}</li>
                                ))}
                              </ul>
                            </div>
                          )}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Eliminar documento?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Esta acción no se puede deshacer. El documento{' '}
              <strong className="dark:text-slate-200">{document.documentNumber}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de reversión de firmas */}
      {document && (
        <RevertSignatureModal
          open={showRevertModal}
          onClose={() => setShowRevertModal(false)}
          documentId={documentId}
          documentNumber={document.documentNumber}
          signatures={signatures}
          onSuccess={() => {
            loadDocument();
            loadSignatures();
            setShowRevertModal(false);
            toast.success('Firmas revertidas correctamente');
          }}
        />
      )}

      {/* Modal de comparación de versiones */}
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
              toast.success('Versión restaurada correctamente');
              loadDocument();
              setShowCompareModal(false);
            } catch (error: unknown) {
              const apiError = error as { response?: { data?: { message?: string } } };
              toast.error(apiError.response?.data?.message || 'Error al restaurar versión');
            }
          }}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
