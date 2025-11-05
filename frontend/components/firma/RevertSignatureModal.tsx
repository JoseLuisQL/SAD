'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CheckCircle2, XCircle, User, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import api from '@/lib/api';

interface Signature {
  id: string;
  timestamp: string;
  status: string;
  signer: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
  };
}

interface Version {
  id: string;
  versionNumber: number;
  createdAt: string;
  hasSignatures: boolean;
  activeSignaturesCount: number;
}

interface RevertSignatureModalProps {
  open: boolean;
  onClose: () => void;
  documentId: string;
  documentNumber: string;
  signatures: Signature[];
  onSuccess?: () => void;
}

export function RevertSignatureModal({
  open,
  onClose,
  documentId,
  documentNumber,
  signatures,
  onSuccess
}: RevertSignatureModalProps) {
  const [reason, setReason] = useState('');
  const [revertType, setRevertType] = useState<'signatures-only' | 'to-version'>('signatures-only');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [notifySigners, setNotifySigners] = useState(true);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);

  useEffect(() => {
    if (open) {
      fetchUnsignedVersions();
    }
  }, [open, documentId]);

  const fetchUnsignedVersions = async () => {
    try {
      const response = await api.get(`/documents/${documentId}/versions`);
      const unsignedVersions = response.data.data.filter(
        (v: Version) => v.activeSignaturesCount === 0
      );
      setVersions(unsignedVersions);
    } catch (error: unknown) {
      console.error('Error al cargar versiones:', error);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('La razón de la reversión es obligatoria');
      return;
    }

    if (revertType === 'to-version' && !selectedVersion) {
      toast.error('Debe seleccionar una versión para restaurar');
      return;
    }

    if (!confirmChecked) {
      toast.error('Debe confirmar que entiende las implicaciones');
      return;
    }

    try {
      setLoading(true);

      if (revertType === 'signatures-only') {
        await api.post(`/firma/revert/${documentId}`, {
          reason,
          notifySigners
        });
      } else {
        await api.post(`/firma/revert/${documentId}/version/${selectedVersion}`, {
          reason
        });
      }

      toast.success('Firmas revertidas correctamente');

      setReason('');
      setConfirmChecked(false);
      setSelectedVersion('');
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || 'Error al revertir firmas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Revertir Firmas del Documento
          </DialogTitle>
          <DialogDescription>
            Documento: <span className="font-semibold">{documentNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Advertencia:</strong> Esta acción marcará todas las firmas como revertidas.
              Esta acción no se puede deshacer automáticamente.
            </AlertDescription>
          </Alert>

          <div>
            <Label className="text-base font-semibold mb-3 block">
              Firmas que serán revertidas ({signatures.length}):
            </Label>
            <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3 bg-muted/30">
              {signatures.map((sig) => (
                <div key={sig.id} className="flex items-center justify-between p-2 bg-background rounded border">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {sig.signer.firstName} {sig.signer.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{sig.signer.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{sig.status}</Badge>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(sig.timestamp), 'PPp', { locale: es })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Tipo de Reversión:</Label>
            
            <div className="space-y-3">
              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  revertType === 'signatures-only'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setRevertType('signatures-only')}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={revertType === 'signatures-only'}
                    onChange={() => setRevertType('signatures-only')}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium">Revertir solo las firmas</p>
                    <p className="text-sm text-muted-foreground">
                      Mantiene la versión actual del documento pero marca todas las firmas como revertidas.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  revertType === 'to-version'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setRevertType('to-version')}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    checked={revertType === 'to-version'}
                    onChange={() => setRevertType('to-version')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">Revertir a versión específica sin firma</p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Restaura el documento a una versión anterior sin firmas.
                    </p>
                    {revertType === 'to-version' && (
                      <Select value={selectedVersion} onValueChange={setSelectedVersion}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione una versión sin firmas" />
                        </SelectTrigger>
                        <SelectContent>
                          {versions.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No hay versiones sin firmas disponibles
                            </SelectItem>
                          ) : (
                            versions.map((v) => (
                              <SelectItem key={v.id} value={v.id}>
                                Versión {v.versionNumber} - {format(new Date(v.createdAt), 'PPp', { locale: es })}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="text-base font-semibold">
              Razón de la Reversión <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explique por qué está revirtiendo las firmas de este documento..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Esta razón quedará registrada en el historial de auditoría.
            </p>
          </div>

          {revertType === 'signatures-only' && (
            <div className="flex items-start gap-2">
              <Checkbox
                id="notifySigners"
                checked={notifySigners}
                onCheckedChange={(checked) => setNotifySigners(checked as boolean)}
              />
              <div>
                <Label htmlFor="notifySigners" className="font-medium cursor-pointer">
                  Notificar a los firmantes
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se enviará una notificación a todos los usuarios cuyas firmas serán revertidas.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <Checkbox
              id="confirm"
              checked={confirmChecked}
              onCheckedChange={(checked) => setConfirmChecked(checked as boolean)}
            />
            <Label htmlFor="confirm" className="font-medium cursor-pointer text-amber-900">
              Entiendo las implicaciones de revertir las firmas y confirmo que deseo proceder
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading || !confirmChecked || !reason.trim()}
          >
            {loading ? 'Revirtiendo...' : 'Confirmar Reversión'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
