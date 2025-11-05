'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  FileText,
  FilePlus,
  FileMinus,
  Edit,
  FolderPlus,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpedienteActivity } from '@/hooks/useExpedienteActivity';
import { ExpedienteActivity } from '@/types/expediente.types';
import { useState } from 'react';

interface ExpedienteTimelineProps {
  expedienteId: string;
}

const getActivityIcon = (action: string) => {
  if (action === 'EXPEDIENTE_CREATED') return FolderPlus;
  if (action === 'EXPEDIENTE_UPDATED') return Edit;
  if (action === 'DOCUMENTS_ADDED_TO_EXPEDIENTE') return FilePlus;
  if (action === 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE') return FileMinus;
  return FileText;
};

const getActivityColor = (action: string) => {
  if (action === 'EXPEDIENTE_CREATED') return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
  if (action === 'EXPEDIENTE_UPDATED') return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
  if (action === 'DOCUMENTS_ADDED_TO_EXPEDIENTE') return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
  if (action === 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE') return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
  return 'text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800';
};

const getActivityLabel = (action: string) => {
  const labels: Record<string, string> = {
    EXPEDIENTE_CREATED: 'Expediente creado',
    EXPEDIENTE_UPDATED: 'Expediente actualizado',
    DOCUMENTS_ADDED_TO_EXPEDIENTE: 'Documentos agregados',
    DOCUMENTS_REMOVED_FROM_EXPEDIENTE: 'Documentos removidos',
  };
  return labels[action] || action;
};

const ActivityItem = ({ activity }: { activity: ExpedienteActivity }) => {
  const Icon = getActivityIcon(activity.action);
  const colorClass = getActivityColor(activity.action);

  return (
    <div className="relative pl-8 pb-8 group">
      <div className="absolute left-0 top-0 flex items-center justify-center">
        <div className={`p-2 rounded-full ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {/* Vertical line */}
      <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200 dark:bg-slate-700 group-last:hidden"></div>

      <div className="ml-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {getActivityLabel(activity.action)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-3 w-3 text-gray-400 dark:text-slate-500" />
              <p className="text-sm text-gray-600 dark:text-slate-400">
                {activity.user.firstName} {activity.user.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
            <Clock className="h-3 w-3" />
            {format(new Date(activity.timestamp), "dd MMM yyyy, HH:mm", { locale: es })}
          </div>
        </div>

        {activity.details && (
          <Card className="p-3 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 mt-2">
            {activity.action === 'DOCUMENTS_ADDED_TO_EXPEDIENTE' && activity.details.documents && (
              <div>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">
                  Se agregaron {activity.details.count} documento(s):
                </p>
                <div className="space-y-1">
                  {activity.details.documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-gray-400 dark:text-slate-500" />
                      <span className="text-xs text-gray-700 dark:text-slate-300">
                        {doc.documentNumber}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {doc.documentType.name}
                      </Badge>
                    </div>
                  ))}
                  {activity.details.documents.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      +{activity.details.documents.length - 3} más
                    </p>
                  )}
                </div>
              </div>
            )}

            {activity.action === 'DOCUMENTS_REMOVED_FROM_EXPEDIENTE' && activity.details.count && (
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Se removieron {activity.details.count} documento(s) del expediente
              </p>
            )}

            {activity.action === 'EXPEDIENTE_UPDATED' && activity.details.changes && (
              <div className="space-y-2 text-sm">
                {activity.details.changes.old?.name !== activity.details.changes.new?.name && (
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 font-medium">Nombre:</p>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 line-through">
                        {activity.details.changes.old?.name}
                      </span>
                      <span className="dark:text-slate-300">→</span>
                      <span className="text-green-600 dark:text-green-400">
                        {activity.details.changes.new?.name}
                      </span>
                    </div>
                  </div>
                )}
                {activity.details.changes.old?.description !== activity.details.changes.new?.description && (
                  <div>
                    <p className="text-gray-600 dark:text-slate-400 font-medium">Descripción actualizada</p>
                  </div>
                )}
              </div>
            )}

            {activity.action === 'EXPEDIENTE_CREATED' && activity.details.expedienteData && (
              <div className="text-sm text-gray-600 dark:text-slate-400">
                <p>
                  <span className="font-medium">Código:</span>{' '}
                  {activity.details.expedienteData.code}
                </p>
                <p>
                  <span className="font-medium">Nombre:</span>{' '}
                  {activity.details.expedienteData.name}
                </p>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export function ExpedienteTimeline({ expedienteId }: ExpedienteTimelineProps) {
  const [page, setPage] = useState(1);
  const { activities, pagination, loading } = useExpedienteActivity({
    expedienteId,
    page,
    limit: 10,
  });

  if (loading && page === 1) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <Card className="p-12 text-center bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700">
        <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay actividad registrada
        </h3>
        <p className="text-gray-500 dark:text-slate-400">
          Aún no se han registrado eventos en este expediente.
        </p>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Mostrando {(page - 1) * pagination.limit + 1} -{' '}
            {Math.min(page * pagination.limit, pagination.total)} de {pagination.total} eventos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
