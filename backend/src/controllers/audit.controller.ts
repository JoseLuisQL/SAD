import { Request, Response } from 'express';
import * as auditService from '../services/audit.service';
import { uuidSchema } from '../utils/validators';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, userId, action, module, dateFrom, dateTo } = req.query;

    const filters = {
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
      userId: userId as string,
      action: action as string,
      module: module as string,
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined
    };

    const result = await auditService.getAuditLogs(filters);

    res.status(200).json({
      status: 'success',
      message: 'Logs de auditoría obtenidos correctamente',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener logs de auditoría'
    });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const log = await auditService.getAuditLogById(id);

    res.status(200).json({
      status: 'success',
      message: 'Log de auditoría obtenido correctamente',
      data: log
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Log de auditoría no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener log de auditoría'
    });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await auditService.getAuditStats();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas de auditoría obtenidas correctamente',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas de auditoría'
    });
  }
};

// ==================== ANALYTICS AVANZADOS ====================

export const getAdvancedAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo } = req.query;

    const params = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined
    };

    const analytics = await auditService.getAdvancedAnalytics(params);

    res.status(200).json({
      status: 'success',
      message: 'Analytics avanzados obtenidos correctamente',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener analytics avanzados'
    });
  }
};

export const getAnomalies = async (req: Request, res: Response): Promise<void> => {
  try {
    const { offHoursStart, offHoursEnd, maxFailedLogins, maxDeletionsPerHour } = req.query;

    const thresholds = {
      offHoursStart: offHoursStart ? parseInt(offHoursStart as string) : undefined,
      offHoursEnd: offHoursEnd ? parseInt(offHoursEnd as string) : undefined,
      maxFailedLogins: maxFailedLogins ? parseInt(maxFailedLogins as string) : undefined,
      maxDeletionsPerHour: maxDeletionsPerHour ? parseInt(maxDeletionsPerHour as string) : undefined
    };

    const anomalies = await auditService.detectAnomalies(thresholds);

    res.status(200).json({
      status: 'success',
      message: 'Anomalías detectadas correctamente',
      data: anomalies
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al detectar anomalías'
    });
  }
};

export const getUserPattern = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { dateFrom, dateTo } = req.query;

    const { error } = uuidSchema.validate(id);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const params = {
      dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
      dateTo: dateTo ? new Date(dateTo as string) : undefined
    };

    const pattern = await auditService.getUserActivityPattern(id, params);

    res.status(200).json({
      status: 'success',
      message: 'Patrón de actividad obtenido correctamente',
      data: pattern
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener patrón de actividad'
    });
  }
};

// ==================== SEGURIDAD ====================

export const getSecurityAlerts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = await auditService.getSecurityAlerts();

    res.status(200).json({
      status: 'success',
      message: 'Alertas de seguridad obtenidas correctamente',
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener alertas de seguridad'
    });
  }
};

// ==================== REPORTES PERSONALIZADOS ====================

export const generateCustomReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dateFrom, dateTo, userIds, modules, actions, groupBy, metrics } = req.body;

    const filters = {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      userIds,
      modules,
      actions,
      groupBy,
      metrics
    };

    const report = await auditService.generateCustomReport(filters);

    res.status(200).json({
      status: 'success',
      message: 'Reporte personalizado generado correctamente',
      data: report
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al generar reporte personalizado'
    });
  }
};
