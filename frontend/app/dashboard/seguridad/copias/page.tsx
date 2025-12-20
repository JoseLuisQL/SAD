'use client';

import { useState, useEffect } from 'react';
import { useBackupSummary, useBackups } from '@/hooks/useBackups';
import { useRestore } from '@/hooks/useRestore';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LucideIcon } from 'lucide-react';
import {
  Database,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  FileText,
  Loader2,
  Package,
  Info,
  Archive,
  RotateCcw,
  Upload
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { BackupJob, BackupStatus, RestoreStatus } from '@/types/backup.types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Cookies from 'js-cookie';
import { STORAGE_KEYS, API_URL } from '@/lib/constants';

export default function CopiasPage() {
  const { hasPermission } = usePermissions();
  const { summary, isLoading: summaryLoading, refetch: refetchSummary } = useBackupSummary();
  const { backups, total, page, totalPages, isLoading: backupsLoading, setPage, createBackup, refetch: refetchBackups } = useBackups({ limit: 5 });
  const { restores, total: restoresTotal, page: restorePage, totalPages: restoresTotalPages, isLoading: restoresLoading, setPage: setRestorePage, restoreBackup, refetch: refetchRestores } = useRestore({ limit: 5 });

  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupJob | null>(null);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  
  const [showEmergencyRestoreDialog, setShowEmergencyRestoreDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingEmergency, setIsUploadingEmergency] = useState(false);

  const handleDownloadBackup = async (backupId: string, fileName: string) => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      toast.info('Descargando backup...');

      const backendUrl = API_URL.replace('/api', '');
      const downloadUrl = `${backendUrl}/api/security/backups/${backupId}/download`;

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al descargar el backup');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `backup-${backupId}.zip`;

      if (document.body) {
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
          try {
            if (a.parentNode && document.contains(a)) {
              a.parentNode.removeChild(a);
            }
            window.URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.debug('Download cleanup skipped:', cleanupError);
          }
        }, 100);
      }

      toast.success('Backup descargado exitosamente');
    } catch (error: unknown) {
      console.error('Error downloading backup:', error);
      toast.error(error instanceof Error ? error.message : 'Error al descargar el backup');
    }
  };

  const handleEmergencyRestore = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo ZIP');
      return;
    }

    setIsUploadingEmergency(true);

    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);

      if (!token) {
        toast.error('No se encontró token de autenticación');
        return;
      }

      const formData = new FormData();
      formData.append('backup', selectedFile);

      toast.info(`Subiendo ${selectedFile.name}...`);

      const backendUrl = API_URL.replace('/api', '');
      const uploadUrl = `${backendUrl}/api/security/backups/restore-from-file`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al restaurar desde archivo');
      }

      const result = await response.json();
      
      toast.success(result.message || 'Restauración de emergencia completada');
      
      setShowEmergencyRestoreDialog(false);
      setSelectedFile(null);
      
      refetchBackups();
      refetchRestores();
      refetchSummary();

    } catch (error: unknown) {
      console.error('Error emergency restore:', error);
      toast.error(error instanceof Error ? error.message : 'Error al restaurar desde archivo');
    } finally {
      setIsUploadingEmergency(false);
    }
  };

  useEffect(() => {
    const hasPending = backups.some(b => 
      b.status === 'PENDING' || b.status === 'COLLECTING_DATA' || b.status === 'PACKAGING'
    );
    const hasRestorePending = restores.some(r => 
      r.status === 'PENDING' || r.status === 'VALIDATING' || r.status === 'RESTORING_DB' || r.status === 'RESTORING_FILES'
    );

    if (hasPending || hasRestorePending) {
      const interval = setInterval(() => {
        refetchBackups();
        refetchRestores();
        refetchSummary();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [backups, restores, refetchBackups, refetchRestores, refetchSummary]);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      await createBackup();
      setShowBackupDialog(false);
      refetchSummary();
    } catch (error) {
      console.error('Error creating backup:', error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    
    setIsRestoringBackup(true);
    try {
      await restoreBackup(selectedBackup.id);
      setShowRestoreDialog(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const getBackupStatusBadge = (status: BackupStatus) => {
    const config: Record<BackupStatus, { 
      bg: string; 
      text: string; 
      label: string; 
      icon: LucideIcon;
      animate?: boolean;
    }> = {
      PENDING: { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-700 dark:text-slate-300',
        label: 'Pendiente', 
        icon: Clock 
      },
      COLLECTING_DATA: { 
        bg: 'bg-blue-100 dark:bg-blue-900/40', 
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Recopilando', 
        icon: Database,
        animate: true
      },
      PACKAGING: { 
        bg: 'bg-blue-100 dark:bg-blue-900/40', 
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Empaquetando', 
        icon: Package,
        animate: true
      },
      COMPLETED: { 
        bg: 'bg-green-100 dark:bg-green-900/40', 
        text: 'text-green-700 dark:text-green-300',
        label: 'Completado', 
        icon: CheckCircle2 
      },
      FAILED: { 
        bg: 'bg-red-100 dark:bg-red-900/40', 
        text: 'text-red-700 dark:text-red-300',
        label: 'Fallido', 
        icon: AlertTriangle 
      }
    };

    const item = config[status] || config.PENDING;
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.bg} ${item.text}`}>
        <Icon className={`h-3.5 w-3.5 ${item.animate ? 'animate-pulse' : ''}`} aria-hidden="true" />
        {item.label}
      </span>
    );
  };

  const getRestoreStatusBadge = (status: RestoreStatus) => {
    const config: Record<RestoreStatus, { 
      bg: string; 
      text: string; 
      label: string; 
      icon: LucideIcon;
      animate?: boolean;
    }> = {
      PENDING: { 
        bg: 'bg-slate-100 dark:bg-slate-800', 
        text: 'text-slate-700 dark:text-slate-300',
        label: 'Pendiente', 
        icon: Clock 
      },
      VALIDATING: { 
        bg: 'bg-blue-100 dark:bg-blue-900/40', 
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Validando', 
        icon: FileText,
        animate: true
      },
      RESTORING_DB: { 
        bg: 'bg-blue-100 dark:bg-blue-900/40', 
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Restaurando BD', 
        icon: Database,
        animate: true
      },
      RESTORING_FILES: { 
        bg: 'bg-blue-100 dark:bg-blue-900/40', 
        text: 'text-blue-700 dark:text-blue-300',
        label: 'Restaurando', 
        icon: HardDrive,
        animate: true
      },
      COMPLETED: { 
        bg: 'bg-green-100 dark:bg-green-900/40', 
        text: 'text-green-700 dark:text-green-300',
        label: 'Completado', 
        icon: CheckCircle2 
      },
      FAILED: { 
        bg: 'bg-red-100 dark:bg-red-900/40', 
        text: 'text-red-700 dark:text-red-300',
        label: 'Fallido', 
        icon: AlertTriangle 
      }
    };

    const item = config[status] || config.PENDING;
    const Icon = item.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.bg} ${item.text}`}>
        <Icon className={`h-3.5 w-3.5 ${item.animate ? 'animate-pulse' : ''}`} aria-hidden="true" />
        {item.label}
      </span>
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const canManage = hasPermission('security', 'backup.manage');
  const canRestore = hasPermission('security', 'backup.restore');

  const handleRefresh = () => {
    refetchBackups();
    refetchRestores();
    refetchSummary();
  };

  return (
    <div className="space-y-6">
      {/* Header simplificado */}
      <div className="flex items-center justify-between" data-tour="copias-header">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Copias de Seguridad
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Gestiona respaldos y restauraciones del sistema
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            aria-label="Actualizar datos"
            title="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </Button>
          {canManage && (
            <Button onClick={() => setShowBackupDialog(true)} data-tour="copias-create-button">
              <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
              Nueva Copia
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards - 3 cards */}
      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-3" role="status" aria-label="Cargando resumen">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : summary ? (
        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: Ultima Copia */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Última Copia
              </CardTitle>
              <div className={`p-2 rounded-lg ${summary.lastBackup?.status === 'COMPLETED' 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : 'bg-gray-100 dark:bg-slate-800'}`}>
                <CheckCircle2 className={`h-4 w-4 ${summary.lastBackup?.status === 'COMPLETED'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-slate-500'}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {summary.lastBackup
                  ? formatDistanceToNow(new Date(summary.lastBackup.createdAt), {
                      addSuffix: true,
                      locale: es,
                    })
                  : 'Sin copias'}
              </div>
              {summary.lastBackup && (
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  por {summary.lastBackup.creator?.fullName || 'Sistema'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Datos Pendientes */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Pendiente de Respaldar
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                (summary.pendingDocuments || 0) > 0 
                  ? 'bg-amber-100 dark:bg-amber-900/30' 
                  : 'bg-gray-100 dark:bg-slate-800'}`}>
                <FileText className={`h-4 w-4 ${
                  (summary.pendingDocuments || 0) > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-gray-400 dark:text-slate-500'}`} aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(summary.pendingDocuments || 0) + (summary.pendingVersions || 0) + (summary.pendingSignatures || 0)} items
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                {summary.pendingDocuments || 0} docs, {summary.pendingVersions || 0} vers, {summary.pendingSignatures || 0} firmas
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Tamano Estimado */}
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">
                Tamaño Estimado
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatBytes(summary.totalPendingSize || 0)}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                Desde última copia exitosa
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs */}
      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList aria-label="Secciones de copias de seguridad">
          <TabsTrigger value="backups" aria-controls="panel-backups">
            <Archive className="h-4 w-4 mr-2" aria-hidden="true" />
            Copias ({total})
          </TabsTrigger>
          <TabsTrigger value="restores" aria-controls="panel-restores">
            <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
            Restauraciones ({restoresTotal})
          </TabsTrigger>
        </TabsList>

        {/* Tab: Copias */}
        <TabsContent value="backups" className="space-y-4" id="panel-backups">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700" data-tour="copias-schedule">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Historial de Copias</CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                Paquetes de respaldo generados y disponibles para descarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="flex items-center justify-center py-8" role="status" aria-label="Cargando copias de seguridad">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
                  <span className="sr-only">Cargando...</span>
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p>No hay copias de seguridad disponibles</p>
                  {canManage && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setShowBackupDialog(true)}
                    >
                      Crear primera copia
                    </Button>
                  )}
                </div>
              ) : (
                <div data-tour="copias-table">
                  <Table aria-label="Historial de copias de seguridad">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead scope="col" className="w-[140px]">Estado</TableHead>
                        <TableHead scope="col">Fecha</TableHead>
                        <TableHead scope="col" className="text-right">Contenido</TableHead>
                        <TableHead scope="col" className="text-right">Tamaño</TableHead>
                        <TableHead scope="col" className="text-right w-[100px]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id} className="group">
                          <TableCell>{getBackupStatusBadge(backup.status)}</TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(backup.createdAt).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-500 block">
                                {backup.creator?.fullName || 'Usuario'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {(backup.totalDocuments || 0) + (backup.totalVersions || 0) + (backup.totalSignatures || 0)} registros
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-500 block">
                                {backup.totalFiles || 0} archivos
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900 dark:text-white">
                            {formatBytes(backup.totalSize || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {backup.status === 'COMPLETED' && backup.packagePath && !backup.packagePath.startsWith('RECOVERED:') && (
                                <>
                                  {canManage && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handleDownloadBackup(
                                        backup.id,
                                        `backup-${new Date(backup.createdAt).toISOString().split('T')[0]}.zip`
                                      )}
                                      aria-label="Descargar backup"
                                      title="Descargar"
                                    >
                                      <Download className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  )}
                                  {canRestore && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedBackup(backup);
                                        setShowRestoreDialog(true);
                                      }}
                                      aria-label="Restaurar backup"
                                      title="Restaurar"
                                    >
                                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                                    </Button>
                                  )}
                                </>
                              )}
                              {backup.status === 'COMPLETED' && backup.packagePath?.startsWith('RECOVERED:') && (
                                <span className="text-xs text-gray-400 dark:text-slate-600 italic">
                                  Recuperado
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Paginacion mejorada */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        Mostrando {((page - 1) * 5) + 1} - {Math.min(page * 5, total)} de {total}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page - 1)}
                          disabled={page === 1}
                          className="h-8"
                          aria-label="Página anterior"
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={page === pageNum ? "default" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setPage(pageNum)}
                                aria-label={`Ir a página ${pageNum}`}
                                aria-current={page === pageNum ? "page" : undefined}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(page + 1)}
                          disabled={page === totalPages}
                          className="h-8"
                          aria-label="Página siguiente"
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Restauraciones */}
        <TabsContent value="restores" className="space-y-4" id="panel-restores">
          {/* Banner de restauracion de emergencia */}
          {canRestore && (
            <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                    <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      Restauración de Emergencia
                    </p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Sube un archivo ZIP si perdiste acceso a los backups del servidor
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                  onClick={() => setShowEmergencyRestoreDialog(true)}
                >
                  Subir Backup
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Historial de Restauraciones</CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                Procesos de restauración ejecutados y su resultado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restoresLoading ? (
                <div className="flex items-center justify-center py-8" role="status" aria-label="Cargando restauraciones">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
                  <span className="sr-only">Cargando...</span>
                </div>
              ) : restores.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                  <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-50" aria-hidden="true" />
                  <p>No hay restauraciones registradas</p>
                </div>
              ) : (
                <>
                  <Table aria-label="Historial de restauraciones">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead scope="col" className="w-[140px]">Estado</TableHead>
                        <TableHead scope="col">Fecha</TableHead>
                        <TableHead scope="col" className="text-right">Registros</TableHead>
                        <TableHead scope="col" className="text-right">Archivos</TableHead>
                        <TableHead scope="col" className="text-right">Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restores.map((restore) => (
                        <TableRow key={restore.id}>
                          <TableCell>{getRestoreStatusBadge(restore.status)}</TableCell>
                          <TableCell>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(restore.createdAt).toLocaleDateString('es-PE', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-slate-500 block">
                                {restore.creator?.fullName || 'Usuario'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {restore.restoredRecords || 0}
                            </span>
                            <span className="text-gray-500 dark:text-slate-500">/{restore.totalRecords || 0}</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {restore.restoredFiles || 0}
                            </span>
                            <span className="text-gray-500 dark:text-slate-500">/{restore.totalFiles || 0}</span>
                            {(restore.skippedFiles || 0) > 0 && (
                              <span className="text-xs text-gray-400 dark:text-slate-600 block">
                                {restore.skippedFiles} omitidos
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium text-gray-900 dark:text-white">
                            {formatDuration(restore.duration)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Paginacion */}
                  {restoresTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                      <p className="text-sm text-gray-500 dark:text-slate-500">
                        Mostrando {((restorePage - 1) * 5) + 1} - {Math.min(restorePage * 5, restoresTotal)} de {restoresTotal}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestorePage(restorePage - 1)}
                          disabled={restorePage === 1}
                          className="h-8"
                          aria-label="Página anterior"
                        >
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(restoresTotalPages, 5) }, (_, i) => {
                            const pageNum = i + 1;
                            return (
                              <Button
                                key={pageNum}
                                variant={restorePage === pageNum ? "default" : "ghost"}
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setRestorePage(pageNum)}
                                aria-label={`Ir a página ${pageNum}`}
                                aria-current={restorePage === pageNum ? "page" : undefined}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRestorePage(restorePage + 1)}
                          disabled={restorePage === restoresTotalPages}
                          className="h-8"
                          aria-label="Página siguiente"
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog: Crear Backup */}
      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Archive className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-center dark:text-white">
              Crear Nueva Copia de Seguridad
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Se respaldarán todos los cambios desde la última copia exitosa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {summary && ((summary.pendingDocuments || 0) + (summary.pendingVersions || 0) + (summary.pendingSignatures || 0) > 0) && (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Documentos</span>
                <span className="font-medium text-gray-900 dark:text-white">{summary.pendingDocuments || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Versiones</span>
                <span className="font-medium text-gray-900 dark:text-white">{summary.pendingVersions || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Firmas</span>
                <span className="font-medium text-gray-900 dark:text-white">{summary.pendingSignatures || 0}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-slate-400">Tamaño estimado</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatBytes(summary.totalPendingSize || 0)}</span>
                </div>
              </div>
            </div>
          )}
          
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel 
              className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" 
              disabled={isCreatingBackup}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCreateBackup} 
              disabled={isCreatingBackup}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isCreatingBackup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Creando...
                </>
              ) : (
                'Crear Copia'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Restaurar Backup */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="max-w-md dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <RotateCcw className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <AlertDialogTitle className="text-center dark:text-white">
              Restaurar Copia de Seguridad
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Esta acción restaurará datos del backup seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {selectedBackup && (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Fecha del backup</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedBackup.createdAt).toLocaleDateString('es-PE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Registros</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {(selectedBackup.totalDocuments || 0) + (selectedBackup.totalVersions || 0) + (selectedBackup.totalSignatures || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Archivos</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedBackup.totalFiles || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">Tamaño</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatBytes(selectedBackup.totalSize || 0)}</span>
              </div>
            </div>
          )}

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 flex gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Los datos existentes más recientes se mantendrán. Solo se agregarán datos faltantes.
            </p>
          </div>
          
          <AlertDialogFooter className="sm:justify-center gap-3">
            <AlertDialogCancel 
              className="flex-1 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" 
              disabled={isRestoringBackup}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRestoreBackup} 
              disabled={isRestoringBackup}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isRestoringBackup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Restaurando...
                </>
              ) : (
                'Restaurar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Restauracion de Emergencia */}
      <Dialog open={showEmergencyRestoreDialog} onOpenChange={setShowEmergencyRestoreDialog}>
        <DialogContent className="max-w-lg dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center dark:text-white">
              Restauración de Emergencia
            </DialogTitle>
            <p className="text-center text-sm text-gray-500 dark:text-slate-400">
              Sube un archivo ZIP de backup para restaurar datos perdidos
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
                ${selectedFile 
                  ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20' 
                  : 'border-gray-300 dark:border-slate-700 hover:border-gray-400 dark:hover:border-slate-600'}`}
            >
              <input
                type="file"
                accept=".zip,application/zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
                className="hidden"
                id="emergency-backup-file"
                aria-label="Seleccionar archivo de backup"
              />
              <label htmlFor="emergency-backup-file" className="cursor-pointer">
                {selectedFile ? (
                  <>
                    <CheckCircle2 className="h-10 w-10 mx-auto text-green-600 dark:text-green-400 mb-2" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <Package className="h-10 w-10 mx-auto text-gray-400 dark:text-slate-500 mb-2" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Haz clic para seleccionar un archivo ZIP
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Máximo 5GB
                    </p>
                  </>
                )}
              </label>
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">¿Tienes múltiples backups?</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Sube primero el más antiguo, espera que complete, luego sube el siguiente en orden cronológico.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setShowEmergencyRestoreDialog(false);
                setSelectedFile(null);
              }}
              disabled={isUploadingEmergency}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEmergencyRestore}
              disabled={!selectedFile || isUploadingEmergency}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isUploadingEmergency ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Restaurar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
