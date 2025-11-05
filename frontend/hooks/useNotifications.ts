'use client';

import { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { STORAGE_KEYS } from '@/lib/constants';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  priority: string;
  actionUrl?: string;
  actionLabel?: string;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

interface GetNotificationsFilters {
  isRead?: boolean;
  type?: string;
  priority?: string;
  dateFrom?: string;
  page?: number;
  limit?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const fetchNotifications = useCallback(async (filters: GetNotificationsFilters = {}) => {
    try {
      setLoading(true);
      
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        setNotifications([]);
        setTotal(0);
        setTotalPages(0);
        return;
      }
      
      const queryParams = new URLSearchParams();
      
      if (filters.isRead !== undefined) {
        queryParams.append('isRead', String(filters.isRead));
      }
      if (filters.type) {
        queryParams.append('type', filters.type);
      }
      if (filters.priority) {
        queryParams.append('priority', filters.priority);
      }
      if (filters.dateFrom) {
        queryParams.append('dateFrom', filters.dateFrom);
      }
      if (filters.page) {
        queryParams.append('page', String(filters.page));
      }
      if (filters.limit) {
        queryParams.append('limit', String(filters.limit));
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications?${queryParams.toString()}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        // Si es 401, el usuario no está autenticado
        if (response.status === 401) {
          setNotifications([]);
          setTotal(0);
          setTotalPages(0);
          return;
        }
        throw new Error('Error al obtener notificaciones');
      }

      const data: NotificationsResponse = await response.json();
      
      setNotifications(data.data.notifications);
      setTotal(data.data.total);
      setPage(data.data.page);
      setTotalPages(data.data.totalPages);
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) {
        setUnreadCount(0);
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/unread-count`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        // Si es 401, el usuario no está autenticado, no mostrar error
        if (response.status === 401) {
          setUnreadCount(0);
          return;
        }
        throw new Error('Error al obtener contador de no leídas');
      }

      const data: UnreadCountResponse = await response.json();
      setUnreadCount(data.data.count);
    } catch (error) {
      // Error silencioso para evitar spam en consola durante polling
      setUnreadCount(0);
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar notificación como leída');
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas');
      }

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const token = Cookies.get(STORAGE_KEYS.ACCESS_TOKEN);
      
      if (!token) return;
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar notificación');
      }

      const notification = notifications.find((n) => n.id === id);
      
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  }, [notifications]);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    total,
    page,
    totalPages,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
}
