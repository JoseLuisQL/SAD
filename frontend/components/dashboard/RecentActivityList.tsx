'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentActivity } from '@/lib/api/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, 
  FolderOpen, 
  Archive, 
  User, 
  Settings, 
  FileSignature,
  LucideIcon
} from 'lucide-react';

interface RecentActivityListProps {
  activities: RecentActivity[];
}

const moduleIcons: Record<string, LucideIcon> = {
  Documents: FileText,
  Expedientes: FolderOpen,
  Archivadores: Archive,
  Users: User,
  Configuration: Settings,
  Signatures: FileSignature,
};

const actionLabels: Record<string, string> = {
  CREATE: 'creó',
  UPDATE: 'actualizó',
  DELETE: 'eliminó',
  SIGN: 'firmó',
  UPLOAD: 'subió',
  DOWNLOAD: 'descargó',
  REVERT_SIGNATURE: 'revirtió firma de',
  LOGIN: 'inició sesión',
  LOGOUT: 'cerró sesión',
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="bg-white dark:bg-slate-900">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No hay actividad reciente para mostrar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="bg-white dark:bg-slate-900">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent className="bg-white dark:bg-slate-900">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = moduleIcons[activity.module] || FileText;
            const actionLabel = actionLabels[activity.action] || activity.action.toLowerCase();
            const moduleLabel = activity.module.toLowerCase();
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg shrink-0">
                  <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <span className="font-semibold">{activity.user.fullName}</span>
                    {' '}{actionLabel}{' '}
                    <span className="font-medium">{moduleLabel}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(activity.timestamp), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
