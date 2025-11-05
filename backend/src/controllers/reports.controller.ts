import { Request, Response } from 'express';
import * as reportsService from '../services/reports.service';
import * as auditService from '../services/audit.service';

export const getDocumentReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodId, officeId, documentTypeId, dateFrom, dateTo } = req.query;

    const filters = {
      periodId: periodId as string,
      officeId: officeId as string,
      documentTypeId: documentTypeId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateDocumentReport(filters);

    await auditService.log({
      userId: req.user!.id,
      action: 'REPORT_GENERATED' as any,
      module: 'REPORTS',
      entityType: 'DOCUMENT_REPORT',
      entityId: 'document-report',
      newValue: filters,
      req
    });

    res.status(200).json({
      status: 'success',
      message: 'Reporte de documentos generado correctamente',
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al generar reporte de documentos'
    });
  }
};

export const getUserActivityReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, action, dateFrom, dateTo } = req.query;

    const filters = {
      userId: userId as string,
      action: action as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateUserActivityReport(filters);

    await auditService.log({
      userId: req.user!.id,
      action: 'REPORT_GENERATED' as any,
      module: 'REPORTS',
      entityType: 'USER_ACTIVITY_REPORT',
      entityId: 'user-activity-report',
      newValue: filters,
      req
    });

    res.status(200).json({
      status: 'success',
      message: 'Reporte de actividad de usuarios generado correctamente',
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al generar reporte de actividad de usuarios'
    });
  }
};

export const getSignatureReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signerId, status, dateFrom, dateTo } = req.query;

    const filters = {
      signerId: signerId as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateSignatureReport(filters);

    await auditService.log({
      userId: req.user!.id,
      action: 'REPORT_GENERATED' as any,
      module: 'REPORTS',
      entityType: 'SIGNATURE_REPORT',
      entityId: 'signature-report',
      newValue: filters,
      req
    });

    res.status(200).json({
      status: 'success',
      message: 'Reporte de firmas generado correctamente',
      data: reportData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al generar reporte de firmas'
    });
  }
};

export const exportDocumentReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { periodId, officeId, documentTypeId, dateFrom, dateTo, format } = req.query;

    if (!format || !['pdf', 'xlsx', 'csv'].includes(format as string)) {
      res.status(400).json({
        status: 'error',
        message: 'Formato de exportación inválido. Debe ser: pdf, xlsx o csv'
      });
      return;
    }

    const filters = {
      periodId: periodId as string,
      officeId: officeId as string,
      documentTypeId: documentTypeId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateDocumentReport(filters);
    const buffer = await reportsService.exportReport(
      reportData,
      format as 'pdf' | 'xlsx' | 'csv',
      'Reporte de Documentos',
      req.user!.id
    );

    const fileName = `reporte-documentos-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeTypes = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[format as keyof typeof mimeTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar reporte de documentos'
    });
  }
};

export const exportUserActivityReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, action, dateFrom, dateTo, format } = req.query;

    if (!format || !['pdf', 'xlsx', 'csv'].includes(format as string)) {
      res.status(400).json({
        status: 'error',
        message: 'Formato de exportación inválido. Debe ser: pdf, xlsx o csv'
      });
      return;
    }

    const filters = {
      userId: userId as string,
      action: action as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateUserActivityReport(filters);
    const buffer = await reportsService.exportReport(
      reportData,
      format as 'pdf' | 'xlsx' | 'csv',
      'Reporte de Actividad de Usuarios',
      req.user!.id
    );

    const fileName = `reporte-actividad-usuarios-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeTypes = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[format as keyof typeof mimeTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar reporte de actividad de usuarios'
    });
  }
};

export const exportSignatureReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signerId, status, dateFrom, dateTo, format } = req.query;

    if (!format || !['pdf', 'xlsx', 'csv'].includes(format as string)) {
      res.status(400).json({
        status: 'error',
        message: 'Formato de exportación inválido. Debe ser: pdf, xlsx o csv'
      });
      return;
    }

    const filters = {
      signerId: signerId as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const reportData = await reportsService.generateSignatureReport(filters);
    const buffer = await reportsService.exportReport(
      reportData,
      format as 'pdf' | 'xlsx' | 'csv',
      'Reporte de Firmas',
      req.user!.id
    );

    const fileName = `reporte-firmas-${new Date().toISOString().split('T')[0]}.${format}`;
    const mimeTypes = {
      pdf: 'application/pdf',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv'
    };

    res.setHeader('Content-Type', mimeTypes[format as keyof typeof mimeTypes]);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al exportar reporte de firmas'
    });
  }
};
