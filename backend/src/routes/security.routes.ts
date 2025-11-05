import { Router, Request, Response } from 'express';
import * as securityBackupService from '../services/security-backup.service';
import * as emergencyRestoreService from '../services/emergency-restore.service';
import * as auditService from '../services/audit.service';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const router = Router();

// Configurar multer para restauración de emergencia
const emergencyRestoreUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = path.join(__dirname, '../../temp/emergency-restore');
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      cb(null, `emergency-${timestamp}-${file.originalname}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024 // 5GB máximo
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed' || path.extname(file.originalname).toLowerCase() === '.zip') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos ZIP'));
    }
  }
});

router.post(
  '/backups',
  authenticate,
  requirePermission('security', 'backup.manage'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const backupJob = await securityBackupService.createBackup(req);

      res.status(202).json({
        status: 'success',
        message: 'Backup iniciado correctamente. El proceso continuará en segundo plano.',
        data: {
          backupJob: {
            id: backupJob.id,
            status: backupJob.status,
            createdAt: backupJob.createdAt,
            creator: backupJob.creator
          }
        }
      });
    } catch (error: any) {
      console.error('Error al iniciar backup:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al iniciar backup',
        error: error.message
      });
    }
  }
);

router.get(
  '/backups',
  authenticate,
  requirePermission('security', 'backup.view'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

      const result = await securityBackupService.getBackups({
        page,
        limit,
        status,
        dateFrom,
        dateTo
      });

      // Adaptar formato para el frontend
      const formattedBackups = result.backups.map((backup: any) => ({
        ...backup,
        totalDocuments: backup.recordCount || 0,
        totalVersions: 0,
        totalSignatures: 0,
        totalFiles: backup.fileCount || 0,
        totalSize: backup.totalSize || 0,
        duration: backup.startedAt && backup.completedAt 
          ? Math.floor((new Date(backup.completedAt).getTime() - new Date(backup.startedAt).getTime()) / 1000)
          : null,
        type: 'incremental',
        creator: backup.creator ? {
          id: backup.creator.id,
          username: backup.creator.username,
          fullName: `${backup.creator.firstName} ${backup.creator.lastName}`.trim() || backup.creator.username
        } : undefined
      }));

      res.status(200).json({
        status: 'success',
        data: {
          ...result,
          backups: formattedBackups
        }
      });
    } catch (error: any) {
      console.error('Error al obtener backups:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener backups',
        error: error.message
      });
    }
  }
);

router.get(
  '/backups/summary',
  authenticate,
  requirePermission('security', 'backup.view'),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const summary = await securityBackupService.getBackupSummary();

      res.status(200).json({
        status: 'success',
        data: summary
      });
    } catch (error: any) {
      console.error('Error al obtener resumen de backup:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener resumen de backup',
        error: error.message
      });
    }
  }
);

router.get(
  '/backups/:id',
  authenticate,
  requirePermission('security', 'backup.view'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const backup = await securityBackupService.getBackupById(req.params.id);

      // Adaptar formato para el frontend
      const formattedBackup = {
        ...backup,
        totalDocuments: backup.recordCount || 0,
        totalVersions: 0,
        totalSignatures: 0,
        totalFiles: backup.fileCount || 0,
        totalSize: backup.totalSize || 0,
        duration: backup.startedAt && backup.completedAt 
          ? Math.floor((new Date(backup.completedAt).getTime() - new Date(backup.startedAt).getTime()) / 1000)
          : null,
        type: 'incremental',
        creator: backup.creator ? {
          id: backup.creator.id,
          username: backup.creator.username,
          fullName: `${backup.creator.firstName} ${backup.creator.lastName}`.trim() || backup.creator.username
        } : undefined
      };

      res.status(200).json({
        status: 'success',
        data: { backup: formattedBackup }
      });
    } catch (error: any) {
      console.error('Error al obtener backup:', error);
      
      if (error.message === 'Backup no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Error al obtener backup',
        error: error.message
      });
    }
  }
);

router.get(
  '/backups/:id/download',
  authenticate,
  requirePermission('security', 'backup.manage'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const filePath = await securityBackupService.downloadBackup(req.params.id);

      await auditService.log({
        userId: req.user!.id,
        action: 'BACKUP_DOWNLOADED',
        module: 'security',
        entityType: 'BackupJob',
        entityId: req.params.id,
        req
      });

      res.download(filePath, (err) => {
        if (err) {
          console.error('Error al descargar backup:', err);
          if (!res.headersSent) {
            res.status(500).json({
              status: 'error',
              message: 'Error al descargar backup'
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Error al descargar backup:', error);
      
      if (error.message === 'Backup no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'Backup no completado' || error.message === 'Archivo de backup no encontrado') {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Error al descargar backup',
        error: error.message
      });
    }
  }
);

router.post(
  '/backups/:id/restore',
  authenticate,
  requirePermission('security', 'backup.restore'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const restoreLog = await securityBackupService.restoreBackup(req.params.id, req);

      res.status(202).json({
        status: 'success',
        message: 'Restauración iniciada correctamente. El proceso continuará en segundo plano.',
        data: {
          restoreLog: {
            id: restoreLog.id,
            backupJobId: restoreLog.backupJobId,
            status: restoreLog.status,
            createdAt: restoreLog.createdAt,
            creator: restoreLog.creator
          }
        }
      });
    } catch (error: any) {
      console.error('Error al iniciar restauración:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al iniciar restauración',
        error: error.message
      });
    }
  }
);

router.get(
  '/restores',
  authenticate,
  requirePermission('security', 'backup.view'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const status = req.query.status as string | undefined;
      const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
      const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;

      const result = await securityBackupService.getRestores({
        page,
        limit,
        status,
        dateFrom,
        dateTo
      });

      // Adaptar formato para el frontend
      const formattedRestores = result.restores.map((restore: any) => ({
        ...restore,
        duration: restore.startedAt && restore.completedAt 
          ? Math.floor((new Date(restore.completedAt).getTime() - new Date(restore.startedAt).getTime()) / 1000)
          : null,
        creator: restore.creator ? {
          id: restore.creator.id,
          username: restore.creator.username,
          fullName: `${restore.creator.firstName} ${restore.creator.lastName}`.trim() || restore.creator.username
        } : undefined
      }));

      res.status(200).json({
        status: 'success',
        data: {
          ...result,
          restores: formattedRestores
        }
      });
    } catch (error: any) {
      console.error('Error al obtener restauraciones:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener restauraciones',
        error: error.message
      });
    }
  }
);

router.get(
  '/restores/:id',
  authenticate,
  requirePermission('security', 'backup.view'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const restore = await securityBackupService.getRestoreById(req.params.id);

      // Adaptar formato para el frontend
      const formattedRestore = {
        ...restore,
        duration: restore.startedAt && restore.completedAt 
          ? Math.floor((new Date(restore.completedAt).getTime() - new Date(restore.startedAt).getTime()) / 1000)
          : null,
        creator: restore.creator ? {
          id: restore.creator.id,
          username: restore.creator.username,
          fullName: `${restore.creator.firstName} ${restore.creator.lastName}`.trim() || restore.creator.username
        } : undefined
      };

      res.status(200).json({
        status: 'success',
        data: { restore: formattedRestore }
      });
    } catch (error: any) {
      console.error('Error al obtener restauración:', error);
      
      if (error.message === 'Restauración no encontrada') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        status: 'error',
        message: 'Error al obtener restauración',
        error: error.message
      });
    }
  }
);

// 🚨 RESTAURACIÓN DE EMERGENCIA - Desde archivo local
router.post(
  '/backups/restore-from-file',
  authenticate,
  requirePermission('security', 'backup.restore'),
  emergencyRestoreUpload.single('backup'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          status: 'error',
          message: 'No se proporcionó archivo ZIP'
        });
        return;
      }

      const userId = (req as any).user.id;

      console.log(`🚨 RESTAURACIÓN DE EMERGENCIA solicitada por usuario ${userId}`);
      console.log(`   📦 Archivo: ${req.file.originalname}`);
      console.log(`   💾 Tamaño: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);

      // Procesar restauración
      const result = await emergencyRestoreService.restoreFromUploadedFile(
        req.file.path,
        req.file.originalname,
        userId,
        req
      );

      res.status(202).json({
        status: 'success',
        message: 'Restauración de emergencia completada',
        data: result
      });

    } catch (error: any) {
      console.error('❌ Error en restauración de emergencia:', error);

      // Limpiar archivo si existe
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        status: 'error',
        message: 'Error en restauración de emergencia',
        error: error.message
      });
    }
  }
);

export default router;
