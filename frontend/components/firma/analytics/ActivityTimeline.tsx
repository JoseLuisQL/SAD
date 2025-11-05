'use client';

import { FileCheck, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

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

      const [signaturesRes, flowsRes, reversionsRes] = await Promise.all([
        api.get(`/firma/analytics/by-period`, {
          params: { period: 'day', dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() }
        }),
        api.get(`/firma/analytics/flows`, {
          params: { dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() }
        }),
        api.get(`/firma/analytics/reversions`, {
          params: { dateFrom: dateFrom.toISOString(), dateTo: dateTo.toISOString() }
        }),
      ]);

      const allActivities: Activity[] = [];

      if (signaturesRes.data && Array.isArray(signaturesRes.data)) {
        signaturesRes.data.forEach((item: any) => {
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
      setActivities(allActivities.slice(0, 10));
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'SIGNATURE':
        return <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'FLOW_COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'REVERSION':
        return <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600 dark:text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-4 animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400">No hay actividad reciente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Actividad Reciente</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400">Últimos eventos de firma digital</p>
      </div>

      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, idx) => (
            <li key={activity.id}>
              <div className="relative pb-8">
                {idx !== activities.length - 1 && (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-slate-700"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                      {getIcon(activity.type)}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">{activity.userName}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600 dark:text-slate-400">{activity.description}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-slate-500">
                      <time dateTime={activity.timestamp.toISOString()}>
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: es })}
                      </time>
                      {' • '}
                      {format(activity.timestamp, "dd MMM yyyy, HH:mm", { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
