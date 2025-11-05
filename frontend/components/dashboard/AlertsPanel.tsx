'use client';

import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardAlert } from '@/lib/api/dashboard';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: DashboardAlert[];
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badge: 'destructive' as const,
    label: 'Alta',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badge: 'secondary' as const,
    label: 'Media',
  },
  low: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badge: 'default' as const,
    label: 'Baja',
  },
};

const alertLinks: Record<string, string> = {
  OCR_PENDING: '/dashboard/archivo/documentos',
  ARCHIVADOR_FULL: '/dashboard/archivo/archivadores',
  SIGNATURE_EXPIRED: '/dashboard/firma',
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="bg-white dark:bg-slate-900">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950 rounded-full mb-3">
              <Info className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              No hay alertas pendientes
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              El sistema está funcionando correctamente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="bg-white dark:bg-slate-900">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Alertas del Sistema</span>
          <Badge variant="secondary" className="ml-2">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white dark:bg-slate-900">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const href = alertLinks[alert.type];

            const content = (
              <div
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                  config.bgColor,
                  config.borderColor,
                  href && 'cursor-pointer hover:shadow-sm'
                )}
              >
                <div className={cn('p-1.5 rounded-full bg-white dark:bg-slate-800', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {alert.title}
                    </p>
                    <Badge variant={config.badge} className="shrink-0 text-xs">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {alert.description}
                  </p>
                </div>
              </div>
            );

            if (href) {
              return (
                <Link key={alert.id} href={href}>
                  {content}
                </Link>
              );
            }

            return <div key={alert.id}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
