'use client';

import { FileCheck, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'SIGNATURE' | 'FLOW_COMPLETED' | 'REVERSION';
  description: string;
  userName: string;
  documentId?: string;
  timestamp: Date;
}

interface ActivityTimelineProps {
  dateFrom: Date;
  dateTo: Date;
}

export default function ActivityTimeline({ dateFrom, dateTo }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [dateFrom, dateTo]);

  const loadActivities = async () => {
    try {
      setLoading(true);

      const [signaturesRes] = await Promise.all([
        api.get(`/firma/analytics/by-period`, {
          params: { period: 'day', dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() }
        }),
      ]);

      const allActivities: Activity[] = [];

      if (signaturesRes.data && Array.isArray(signaturesRes.data)) {
        signaturesRes.data.forEach((item: { date: string; count: number }) => {
          allActivities.push({
            id: `sig-${item.date}`,
            type: 'SIGNATURE',
            description: `${item.count} firmas realizadas`,
            userName: 'Sistema',
            timestamp: new Date(item.date),
          });
        });
      }

      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      // Mostrar solo 5 elementos - ISO 25010: Estetica de interfaz (minimalismo)
      setActivities(allActivities.slice(0, 5));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    const iconClasses = {
      SIGNATURE: 'bg-blue-50 dark:bg-blue-500/10',
      FLOW_COMPLETED: 'bg-green-50 dark:bg-green-500/10',
      REVERSION: 'bg-red-50 dark:bg-red-500/10',
    };

    const icons = {
      SIGNATURE: <FileCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      FLOW_COMPLETED: <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />,
      REVERSION: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />,
    };

    return (
      <div 
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          iconClasses[type] || 'bg-gray-100 dark:bg-slate-800'
        )}
        aria-hidden="true"
      >
        {icons[type] || <Clock className="w-4 h-4 text-gray-600 dark:text-slate-400" />}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 text-gray-400 dark:text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando actividad...</span>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h3>
        <div className="h-[180px] flex flex-col items-center justify-center text-center">
          <Clock className="w-10 h-10 text-gray-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Sin actividad en este periodo
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Selecciona un rango de fechas con actividad
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Actividad Reciente
        </h3>
        <span className="text-xs text-gray-400 dark:text-slate-500">
          Ultimos {activities.length} eventos
        </span>
      </div>

      {/* Timeline compacto */}
      <div className="space-y-0" role="list" aria-label="Linea de tiempo de actividad">
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-center gap-3 py-2.5",
              index !== activities.length - 1 && "border-b border-gray-50 dark:border-slate-800"
            )}
            role="listitem"
          >
            {/* Icono segun tipo */}
            {getIcon(activity.type)}

            {/* Descripcion */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white truncate">
                {activity.description}
              </p>
            </div>

            {/* Tiempo relativo */}
            <time 
              className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0 tabular-nums"
              dateTime={activity.timestamp.toISOString()}
            >
              {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
            </time>
          </div>
        ))}
      </div>
    </div>
  );
}
