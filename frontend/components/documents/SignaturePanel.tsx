'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SignatureStatusBadge } from './SignatureStatusBadge';
import { useSignatureStatus } from '@/hooks/useSignatureStatus';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Shield,
  Clock,
  User,
  CheckCircle,
  XCircle,
  ArrowRight,
  FileCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignaturePanelProps {
  documentId: string;
  onDownloadSigned?: () => void;
  onValidateExternal?: () => void;
  onRevert?: () => void;
  canRevert?: boolean;
}

export function SignaturePanel({
  documentId,
  onDownloadSigned,
  onValidateExternal,
  onRevert,
  canRevert = false
}: SignaturePanelProps) {
  const [expanded, setExpanded] = useState(false);
  const { status, loading, refetch } = useSignatureStatus(documentId);

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Estado de Firma Digital</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Header Summary */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <SignatureStatusBadge
              status={status.status}
              totalSignatures={status.totalSignatures}
              lastSignedBy={status.lastSignedBy}
              lastSignedAt={status.lastSignedAt}
              size="lg"
            />
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <FileCheck className="h-4 w-4" />
                {status.activeSignatures} firmas activas
              </span>
              {status.revertedSignatures > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="h-4 w-4" />
                  {status.revertedSignatures} revertidas
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {status.status === 'SIGNED' && onDownloadSigned && (
              <Button variant="outline" size="sm" onClick={onDownloadSigned}>
                <Download className="h-4 w-4 mr-2" />
                Descargar
              </Button>
            )}
            {onValidateExternal && (
              <Button variant="outline" size="sm" onClick={onValidateExternal}>
                <Shield className="h-4 w-4 mr-2" />
                Validar
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Active Flows */}
            {status.hasActiveFlows && status.activeFlows.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Flujos de Firma Activos
                </h4>
                {status.activeFlows.map(flow => (
                  <Card key={flow.id} className="bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{flow.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Paso {flow.currentStep + 1} de {flow.totalSteps}
                          </p>
                          {flow.nextSigner && (
                            <p className="text-sm text-blue-600 mt-1">
                              Siguiente: {flow.nextSigner}
                            </p>
                          )}
                        </div>
                        <Badge variant={flow.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
                          {flow.status}
                        </Badge>
                      </div>
                      {/* Progress Bar */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${((flow.currentStep + 1) / flow.totalSteps) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Signatures List */}
            {status.signersInfo.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Historial de Firmas ({status.signersInfo.length})
                </h4>
                <div className="space-y-2">
                  {status.signersInfo.map((signer, index) => (
                    <div
                      key={`${signer.id}-${index}`}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border',
                        signer.isReverted ? 'bg-red-50 border-red-200' : 'bg-white'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(signer.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{signer.name}</p>
                          <p className="text-xs text-muted-foreground">{signer.email}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(signer.signedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {signer.isReverted ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Revertida
                          </Badge>
                        ) : (
                          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Válida
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {canRevert && onRevert && status.activeSignatures > 0 && (
                <Button variant="destructive" size="sm" onClick={onRevert}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Revertir Firmas
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={refetch}>
                Actualizar Estado
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
