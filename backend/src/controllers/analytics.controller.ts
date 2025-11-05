import { Request, Response } from 'express';
import * as analyticsService from '../services/analytics.service';

export const getGlobalOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const overview = await analyticsService.getGlobalOverview();

    res.status(200).json({
      status: 'success',
      message: 'Resumen global obtenido correctamente',
      data: overview
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener resumen global'
    });
  }
};

export const getDocumentMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    let period = undefined;
    if (startDate && endDate) {
      period = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string)
      };
    }

    const metrics = await analyticsService.getDocumentMetrics(period);

    res.status(200).json({
      status: 'success',
      message: 'Métricas de documentos obtenidas correctamente',
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener métricas de documentos'
    });
  }
};

export const getArchivadorMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const metrics = await analyticsService.getArchivadorMetrics(id);

    res.status(200).json({
      status: 'success',
      message: 'Métricas del archivador obtenidas correctamente',
      data: metrics
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Archivador no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener métricas del archivador'
    });
  }
};

export const getExpedienteMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const metrics = await analyticsService.getExpedienteMetrics(id);

    res.status(200).json({
      status: 'success',
      message: 'Métricas del expediente obtenidas correctamente',
      data: metrics
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Expediente no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener métricas del expediente'
    });
  }
};

export const getDashboardSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { range, officeId } = req.query;
    const user = req.user;

    if (!user) {
      console.warn('Dashboard access attempt without authentication');
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    if (!user.id || !user.roleName || !user.permissions) {
      console.error('Invalid user object in request:', { userId: user.id, roleName: user.roleName });
      res.status(401).json({
        status: 'error',
        message: 'Datos de usuario incompletos. Por favor, inicie sesión nuevamente.'
      });
      return;
    }

    if (range && !['7d', '30d', '90d'].includes(range as string)) {
      res.status(400).json({
        status: 'error',
        message: 'El parámetro range debe ser 7d, 30d o 90d'
      });
      return;
    }

    console.log(`Dashboard snapshot requested by user ${user.username} (${user.roleName})`);

    const snapshot = await analyticsService.getDashboardSnapshot(
      user.id,
      user.roleName,
      user.permissions,
      {
        range: range as '7d' | '30d' | '90d' | undefined,
        officeId: officeId as string | undefined
      }
    );

    await import('../services/audit.service').then(audit => {
      audit.log({
        userId: user.id,
        action: 'DASHBOARD_VIEW',
        module: 'Analytics',
        entityType: 'Dashboard',
        entityId: 'snapshot',
        newValue: {
          range: range || '90d',
          officeId: officeId || null,
          source: 'web'
        },
        req
      });
    }).catch(auditError => {
      console.error('Failed to log dashboard view audit:', auditError);
      // Don't fail the request if audit fails
    });

    res.status(200).json({
      status: 'success',
      message: 'Snapshot del dashboard obtenido correctamente',
      data: snapshot
    });
  } catch (error) {
    console.error('Error al obtener snapshot del dashboard:', {
      error,
      userId: req.user?.id,
      roleName: req.user?.roleName,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener snapshot del dashboard'
    });
  }
};

export default {
  getGlobalOverview,
  getDocumentMetrics,
  getArchivadorMetrics,
  getExpedienteMetrics,
  getDashboardSnapshot
};
