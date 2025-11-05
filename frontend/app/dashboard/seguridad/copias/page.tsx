'use client';

import { useState, useEffect } from 'react';
import { useBackupSummary, useBackups } from '@/hooks/useBackups';
import { useRestore } from '@/hooks/useRestore';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  RotateCcw
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { BackupJob, RestoreLog, BackupStatus, RestoreStatus } from '@/types/backup.types';
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
  const [pollingBackup, setPollingBackup] = useState<string | null>(null);
  const [pollingRestore, setPollingRestore] = useState<string | null>(null);
  
  // Estado para restauración de emergencia
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

      // Construir URL base del backend
      const backendUrl = API_URL.replace('/api', ''); // Remover /api del final
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
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast.success('Backup descargado exitosamente');
    } catch (error: any) {
      console.error('Error downloading backup:', error);
      toast.error(error.message || 'Error al descargar el backup');
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
      
      // Recargar datos
      refetchBackups();
      refetchRestores();
      refetchSummary();

    } catch (error: any) {
      console.error('Error emergency restore:', error);
      toast.error(error.message || 'Error al restaurar desde archivo');
    } finally {
      setIsUploadingEmergency(false);
    }
  };

  // Auto-refresh for pending operations
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
      const backup = await createBackup();
      setPollingBackup(backup.id);
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
      const restore = await restoreBackup(selectedBackup.id);
      setPollingRestore(restore.id);
      setShowRestoreDialog(false);
      setSelectedBackup(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const getBackupStatusBadge = (status: BackupStatus) => {
    const variants: Record<BackupStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: any }> = {
      PENDING: { variant: 'secondary', label: 'Pendiente', icon: Clock },
      COLLECTING_DATA: { variant: 'default', label: 'Recopilando datos', icon: Database },
      PACKAGING: { variant: 'default', label: 'Empaquetando', icon: Package },
      COMPLETED: { variant: 'outline', label: 'Completado', icon: CheckCircle2 },
      FAILED: { variant: 'destructive', label: 'Fallido', icon: AlertTriangle }
    };

    const config = variants[status] || { variant: 'secondary' as const, label: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getRestoreStatusBadge = (status: RestoreStatus) => {
    const variants: Record<RestoreStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: any }> = {
      PENDING: { variant: 'secondary', label: 'Pendiente', icon: Clock },
      VALIDATING: { variant: 'default', label: 'Validando', icon: FileText },
      RESTORING_DB: { variant: 'default', label: 'Restaurando BD', icon: Database },
      RESTORING_FILES: { variant: 'default', label: 'Restaurando archivos', icon: HardDrive },
      COMPLETED: { variant: 'outline', label: 'Completado', icon: CheckCircle2 },
      FAILED: { variant: 'destructive', label: 'Fallido', icon: AlertTriangle }
    };

    const config = variants[status] || { variant: 'secondary' as const, label: status, icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Copias de Seguridad</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-2">
            Gestión de respaldos y restauración del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              refetchBackups();
              refetchRestores();
              refetchSummary();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          {canManage && (
            <Button onClick={() => setShowBackupDialog(true)}>
              <Archive className="h-4 w-4 mr-2" />
              Generar Copia
            </Button>
          )}
          {canRestore && (
            <Button
              variant="outline"
              onClick={() => setShowEmergencyRestoreDialog(true)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Restauración de Emergencia
            </Button>
          )}
        </div>
      </div>

      {/* Operational Recommendations */}
      <Alert className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-gray-900 dark:text-slate-200">
          <strong className="dark:text-white">Recomendaciones operativas:</strong> Verifique espacio suficiente en disco antes de generar copias.
          Mantenga una conexión estable durante la restauración. Revise los logs antes de cerrar sesión.
        </AlertDescription>
      </Alert>

      {/* Summary Cards */}
      {summaryLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Última Copia</CardTitle>
              <Clock className="h-4 w-4 text-gray-600 dark:text-slate-400" />
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
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  por {summary.lastBackup.creator?.fullName || 'Usuario'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Datos Pendientes</CardTitle>
              <FileText className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {(summary.pendingDocuments || 0) + (summary.pendingVersions || 0) + (summary.pendingSignatures || 0)}
              </div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                {summary.pendingDocuments || 0} docs, {summary.pendingVersions || 0} versiones, {summary.pendingSignatures || 0} firmas
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Tamaño Pendiente</CardTitle>
              <HardDrive className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatBytes(summary.totalPendingSize || 0)}</div>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                Desde última copia exitosa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white">Ruta Recomendada</CardTitle>
              <Download className="h-4 w-4 text-gray-600 dark:text-slate-400" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-mono bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-200 p-2 rounded">
                {summary.recommendedPath || 'C:\\SAD\\backups'}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Tabs for Backups and Restores */}
      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">
            <Archive className="h-4 w-4 mr-2" />
            Copias ({total})
          </TabsTrigger>
          <TabsTrigger value="restores">
            <RotateCcw className="h-4 w-4 mr-2" />
            Restauraciones ({restoresTotal})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backups" className="space-y-4">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Historial de Copias de Seguridad</CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                Paquetes de respaldo generados y disponibles para descarga
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backupsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : backups.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                  No hay copias de seguridad disponibles
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Archivos</TableHead>
                        <TableHead className="text-right">Tamaño</TableHead>
                        <TableHead className="text-right">Duración</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell>{getBackupStatusBadge(backup.status)}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(backup.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell>{backup.creator?.fullName || 'Usuario'}</TableCell>
                          <TableCell className="text-right">
                            {(backup.totalDocuments || 0) + (backup.totalVersions || 0) + (backup.totalSignatures || 0)}
                          </TableCell>
                          <TableCell className="text-right">{backup.totalFiles || 0}</TableCell>
                          <TableCell className="text-right">{formatBytes(backup.totalSize || 0)}</TableCell>
                          <TableCell className="text-right">{formatDuration(backup.duration)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {backup.status === 'COMPLETED' && backup.packagePath && (
                                <>
                                  {canManage && (
                                    <>
                                      {backup.packagePath.startsWith('RECOVERED:') ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled
                                          title="Backup recuperado - archivo no disponible en servidor"
                                        >
                                          <Download className="h-3 w-3 opacity-50" />
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownloadBackup(
                                            backup.id,
                                            `backup-${new Date(backup.createdAt).toISOString().split('T')[0]}.zip`
                                          )}
                                          title="Descargar backup"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                  {canRestore && (
                                    <>
                                      {backup.packagePath.startsWith('RECOVERED:') ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          disabled
                                          title="Backup recuperado - no se puede restaurar nuevamente desde servidor"
                                        >
                                          <RotateCcw className="h-3 w-3 opacity-50" />
                                        </Button>
                                      ) : (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedBackup(backup);
                                            setShowRestoreDialog(true);
                                          }}
                                          title="Restaurar este backup"
                                        >
                                          <RotateCcw className="h-3 w-3" />
                                        </Button>
                                      )}
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        Página {page} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        disabled={page === totalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restores" className="space-y-4">
          <Card className="bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Historial de Restauraciones</CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-400">
                Procesos de restauración ejecutados y su resultado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {restoresLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : restores.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-slate-400">
                  No hay restauraciones registradas
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Estado</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Usuario</TableHead>
                        <TableHead className="text-right">Registros</TableHead>
                        <TableHead className="text-right">Archivos</TableHead>
                        <TableHead className="text-right">Omitidos</TableHead>
                        <TableHead className="text-right">Duración</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restores.map((restore) => (
                        <TableRow key={restore.id}>
                          <TableCell>{getRestoreStatusBadge(restore.status)}</TableCell>
                          <TableCell>
                            {formatDistanceToNow(new Date(restore.createdAt), {
                              addSuffix: true,
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell>{restore.creator?.fullName || 'Usuario'}</TableCell>
                          <TableCell className="text-right">
                            {restore.restoredRecords || 0}/{restore.totalRecords || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            {restore.restoredFiles || 0}/{restore.totalFiles || 0}
                          </TableCell>
                          <TableCell className="text-right">{restore.skippedFiles || 0}</TableCell>
                          <TableCell className="text-right">{formatDuration(restore.duration)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {restoresTotalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestorePage(restorePage - 1)}
                        disabled={restorePage === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        Página {restorePage} de {restoresTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRestorePage(restorePage + 1)}
                        disabled={restorePage === restoresTotalPages}
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <AlertDialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Generar Copia de Seguridad</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Se creará una copia incremental con todos los cambios desde la última copia exitosa.
            </p>
            
            {summary && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">Datos a respaldar:</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• {summary.pendingDocuments || 0} documentos nuevos</li>
                  <li>• {summary.pendingVersions || 0} versiones actualizadas</li>
                  <li>• {summary.pendingSignatures || 0} firmas digitales</li>
                  <li>• Tamaño estimado: {formatBytes(summary.totalPendingSize || 0)}</li>
                </ul>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Este proceso puede tardar varios minutos dependiendo del volumen de datos.
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" disabled={isCreatingBackup}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateBackup} disabled={isCreatingBackup}>
              {isCreatingBackup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Generar Copia
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Backup Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="dark:text-white">Restaurar Copia de Seguridad</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Esta acción restaurará el sistema al estado capturado en la copia seleccionada.
            </p>
            
            {selectedBackup && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">Detalles de la copia:</p>
                <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                  <li>• Fecha: {new Date(selectedBackup.createdAt).toLocaleString('es-PE')}</li>
                  <li>• Registros: {(selectedBackup.totalDocuments || 0) + (selectedBackup.totalVersions || 0) + (selectedBackup.totalSignatures || 0)}</li>
                  <li>• Archivos: {selectedBackup.totalFiles || 0}</li>
                  <li>• Tamaño: {formatBytes(selectedBackup.totalSize || 0)}</li>
                </ul>
              </div>
            )}

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200 font-medium mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Advertencias importantes:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>✓ Verificar espacio suficiente en disco</li>
                <li>✓ Mantener conexión estable durante el proceso</li>
                <li>✓ Los datos duplicados serán omitidos automáticamente</li>
                <li>✓ El proceso puede tardar varios minutos</li>
              </ul>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700" disabled={isRestoringBackup}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreBackup} disabled={isRestoringBackup}>
              {isRestoringBackup ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🚨 Dialog de Restauración de Emergencia */}
      <Dialog open={showEmergencyRestoreDialog} onOpenChange={setShowEmergencyRestoreDialog}>
        <DialogContent className="max-w-2xl dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Restauración de Emergencia
            </DialogTitle>
            <div className="text-gray-600 dark:text-slate-400 text-sm text-left space-y-2">
              <p>Sube un archivo ZIP de backup descargado previamente para restaurarlo.</p>
              <p className="text-xs">
                Usa esta función cuando todo se haya perdido en el servidor pero tengas copias locales.
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-6 text-center">
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
              />
              <label htmlFor="emergency-backup-file" className="cursor-pointer">
                <Package className="h-12 w-12 mx-auto text-gray-600 dark:text-slate-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo ZIP'}
                </p>
                {selectedFile && (
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
                {!selectedFile && (
                  <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                    Máximo 5GB
                  </p>
                )}
              </label>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                📘 ¿Cómo restaurar múltiples backups?
              </p>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Ordena tus archivos ZIP por fecha (más antiguo primero)</li>
                <li>Sube el backup MÁS ANTIGUO primero</li>
                <li>Espera que complete</li>
                <li>Luego sube el siguiente backup en orden cronológico</li>
                <li>Repite hasta el más reciente</li>
              </ol>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                ⚠️ El sistema reconcilia por timestamps: registros más nuevos prevalecen.
              </p>
            </div>

            {/* Advertencias */}
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                <AlertTriangle className="h-4 w-4 inline mr-1" />
                Advertencias críticas:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                <li>✓ Verifica tener espacio suficiente en disco</li>
                <li>✓ El proceso puede tardar varios minutos para archivos grandes</li>
                <li>✓ No cierres el navegador hasta que complete</li>
                <li>✓ Los archivos duplicados (por hash) serán omitidos</li>
                <li>✓ Se crearán registros automáticamente si faltan referencias</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmergencyRestoreDialog(false);
                setSelectedFile(null);
              }}
              disabled={isUploadingEmergency}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEmergencyRestore}
              disabled={!selectedFile || isUploadingEmergency}
            >
              {isUploadingEmergency ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restaurar Ahora
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
