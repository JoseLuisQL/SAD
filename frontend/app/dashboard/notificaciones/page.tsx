'use client';

import { useState, useEffect } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface NotificationFilters {
  page: number;
  limit: number;
  type?: string;
  priority?: string;
  isRead?: boolean;
}
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Filter,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NOTIFICATION_TYPE_LABELS = {
  SIGNATURE_PENDING: 'Firma Pendiente',
  SIGNATURE_COMPLETED: 'Firma Completada',
  FLOW_STARTED: 'Flujo Iniciado',
  FLOW_COMPLETED: 'Flujo Completado',
  SIGNATURE_REVERTED: 'Firma Revertida',
  CERTIFICATE_EXPIRING: 'Certificado Expirando'
};

const NOTIFICATION_TYPE_ICONS = {
  SIGNATURE_PENDING: '📝',
  SIGNATURE_COMPLETED: '✅',
  FLOW_STARTED: '🔄',
  FLOW_COMPLETED: '🎉',
  SIGNATURE_REVERTED: '⚠️',
  CERTIFICATE_EXPIRING: '⏰'
};

const PRIORITY_COLORS = {
  URGENT: 'destructive',
  HIGH: 'orange',
  NORMAL: 'default',
  LOW: 'secondary'
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    loading,
    total,
    page,
    totalPages,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const filters: NotificationFilters = { page: currentPage, limit: 20 };
    
    if (typeFilter && typeFilter !== 'all') filters.type = typeFilter;
    if (priorityFilter && priorityFilter !== 'all') filters.priority = priorityFilter;
    if (showOnlyUnread) filters.isRead = false;

    fetchNotifications(filters);
  }, [currentPage, typeFilter, priorityFilter, showOnlyUnread, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Todas las notificaciones marcadas como leídas');
    fetchNotifications({ page: currentPage, limit: 20 });
  };

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    toast.success('Notificación eliminada');
    fetchNotifications({ page: currentPage, limit: 20 });
  };

  const getNotificationIcon = (type: string) => {
    return NOTIFICATION_TYPE_ICONS[type as keyof typeof NOTIFICATION_TYPE_ICONS] || '📬';
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'default';
  };

  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      Hoy: [],
      Ayer: [],
      'Esta semana': [],
      'Este mes': [],
      Anteriores: []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    notifications.forEach((notification) => {
      const date = new Date(notification.createdAt);
      
      if (date >= today) {
        groups.Hoy.push(notification);
      } else if (date >= yesterday) {
        groups.Ayer.push(notification);
      } else if (date >= thisWeek) {
        groups['Esta semana'].push(notification);
      } else if (date >= thisMonth) {
        groups['Este mes'].push(notification);
      } else {
        groups.Anteriores.push(notification);
      }
    });

    return Object.entries(groups).filter(([_, notifs]) => notifs.length > 0);
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Notificaciones
            </h1>
            <p className="text-muted-foreground mt-1">
              {total} notificaciones totales • {unreadCount} sin leer
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                <SelectItem value="URGENT">Urgente</SelectItem>
                <SelectItem value="HIGH">Alta</SelectItem>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="LOW">Baja</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showOnlyUnread ? 'default' : 'outline'}
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
            >
              Solo no leídas
            </Button>

            {(typeFilter !== 'all' || priorityFilter !== 'all' || showOnlyUnread) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setTypeFilter('all');
                  setPriorityFilter('all');
                  setShowOnlyUnread(false);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Cargando notificaciones...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground">
              {showOnlyUnread || typeFilter !== 'all' || priorityFilter !== 'all'
                ? 'No hay notificaciones que coincidan con los filtros seleccionados'
                : 'No tienes notificaciones en este momento'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map(([groupName, groupNotifications]) => (
            <div key={groupName}>
              <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
                {groupName}
              </h2>
              <div className="space-y-3">
                {groupNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`p-4 transition-all hover:shadow-md ${
                      !notification.isRead ? 'border-l-4 border-l-primary bg-blue-50 dark:bg-blue-950' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-semibold'}`}>
                                {notification.title}
                              </h3>
                              <Badge variant={getPriorityColor(notification.priority) as "default" | "secondary" | "destructive" | "outline"}>
                                {notification.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {notification.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                              locale: es
                            })}
                          </span>

                          <div className="flex items-center gap-2">
                            {notification.actionUrl && (
                              <Link href={notification.actionUrl}>
                                <Button size="sm" variant="outline">
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  {notification.actionLabel || 'Ver'}
                                </Button>
                              </Link>
                            )}

                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                Marcar leída
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Anterior
              </Button>
              
              <span className="text-sm text-muted-foreground px-4">
                Página {currentPage} de {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
