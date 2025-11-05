'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Clock, 
  Download, 
  User, 
  FileText, 
  GitBranch, 
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Version {
  id: string;
  versionNumber: number;
  fileName: string;
  changeDescription: string;
  createdAt: string;
  fileSize: number;
  hasSignatures: boolean;
  activeSignaturesCount: number;
  revertedSignaturesCount: number;
  isCurrent: boolean;
  creator: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  signatures?: Array<{
    id: string;
    isReverted: boolean;
    timestamp: string;
    status: string;
    signer: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface VersionHistoryProps {
  documentId: string;
  onRestoreVersion?: () => void;
  onCompareVersions?: (v1Id: string, v2Id: string) => void;
  isAdmin?: boolean;
}

export function VersionHistory({ 
  documentId, 
  onRestoreVersion, 
  onCompareVersions,
  isAdmin = false 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'signed' | 'unsigned' | 'reverted'>('all');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/documents/${documentId}/versions`);
      setVersions(response.data.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al cargar versiones');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (versionId: string, fileName: string) => {
    try {
      const response = await api.get(`/versions/${versionId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Versión descargada correctamente');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al descargar versión');
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!confirm(`¿Está seguro que desea restaurar la versión ${versionNumber}?`)) {
      return;
    }

    try {
      await api.post(`/documents/${documentId}/versions/${versionId}/restore`);
      
      toast.success('Versión restaurada correctamente');

      fetchVersions();
      onRestoreVersion?.();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al restaurar versión');
    }
  };

  const handleCompareSelection = (versionId: string) => {
    if (selectedForCompare.includes(versionId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== versionId));
    } else if (selectedForCompare.length < 2) {
      setSelectedForCompare([...selectedForCompare, versionId]);
    } else {
      setSelectedForCompare([selectedForCompare[1], versionId]);
    }
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      onCompareVersions?.(selectedForCompare[0], selectedForCompare[1]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadge = (version: Version) => {
    if (version.isCurrent && version.activeSignaturesCount > 0) {
      return <Badge className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">Actual - Firmado</Badge>;
    }
    if (version.isCurrent) {
      return <Badge className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white">Actual</Badge>;
    }
    if (version.activeSignaturesCount > 0) {
      return <Badge className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white">Firmado</Badge>;
    }
    if (version.revertedSignaturesCount > 0 && version.activeSignaturesCount === 0) {
      return <Badge className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white">Firma Revertida</Badge>;
    }
    return <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600">Sin Firmar</Badge>;
  };

  const getStatusIcon = (version: Version) => {
    if (version.isCurrent && version.activeSignaturesCount > 0) {
      return <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />;
    }
    if (version.isCurrent) {
      return <CheckCircle2 className="h-6 w-6 text-blue-600 dark:text-blue-500" />;
    }
    if (version.activeSignaturesCount > 0) {
      return <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-500" />;
    }
    if (version.revertedSignaturesCount > 0 && version.activeSignaturesCount === 0) {
      return <XCircle className="h-6 w-6 text-red-600 dark:text-red-500" />;
    }
    return <AlertCircle className="h-6 w-6 text-slate-400 dark:text-slate-500" />;
  };

  const filteredVersions = versions.filter(v => {
    if (filter === 'all') return true;
    if (filter === 'signed') return v.activeSignaturesCount > 0;
    if (filter === 'unsigned') return v.activeSignaturesCount === 0 && v.revertedSignaturesCount === 0;
    if (filter === 'reverted') return v.revertedSignaturesCount > 0;
    return true;
  });

  if (loading) {
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 dark:border-blue-400 mb-3"></div>
          <p className="text-center text-slate-600 dark:text-slate-400 font-medium">Cargando historial...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
              <GitBranch className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              Historial de Versiones
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600' : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
              >
                Todas <span className="ml-1 font-semibold">({versions.length})</span>
              </Button>
              <Button
                variant={filter === 'signed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('signed')}
                className={filter === 'signed' ? 'bg-green-600 hover:bg-green-700' : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
              >
                Firmadas <span className="ml-1 font-semibold">({versions.filter(v => v.activeSignaturesCount > 0).length})</span>
              </Button>
              <Button
                variant={filter === 'unsigned' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('unsigned')}
                className={filter === 'unsigned' ? 'bg-slate-600 hover:bg-slate-700' : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
              >
                Sin Firmar <span className="ml-1 font-semibold">({versions.filter(v => v.activeSignaturesCount === 0 && v.revertedSignaturesCount === 0).length})</span>
              </Button>
              <Button
                variant={filter === 'reverted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('reverted')}
                className={filter === 'reverted' ? 'bg-red-600 hover:bg-red-700' : 'text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'}
              >
                Revertidas <span className="ml-1 font-semibold">({versions.filter(v => v.revertedSignaturesCount > 0).length})</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedForCompare.length === 2 && (
        <Card className="bg-blue-50 dark:bg-blue-950/50 border-2 border-blue-300 dark:border-blue-800 shadow-sm">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                {selectedForCompare.length} versiones seleccionadas para comparar
              </span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={handleCompare}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Comparar Versiones
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setSelectedForCompare([])}
                  className="text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredVersions.map((version) => (
          <Card 
            key={version.id} 
            className={`bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 transition-all hover:shadow-md ${
              selectedForCompare.includes(version.id) ? 'border-blue-500 dark:border-blue-400 border-2 shadow-md' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(version)}
                </div>

                <div className="flex-1 min-w-0 space-y-4">
                  {/* Header con título y badges */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Versión {version.versionNumber}
                        </h3>
                        {getStatusBadge(version)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">
                        {version.changeDescription}
                      </p>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(version.id, version.fileName)}
                        className="whitespace-nowrap"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Descargar</span>
                      </Button>
                      {isAdmin && !version.isCurrent && version.activeSignaturesCount === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestore(version.id, version.versionNumber)}
                          className="whitespace-nowrap"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Restaurar</span>
                        </Button>
                      )}
                      {onCompareVersions && (
                        <Button
                          size="sm"
                          variant={selectedForCompare.includes(version.id) ? 'default' : 'outline'}
                          onClick={() => handleCompareSelection(version.id)}
                          className="whitespace-nowrap"
                        >
                          Comparar
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Información de la versión */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <User className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{version.creator.firstName} {version.creator.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Clock className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">{format(new Date(version.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <FileText className="h-4 w-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span>{formatFileSize(version.fileSize)}</span>
                    </div>
                  </div>

                  {/* Información de firmas si existen */}
                  {version.hasSignatures && (version.activeSignaturesCount > 0 || version.revertedSignaturesCount > 0) && (
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Firmas: {version.activeSignaturesCount} activa(s)
                          {version.revertedSignaturesCount > 0 && ` • ${version.revertedSignaturesCount} revertida(s)`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Detalle de firmas */}
                  {version.signatures && version.signatures.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Detalle de Firmas:</p>
                      <div className="space-y-2">
                        {version.signatures.map((sig) => (
                          <div 
                            key={sig.id} 
                            className={`flex items-center gap-3 p-2 rounded-md ${
                              sig.isReverted ? 'bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800' : 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'
                            }`}
                          >
                            {sig.isReverted ? (
                              <XCircle className="h-4 w-4 text-red-600 dark:text-red-500 flex-shrink-0" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                            )}
                            <span className={`text-sm flex-1 ${sig.isReverted ? 'text-red-700 dark:text-red-400 line-through' : 'text-green-900 dark:text-green-300'}`}>
                              {sig.signer.firstName} {sig.signer.lastName}
                            </span>
                            <Badge 
                              variant={sig.isReverted ? 'destructive' : 'secondary'} 
                              className={`text-xs ${sig.isReverted ? 'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-400' : 'bg-green-100 dark:bg-green-950/50 text-green-800 dark:text-green-400'}`}
                            >
                              {sig.isReverted ? 'Revertida' : 'Completada'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredVersions.length === 0 && (
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-center text-slate-600 dark:text-slate-400 font-medium">
                No hay versiones que coincidan con el filtro seleccionado
              </p>
              <p className="text-center text-slate-500 dark:text-slate-500 text-sm mt-1">
                Pruebe con otro filtro o revise el documento
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
