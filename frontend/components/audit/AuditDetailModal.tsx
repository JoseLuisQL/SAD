'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLog, AuditLogDetail } from '@/types/audit.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAudit } from '@/hooks/useAudit';

interface AuditDetailModalProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

const getActionColor = (action: string) => {
  if (action.includes('CREATED')) return 'bg-green-100 text-green-800';
  if (action.includes('UPDATED')) return 'bg-blue-100 text-blue-800';
  if (action.includes('DELETED')) return 'bg-red-100 text-red-800';
  if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800';
  if (action.includes('LOGOUT')) return 'bg-gray-100 text-gray-800';
  return 'bg-gray-100 text-gray-800';
};

export function AuditDetailModal({ log, open, onClose }: AuditDetailModalProps) {
  const { fetchLogById, loading } = useAudit();
  const [detailedLog, setDetailedLog] = useState<AuditLogDetail | null>(null);

  useEffect(() => {
    if (open && log?.id) {
      fetchLogById(log.id).then((data) => {
        if (data) {
          setDetailedLog(data);
        }
      });
    }
  }, [open, log, fetchLogById]);

  const renderValue = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 dark:text-slate-500">Sin valor</span>;
    }
    if (typeof value === 'object') {
      return (
        <pre className="bg-gray-50 dark:bg-slate-800 p-3 rounded text-xs overflow-auto max-h-64 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return <span className="text-gray-900 dark:text-white">{String(value)}</span>;
  };

  const renderDiff = () => {
    if (!detailedLog?.oldValue && !detailedLog?.newValue) {
      return null;
    }

    const oldValue = typeof detailedLog.oldValue === 'string' 
      ? JSON.parse(detailedLog.oldValue)
      : detailedLog.oldValue;
    
    const newValue = typeof detailedLog.newValue === 'string'
      ? JSON.parse(detailedLog.newValue)
      : detailedLog.newValue;

    return (
      <div className="space-y-4">
        {oldValue && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-2">Valores Anteriores:</h4>
            {renderValue(oldValue)}
          </div>
        )}
        {newValue && (
          <div>
            <h4 className="font-medium text-sm text-gray-700 dark:text-slate-300 mb-2">Valores Nuevos:</h4>
            {renderValue(newValue)}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Detalle de Auditoría</DialogTitle>
        </DialogHeader>

        {loading || !detailedLog ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Fecha y Hora</h4>
                <p className="text-sm text-gray-900 dark:text-white">
                  {format(new Date(detailedLog.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Acción</h4>
                <Badge className={getActionColor(detailedLog.action)} variant="outline">
                  {detailedLog.action}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Usuario</h4>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{detailedLog.user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {detailedLog.user.firstName} {detailedLog.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{detailedLog.user.email}</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Módulo</h4>
                <Badge variant="secondary">{detailedLog.module}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Tipo de Entidad</h4>
                <p className="text-sm text-gray-900 dark:text-white">{detailedLog.entityType}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">ID de Entidad</h4>
                <p className="text-sm font-mono text-xs break-all text-gray-900 dark:text-white">{detailedLog.entityId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Dirección IP</h4>
                <p className="text-sm text-gray-900 dark:text-white">{detailedLog.ipAddress}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">User Agent</h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 break-all">{detailedLog.userAgent}</p>
              </div>
            </div>

            {(detailedLog.oldValue || detailedLog.newValue) && (
              <div className="border-t dark:border-slate-700 pt-4">
                <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Cambios Realizados</h3>
                {renderDiff()}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
