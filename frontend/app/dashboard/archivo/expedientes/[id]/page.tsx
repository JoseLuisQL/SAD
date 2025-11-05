'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Trash2,
  FolderOpen,
  FileText,
  Calendar,
  User,
  Settings,
  BarChart3,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { ExpedienteFormDrawer } from '@/components/expedientes/ExpedienteFormDrawer';
import { DualListManager } from '@/components/expedientes/DualListManager';
import { ExpedienteTimeline } from '@/components/expedientes/ExpedienteTimeline';
import DocumentsTable from '@/components/documents/DocumentsTable';
import { useExpedientes } from '@/hooks/useExpedientes';
import { useDocuments } from '@/hooks/useDocuments';
import { useExpedienteAnalytics } from '@/hooks/useExpedienteAnalytics';
import { Expediente, ExpedienteFormData } from '@/types/expediente.types';
import { Document } from '@/types/document.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpedienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    getExpedienteById,
    updateExpediente,
    deleteExpediente,
    addDocumentsToExpediente,
    removeDocumentsFromExpediente,
  } = useExpedientes();
  const { downloadDocument } = useDocuments();
  const { analytics, loading: analyticsLoading } = useExpedienteAnalytics(id);

  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showManageDocsModal, setShowManageDocsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');

  useEffect(() => {
    loadExpediente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadExpediente = async () => {
    try {
      setLoading(true);
      const data = await getExpedienteById(id);
      setExpediente(data);
    } catch (error) {
      console.error('Error al cargar expediente:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (data: Partial<ExpedienteFormData>) => {
    await updateExpediente(id, data);
    setShowEditModal(false);
    loadExpediente();
  };

  const handleDeleteConfirm = async () => {
    await deleteExpediente(id);
    router.push('/dashboard/archivo/expedientes');
  };

  const handleManageDocumentsSave = async (
    addedIds: string[],
    removedIds: string[]
  ) => {
    try {
      if (addedIds.length > 0) {
        await addDocumentsToExpediente(id, addedIds);
      }
      if (removedIds.length > 0) {
        await removeDocumentsFromExpediente(id, removedIds);
      }
      await loadExpediente();
    } catch (error) {
      console.error('Error en handleManageDocumentsSave:', error);
      throw error;
    }
  };

  const handleViewDocument = (document: Document) => {
    router.push(`/dashboard/archivo/documentos/${document.id}`);
  };

  const handleDownloadDocument = (document: Document) => {
    downloadDocument(document.id, document.fileName);
  };

  const calculateStats = () => {
    if (!expediente || !expediente.documents) return null;

    const totalFolios = expediente.documents.reduce(
      (sum, doc) => sum + doc.folioCount,
      0
    );

    const documentTypeCount: Record<string, number> = {};
    expediente.documents.forEach((doc) => {
      const typeName = doc.documentType.name;
      documentTypeCount[typeName] = (documentTypeCount[typeName] || 0) + 1;
    });

    return {
      totalDocuments: expediente.documents.length,
      totalFolios,
      documentTypes: documentTypeCount,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div>
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-8 mr-4" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Expediente no encontrado
        </h3>
        <Button onClick={() => router.push('/dashboard/archivo/expedientes')}>
          Volver a Expedientes
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/archivo/expedientes')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{expediente.code}</h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">{expediente.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowEditModal(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowManageDocsModal(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Gestionar Documentos
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Total Documentos</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalDocuments}
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Total Folios</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats?.totalFolios}
              </p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Tipos de Documentos</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats ? Object.keys(stats.documentTypes).length : 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FolderOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:shadow-md dark:hover:shadow-slate-700/30 transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Creado</p>
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                {format(new Date(expediente.createdAt), 'dd MMM yyyy', {
                  locale: es,
                })}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Por {expediente.creator.firstName} {expediente.creator.lastName}
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <User className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="resumen" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos ({expediente.documents.length})
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análisis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Código
                    </label>
                    <p className="mt-2 text-base text-gray-900 dark:text-slate-100 font-medium">{expediente.code}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Nombre
                    </label>
                    <p className="mt-2 text-base text-gray-900 dark:text-slate-100 font-medium">{expediente.name}</p>
                  </div>
                  {expediente.description && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                        Descripción
                      </label>
                      <p className="mt-2 text-base text-gray-900 dark:text-slate-200">
                        {expediente.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Creado por
                    </label>
                    <div className="mt-2 flex items-center">
                      <User className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                      <span className="text-base text-gray-900 dark:text-slate-100 font-medium">
                        {expediente.creator.firstName}{' '}
                        {expediente.creator.lastName}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Fecha de creación
                    </label>
                    <div className="mt-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500 dark:text-slate-400" />
                      <span className="text-base text-gray-900 dark:text-slate-100 font-medium">
                        {format(
                          new Date(expediente.createdAt),
                          "dd 'de' MMMM 'de' yyyy",
                          { locale: es }
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {stats && Object.keys(stats.documentTypes).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                    <label className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 block">
                      Distribución por Tipo de Documento
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(stats.documentTypes).map(([type, count]) => (
                        <Badge key={type} variant="secondary" className="text-sm font-medium">
                          {type}: {count}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documentos" className="bg-white dark:bg-slate-900">
            {expediente.documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay documentos asociados
                </h3>
                <p className="text-gray-500 dark:text-slate-400 mb-4">
                  Agrega documentos a este expediente para comenzar.
                </p>
                <Button onClick={() => setShowManageDocsModal(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Agregar Documentos
                </Button>
              </div>
            ) : (
              <DocumentsTable
                documents={expediente.documents}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
              />
            )}
          </TabsContent>

          <TabsContent value="timeline" className="bg-white dark:bg-slate-900">
            <ExpedienteTimeline expedienteId={id} />
          </TabsContent>

          <TabsContent value="analytics" className="bg-white dark:bg-slate-900">
            {analyticsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {analytics.distribucionPorTipo.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Distribución por Tipo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analytics.distribucionPorTipo.map((item) => (
                        <Card key={item.name} className="p-4 dark:bg-slate-800 dark:border-slate-700">
                          <p className="text-sm text-gray-600 dark:text-slate-400">{item.name}</p>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                            {item.count}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.estadoFirmas && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Estado de Firmas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                        <p className="text-sm text-green-700 dark:text-green-300">Firmados</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                          {analytics.estadoFirmas.firmados}
                        </p>
                      </Card>
                      <Card className="p-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                        <p className="text-sm text-amber-700 dark:text-amber-300">Pendientes</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                          {analytics.estadoFirmas.pendientes}
                        </p>
                      </Card>
                      <Card className="p-4 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
                        <p className="text-sm text-gray-700 dark:text-slate-300">Sin Firmar</p>
                        <p className="text-2xl font-bold text-gray-600 dark:text-slate-300 mt-1">
                          {analytics.estadoFirmas.sinFirmar}
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {analytics.oficinasRepresentadas.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Oficinas Representadas
                    </h3>
                    <div className="space-y-2">
                      {analytics.oficinasRepresentadas.map((oficina) => (
                        <div
                          key={oficina.officeId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {oficina.name}
                          </span>
                          <Badge variant="secondary">{oficina.count} docs</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay datos analíticos disponibles
                </h3>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>

      <ExpedienteFormDrawer
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditSubmit}
        mode="edit"
        initialData={expediente}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">¿Eliminar expediente?</AlertDialogTitle>
            <AlertDialogDescription className="dark:text-slate-400">
              Esta acción no se puede deshacer. El expediente{' '}
              <strong className="dark:text-slate-200">{expediente.code}</strong> será eliminado permanentemente.
            </AlertDialogDescription>
            {expediente.documents.length > 0 && (
              <div className="mt-2 text-yellow-600 dark:text-yellow-400 text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                ⚠️ Este expediente tiene {expediente.documents.length} documentos
                asociados. No se podrá eliminar hasta que se remuevan todos los
                documentos.
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={expediente.documents.length > 0}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showManageDocsModal && (
        <DualListManager
          open={showManageDocsModal}
          onClose={() => setShowManageDocsModal(false)}
          expedienteId={id}
          expedienteName={expediente.name}
          currentDocuments={expediente.documents}
          onSave={handleManageDocumentsSave}
        />
      )}
    </div>
  );
}
