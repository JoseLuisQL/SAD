import { Request, Response } from 'express';
import * as notificationsService from '../services/notifications.service';

export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const filters = {
      isRead: req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined,
      type: req.query.type as string | undefined,
      priority: req.query.priority as string | undefined,
      dateFrom: req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    };

    const result = await notificationsService.getUserNotifications(userId, filters);

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const count = await notificationsService.getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error al obtener contador de no leídas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener contador de no leídas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const notification = await notificationsService.markAsRead(id, userId);

    return res.status(200).json({
      success: true,
      message: 'Notificación marcada como leída',
      data: notification
    });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar notificación como leída',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const result = await notificationsService.markAllAsRead(userId);

    return res.status(200).json({
      success: true,
      message: 'Todas las notificaciones marcadas como leídas',
      data: result
    });
  } catch (error) {
    console.error('Error al marcar todas como leídas:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al marcar todas como leídas',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const result = await notificationsService.deleteNotification(id, userId);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar notificación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export default {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
