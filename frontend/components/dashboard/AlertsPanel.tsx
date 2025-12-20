'use client';

import Link from 'next/link';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
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
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800/50',
    badge: 'destructive' as const,
    label: 'Alta',
  },
  medium: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/50',
    badge: 'secondary' as const,
    label: 'Media',
  },
  low: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/50',
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
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Alertas del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 rounded-full mb-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              No hay alertas pendientes
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              El sistema esta funcionando correctamente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Alertas del Sistema</span>
          <Badge variant="secondary" className="ml-2 text-xs">
            {alerts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => {
            const config = severityConfig[alert.severity];
            const Icon = config.icon;
            const href = alertLinks[alert.type];

            const content = (
              <div
                role={href ? 'link' : undefined}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all duration-200',
                  config.bgColor,
                  config.borderColor,
                  href && 'cursor-pointer hover:shadow-sm hover:scale-[1.01]'
                )}
              >
                <div className={cn('p-1.5 rounded-full bg-white dark:bg-slate-800', config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {alert.title}
                    </p>
                    <Badge variant={config.badge} className="shrink-0 text-[10px] px-1.5 py-0">
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
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
