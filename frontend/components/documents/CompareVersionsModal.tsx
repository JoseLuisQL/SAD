'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  GitCompare, 
  Download, 
  User, 
  Clock, 
  FileText, 
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Version {
  id: string;
  versionNumber: number;
  fileName: string;
  changeDescription: string;
  createdAt: string;
  fileSize: number;
  creator: {
    firstName: string;
    lastName: string;
    username: string;
  };
  signatures: Array<{
    id: string;
    status: string;
    timestamp: string;
    signer: {
      firstName: string;
      lastName: string;
    };
  }>;
}

interface ComparisonData {
  version1: Version;
  version2: Version;
  differences: {
    versionNumber: number;
    sizeChange: number;
    timeElapsed: number;
    signaturesAdded: number;
    creatorChanged: boolean;
  };
}

interface CompareVersionsModalProps {
  open: boolean;
  onClose: () => void;
  versionId1: string;
  versionId2: string;
  onRestoreVersion?: (versionId: string) => void;
  isAdmin?: boolean;
}

export function CompareVersionsModal({
  open,
  onClose,
  versionId1,
  versionId2,
  onRestoreVersion,
  isAdmin = false
}: CompareVersionsModalProps) {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && versionId1 && versionId2) {
      fetchComparison();
    }
  }, [open, versionId1, versionId2]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/documents/versions/compare?v1=${versionId1}&v2=${versionId2}`
      );
      setComparison(response.data.data);
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al comparar versiones');
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

      // Safely append, click, and remove
      if (document.body) {
        document.body.appendChild(link);
        link.click();

        // Use setTimeout to ensure click completes before removal
        setTimeout(() => {
          try {
            if (link.parentNode && document.contains(link)) {
              link.parentNode.removeChild(link);
            }
            window.URL.revokeObjectURL(url);
          } catch (cleanupError) {
            console.debug('Download cleanup skipped:', cleanupError);
          }
        }, 100);
      }

      toast.success('Versión descargada correctamente');
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al descargar versión');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} día(s)`;
    if (hours > 0) return `${hours} hora(s)`;
    if (minutes > 0) return `${minutes} minuto(s)`;
    return `${seconds} segundo(s)`;
  };

  const renderVersionCard = (version: Version, title: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleDownload(version.id, version.fileName)}
          >
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Número de Versión</p>
          <p className="font-semibold text-2xl">v{version.versionNumber}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">Descripción</p>
          <p className="text-sm">{version.changeDescription}</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Creado por:</span>
            <span className="font-medium">
              {version.creator.firstName} {version.creator.lastName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Fecha:</span>
            <span className="font-medium">
              {format(new Date(version.createdAt), 'PPp', { locale: es })}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Tamaño:</span>
            <span className="font-medium">{formatFileSize(version.fileSize)}</span>
          </div>
        </div>

        {version.signatures && version.signatures.length > 0 && (
          <>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Firmas ({version.signatures.length}):
              </p>
              <div className="space-y-1">
                {version.signatures.map((sig) => (
                  <div key={sig.id} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                    <span>{sig.signer.firstName} {sig.signer.lastName}</span>
                    <Badge variant="secondary" className="text-xs">
                      {sig.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isAdmin && onRestoreVersion && version.signatures.length === 0 && (
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onRestoreVersion(version.id)}
          >
            Restaurar Esta Versión
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="h-5 w-5" />
              Comparación de Versiones
            </DialogTitle>
            <DialogDescription>
              Cargando comparación...
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">Cargando comparación...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!comparison) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Comparación de Versiones
          </DialogTitle>
          <DialogDescription>
            Comparando versión {comparison.version1.versionNumber} con versión {comparison.version2.versionNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-base">Diferencias Principales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Versiones de Diferencia</p>
                  <p className="text-2xl font-bold text-primary">
                    {Math.abs(comparison.differences.versionNumber)}
                  </p>
                </div>

                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Cambio de Tamaño</p>
                  <div className="flex items-center justify-center gap-1">
                    {comparison.differences.sizeChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : comparison.differences.sizeChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : null}
                    <p className={`text-2xl font-bold ${
                      comparison.differences.sizeChange > 0 ? 'text-green-500' :
                      comparison.differences.sizeChange < 0 ? 'text-red-500' :
                      'text-muted-foreground'
                    }`}>
                      {comparison.differences.sizeChange > 0 ? '+' : ''}
                      {formatFileSize(Math.abs(comparison.differences.sizeChange))}
                    </p>
                  </div>
                </div>

                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Tiempo Transcurrido</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {formatDuration(comparison.differences.timeElapsed)}
                  </p>
                </div>

                <div className="text-center p-3 bg-background rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Firmas Agregadas</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {comparison.differences.signaturesAdded > 0 ? '+' : ''}
                    {comparison.differences.signaturesAdded}
                  </p>
                </div>
              </div>

              {comparison.differences.creatorChanged && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-900">
                  <ArrowRight className="h-4 w-4" />
                  <span>El creador cambió entre estas versiones</span>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {renderVersionCard(comparison.version1, `Versión ${comparison.version1.versionNumber}`)}
            {renderVersionCard(comparison.version2, `Versión ${comparison.version2.versionNumber}`)}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
