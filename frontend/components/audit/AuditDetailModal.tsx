'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLog, AuditLogDetail } from '@/types/audit.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAudit } from '@/hooks/useAudit';
import { 
  Shield, 
  User, 
  Clock, 
  Globe, 
  Monitor, 
  Database,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

interface AuditDetailModalProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

const getActionConfig = (action: string) => {
  if (action.includes('CREATED')) return { 
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'Creación'
  };
  if (action.includes('UPDATED')) return { 
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    borderColor: 'border-blue-200 dark:border-blue-800',
    label: 'Actualización'
  };
  if (action.includes('DELETED')) return { 
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Eliminación'
  };
  if (action.includes('LOGIN')) return { 
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    borderColor: 'border-purple-200 dark:border-purple-800',
    label: 'Acceso'
  };
  if (action.includes('LOGOUT')) return { 
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    borderColor: 'border-gray-200 dark:border-slate-600',
    label: 'Salida'
  };
  return { 
    color: 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300',
    borderColor: 'border-gray-200 dark:border-slate-600',
    label: 'Acción'
  };
};

export function AuditDetailModal({ log, open, onClose }: AuditDetailModalProps) {
  const { fetchLogById, loading } = useAudit();
  const [detailedLog, setDetailedLog] = useState<AuditLogDetail | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (open && log?.id) {
      fetchLogById(log.id).then((data) => {
        if (data) {
          setDetailedLog(data);
        }
      });
    } else {
      setDetailedLog(null);
    }
  }, [open, log, fetchLogById]);

  const handleCopyId = async () => {
    if (detailedLog?.entityId) {
      await navigator.clipboard.writeText(detailedLog.entityId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const renderJsonValue = (value: unknown, label: string) => {
    if (value === null || value === undefined) {
      return null;
    }
    
    let parsed = value;
    if (typeof value === 'string') {
      try {
        parsed = JSON.parse(value);
      } catch {
        parsed = value;
      }
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300">{label}</h4>
        <pre className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg text-xs overflow-auto max-h-48 text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-mono">
          {typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : String(parsed)}
        </pre>
      </div>
    );
  };

  const actionConfig = detailedLog ? getActionConfig(detailedLog.action) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 dark:text-white">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <span>Detalle de Auditoría</span>
          </DialogTitle>
        </DialogHeader>

        {loading || !detailedLog ? (
          <div className="space-y-4 py-4" role="status" aria-label="Cargando detalle">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 dark:bg-slate-800" />
              <Skeleton className="h-20 dark:bg-slate-800" />
            </div>
            <Skeleton className="h-32 dark:bg-slate-800" />
            <Skeleton className="h-32 dark:bg-slate-800" />
            <span className="sr-only">Cargando...</span>
          </div>
        ) : (
          <div className="space-y-5 py-2">
            {/* Header con acción y fecha */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge 
                  className={`${actionConfig?.color} border ${actionConfig?.borderColor} text-sm font-medium px-3 py-1`}
                  variant="outline"
                >
                  {detailedLog.action}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {format(new Date(detailedLog.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {format(new Date(detailedLog.createdAt), "HH:mm:ss", { locale: es })}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Usuario */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  <User className="h-3.5 w-3.5" aria-hidden="true" />
                  Usuario
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{detailedLog.user.username}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    {detailedLog.user.firstName} {detailedLog.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">{detailedLog.user.email}</p>
                </div>
              </div>

              {/* Módulo */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  <Database className="h-3.5 w-3.5" aria-hidden="true" />
                  Módulo / Entidad
                </div>
                <div>
                  <Badge variant="secondary" className="mb-1">{detailedLog.module}</Badge>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{detailedLog.entityType}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <code className="text-xs font-mono text-gray-500 dark:text-slate-500 truncate max-w-[150px]">
                      {detailedLog.entityId}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={handleCopyId}
                      aria-label="Copiar ID"
                    >
                      {copiedId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* IP */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                  Dirección IP
                </div>
                <p className="font-mono text-gray-900 dark:text-white">{detailedLog.ipAddress}</p>
              </div>

              {/* Timestamp */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  Marca de Tiempo
                </div>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {new Date(detailedLog.createdAt).toISOString()}
                </p>
              </div>
            </div>

            {/* User Agent */}
            {detailedLog.userAgent && (
              <div className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">
                  <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                  Agente de Usuario
                </div>
                <p className="text-xs text-gray-600 dark:text-slate-400 break-all font-mono">
                  {detailedLog.userAgent}
                </p>
              </div>
            )}

            {/* Cambios */}
            {(detailedLog.oldValue || detailedLog.newValue) && (
              <div className="border-t border-gray-200 dark:border-slate-700 pt-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  Cambios Realizados
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {detailedLog.oldValue && renderJsonValue(detailedLog.oldValue, 'Valores Anteriores')}
                  {detailedLog.newValue && renderJsonValue(detailedLog.newValue, 'Valores Nuevos')}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button 
            onClick={onClose}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
