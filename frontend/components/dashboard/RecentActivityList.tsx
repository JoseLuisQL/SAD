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
  Clock,
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
  CREATE: 'creo',
  UPDATE: 'actualizo',
  DELETE: 'elimino',
  SIGN: 'firmo',
  UPLOAD: 'subio',
  DOWNLOAD: 'descargo',
  REVERT_SIGNATURE: 'revirtio firma de',
  LOGIN: 'inicio sesion',
  LOGOUT: 'cerro sesion',
};

export function RecentActivityList({ activities }: RecentActivityListProps) {
  if (activities.length === 0) {
    return (
      <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
              <Clock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No hay actividad reciente para mostrar
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = moduleIcons[activity.module] || FileText;
            const actionLabel = actionLabels[activity.action] || activity.action.toLowerCase();
            const moduleLabel = activity.module.toLowerCase();
            
            return (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className="p-1.5 bg-blue-50 dark:bg-blue-950/50 rounded-lg shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                  <Icon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    <span className="font-semibold text-slate-900 dark:text-white">{activity.user.fullName}</span>
                    {' '}{actionLabel}{' '}
                    <span className="font-medium">{moduleLabel}</span>
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
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
