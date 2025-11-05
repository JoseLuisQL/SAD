import { Request } from 'express';
import prisma from '../config/database';
import * as auditService from './audit.service';
import * as notificationsService from './notifications.service';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import extract from 'extract-zip';

const BACKUP_DIR = path.join(__dirname, '../../backups');
const TEMP_DIR = path.join(__dirname, '../../temp/backups');
const RESTORE_TEMP_DIR = path.join(__dirname, '../../temp/restores');
const UPLOADS_DIR = path.join(__dirname, '../../uploads/documents');
const MAX_BACKUPS_TO_KEEP = 10;

interface BackupFilters {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// Interfaz ya no es necesaria, se infiere del return type

fs.mkdirSync(BACKUP_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });
fs.mkdirSync(RESTORE_TEMP_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const calculateFileHash = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
};

const getLastSuccessfulBackup = async () => {
  return await prisma.backupJob.findFirst({
    where: { status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' },
    include: {
      backupItems: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });
};

const getPreviousHashes = async (lastBackupJobId: string): Promise<Set<string>> => {
  const items = await prisma.backupItem.findMany({
    where: {
      backupJobId: lastBackupJobId,
      fileHash: { not: null }
    },
    select: { fileHash: true }
  });

  return new Set(items.map(item => item.fileHash!));
};

const getNewOrModifiedDocuments = async (sinceDate: Date | null) => {
  const where = sinceDate ? {
    OR: [
      { createdAt: { gt: sinceDate } },
      { updatedAt: { gt: sinceDate } }
    ]
  } : {};

  return await prisma.document.findMany({
    where,
    include: {
      archivador: true,
      documentType: true,
      office: true,
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
};

const getNewOrModifiedVersions = async (sinceDate: Date | null) => {
  const where = sinceDate ? {
    createdAt: { gt: sinceDate }
  } : {};

  return await prisma.documentVersion.findMany({
    where,
    include: {
      document: true,
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
};

const getNewOrModifiedSignatures = async (sinceDate: Date | null) => {
  const where = sinceDate ? {
    OR: [
      { createdAt: { gt: sinceDate } },
      { revertedAt: { gt: sinceDate } }
    ]
  } : {};

  return await prisma.signature.findMany({
    where,
    include: {
      document: true,
      signer: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });
};

export const createBackup = async (req: Request): Promise<any> => {
  const userId = req.user!.id;
  const ipAddress = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown');
  const userAgent = req.headers['user-agent'] || 'unknown';

  let backupJob = await prisma.backupJob.create({
    data: {
      status: 'PENDING',
      createdBy: userId,
      ipAddress,
      userAgent
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditService.log({
    userId,
    action: 'BACKUP_STARTED',
    module: 'security',
    entityType: 'BackupJob',
    entityId: backupJob.id,
    req
  });

  processBackupAsync(backupJob.id, userId, req);

  return backupJob;
};

const processBackupAsync = async (backupJobId: string, userId: string, req: Request) => {
  try {
    await prisma.backupJob.update({
      where: { id: backupJobId },
      data: {
        status: 'RUNNING',
        startedAt: new Date()
      }
    });

    const lastBackup = await getLastSuccessfulBackup();
    const sinceDate = lastBackup?.completedAt || null;
    const previousHashes = lastBackup ? await getPreviousHashes(lastBackup.id) : new Set<string>();

    const [documents, versions, signatures] = await Promise.all([
      getNewOrModifiedDocuments(sinceDate),
      getNewOrModifiedVersions(sinceDate),
      getNewOrModifiedSignatures(sinceDate)
    ]);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `backup-${timestamp}`;
    const tempBackupDir = path.join(TEMP_DIR, backupName);
    const databaseDir = path.join(tempBackupDir, 'database');
    const documentsDir = path.join(tempBackupDir, 'documents');

    fs.mkdirSync(tempBackupDir, { recursive: true });
    fs.mkdirSync(databaseDir, { recursive: true });
    fs.mkdirSync(documentsDir, { recursive: true });

    const backupItems: Array<{
      itemType: string;
      entityType: string;
      sourceId: string;
      fileHash: string | null;
      filePath: string | null;
      metadata: any;
    }> = [];

    const manifestData: any = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: userId,
      sinceDate: sinceDate?.toISOString() || null,
      summary: {
        documents: documents.length,
        versions: versions.length,
        signatures: signatures.length
      },
      items: []
    };

    fs.writeFileSync(
      path.join(databaseDir, 'documents.jsonl'),
      documents.map(doc => JSON.stringify(doc)).join('\n')
    );

    for (const doc of documents) {
      backupItems.push({
        itemType: 'DB_RECORD',
        entityType: 'Document',
        sourceId: doc.id,
        fileHash: null,
        filePath: 'database/documents.jsonl',
        metadata: {
          documentNumber: doc.documentNumber,
          documentDate: doc.documentDate,
          sender: doc.sender
        }
      });

      if (doc.filePath && fs.existsSync(doc.filePath)) {
        const fileHash = await calculateFileHash(doc.filePath);
        
        if (!previousHashes.has(fileHash)) {
          const relativePath = `documents/${doc.id}-${doc.fileName}`;
          const destPath = path.join(tempBackupDir, relativePath);
          fs.copyFileSync(doc.filePath, destPath);

          backupItems.push({
            itemType: 'PDF_FILE',
            entityType: 'Document',
            sourceId: doc.id,
            fileHash,
            filePath: relativePath,
            metadata: {
              fileName: doc.fileName,
              fileSize: doc.fileSize,
              mimeType: doc.mimeType
            }
          });

          manifestData.items.push({
            type: 'PDF_FILE',
            entity: 'Document',
            id: doc.id,
            hash: fileHash,
            path: relativePath,
            fileName: doc.fileName,
            fileSize: doc.fileSize
          });
        }
      }
    }

    fs.writeFileSync(
      path.join(databaseDir, 'versions.jsonl'),
      versions.map(ver => JSON.stringify(ver)).join('\n')
    );

    for (const version of versions) {
      backupItems.push({
        itemType: 'DB_RECORD',
        entityType: 'DocumentVersion',
        sourceId: version.id,
        fileHash: null,
        filePath: 'database/versions.jsonl',
        metadata: {
          documentId: version.documentId,
          versionNumber: version.versionNumber
        }
      });

      if (version.filePath && fs.existsSync(version.filePath)) {
        const fileHash = await calculateFileHash(version.filePath);
        
        if (!previousHashes.has(fileHash)) {
          const relativePath = `documents/versions/${version.documentId}-v${version.versionNumber}-${version.fileName}`;
          const destPath = path.join(tempBackupDir, relativePath);
          fs.mkdirSync(path.dirname(destPath), { recursive: true });
          fs.copyFileSync(version.filePath, destPath);

          backupItems.push({
            itemType: 'PDF_FILE',
            entityType: 'DocumentVersion',
            sourceId: version.id,
            fileHash,
            filePath: relativePath,
            metadata: {
              documentId: version.documentId,
              versionNumber: version.versionNumber,
              fileName: version.fileName
            }
          });

          manifestData.items.push({
            type: 'PDF_FILE',
            entity: 'DocumentVersion',
            id: version.id,
            hash: fileHash,
            path: relativePath,
            fileName: version.fileName,
            versionNumber: version.versionNumber
          });
        }
      }
    }

    fs.writeFileSync(
      path.join(databaseDir, 'signatures.jsonl'),
      signatures.map(sig => JSON.stringify(sig)).join('\n')
    );

    for (const signature of signatures) {
      backupItems.push({
        itemType: 'DB_RECORD',
        entityType: 'Signature',
        sourceId: signature.id,
        fileHash: null,
        filePath: 'database/signatures.jsonl',
        metadata: {
          documentId: signature.documentId,
          isReverted: signature.isReverted
        }
      });
    }

    const manifestPath = path.join(tempBackupDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

    const zipPath = path.join(BACKUP_DIR, `${backupName}.zip`);
    await createZipArchive(tempBackupDir, zipPath);

    const zipStats = fs.statSync(zipPath);

    await prisma.backupJob.update({
      where: { id: backupJobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        totalSize: zipStats.size,
        recordCount: documents.length + versions.length + signatures.length,
        fileCount: manifestData.items.length,
        packagePath: zipPath,
        manifestPath: path.relative(BACKUP_DIR, manifestPath)
      }
    });

    await prisma.backupItem.createMany({
      data: backupItems.map(item => ({
        ...item,
        backupJobId
      }))
    });

    fs.rmSync(tempBackupDir, { recursive: true, force: true });

    await auditService.log({
      userId,
      action: 'BACKUP_COMPLETED',
      module: 'security',
      entityType: 'BackupJob',
      entityId: backupJobId,
      newValue: {
        recordCount: documents.length + versions.length + signatures.length,
        fileCount: manifestData.items.length,
        size: zipStats.size
      },
      req
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });

    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'Administrador'
        }
      },
      select: { id: true }
    });

    await Promise.all(
      adminUsers.map(admin =>
        notificationsService.createNotification({
          userId: admin.id,
          type: 'BACKUP_COMPLETED',
          title: 'Copia de seguridad completada',
          message: `${user?.firstName} ${user?.lastName} ha completado una copia de seguridad. ${documents.length} documentos, ${versions.length} versiones, ${signatures.length} firmas respaldadas.`,
          data: {
            backupJobId,
            recordCount: documents.length + versions.length + signatures.length,
            fileCount: manifestData.items.length
          },
          priority: 'NORMAL',
          actionUrl: `/dashboard/seguridad/respaldos`,
          actionLabel: 'Ver Respaldos'
        })
      )
    );

    await cleanOldBackups();

  } catch (error: any) {
    await prisma.backupJob.update({
      where: { id: backupJobId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error.message || 'Error desconocido'
      }
    });

    await auditService.log({
      userId,
      action: 'BACKUP_FAILED',
      module: 'security',
      entityType: 'BackupJob',
      entityId: backupJobId,
      newValue: { error: error.message },
      req
    });

    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'Administrador'
        }
      },
      select: { id: true }
    });

    await Promise.all(
      adminUsers.map(admin =>
        notificationsService.createNotification({
          userId: admin.id,
          type: 'BACKUP_FAILED',
          title: 'Error en copia de seguridad',
          message: `La copia de seguridad falló: ${error.message}`,
          data: { backupJobId, error: error.message },
          priority: 'URGENT',
          actionUrl: `/dashboard/seguridad/respaldos`,
          actionLabel: 'Ver Detalles'
        })
      )
    );

    console.error('Error en proceso de backup:', error);
  }
};

const createZipArchive = (sourceDir: string, outputPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};

export const getBackups = async (filters: BackupFilters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    dateFrom,
    dateTo
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [backups, total] = await Promise.all([
    prisma.backupJob.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            backupItems: true
          }
        }
      }
    }),
    prisma.backupJob.count({ where })
  ]);

  return {
    backups,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getBackupById = async (backupId: string) => {
  const backup = await prisma.backupJob.findUnique({
    where: { id: backupId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      backupItems: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!backup) {
    throw new Error('Backup no encontrado');
  }

  return backup;
};

export const getBackupSummary = async () => {
  const lastSuccessfulBackup = await getLastSuccessfulBackup();
  const sinceDate = lastSuccessfulBackup?.completedAt || null;

  // Obtener último backup (completado o no)
  const lastBackup = await prisma.backupJob.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          email: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  const [documentCount, versionCount, signatureCount, documents] = await Promise.all([
    prisma.document.count({
      where: sinceDate ? {
        OR: [
          { createdAt: { gt: sinceDate } },
          { updatedAt: { gt: sinceDate } }
        ]
      } : {}
    }),
    prisma.documentVersion.count({
      where: sinceDate ? {
        createdAt: { gt: sinceDate }
      } : {}
    }),
    prisma.signature.count({
      where: sinceDate ? {
        OR: [
          { createdAt: { gt: sinceDate } },
          { revertedAt: { gt: sinceDate } }
        ]
      } : {}
    }),
    // Obtener documentos para calcular tamaño
    prisma.document.findMany({
      where: sinceDate ? {
        OR: [
          { createdAt: { gt: sinceDate } },
          { updatedAt: { gt: sinceDate } }
        ]
      } : {},
      select: { fileSize: true }
    })
  ]);

  // Calcular tamaño total pendiente
  const totalPendingSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

  // Formatear creator con fullName
  const formattedLastBackup = lastBackup ? {
    ...lastBackup,
    creator: lastBackup.creator ? {
      id: lastBackup.creator.id,
      username: lastBackup.creator.username,
      fullName: `${lastBackup.creator.firstName} ${lastBackup.creator.lastName}`.trim() || lastBackup.creator.username
    } : undefined
  } : null;

  const formattedLastSuccessfulBackup = lastSuccessfulBackup ? {
    ...lastSuccessfulBackup,
    creator: lastSuccessfulBackup.creator ? {
      id: lastSuccessfulBackup.creator.id,
      username: lastSuccessfulBackup.creator.username,
      fullName: `${lastSuccessfulBackup.creator.firstName} ${lastSuccessfulBackup.creator.lastName}`.trim() || lastSuccessfulBackup.creator.username
    } : undefined
  } : null;

  return {
    lastBackup: formattedLastBackup,
    pendingDocuments: documentCount,
    pendingVersions: versionCount,
    pendingSignatures: signatureCount,
    recommendedPath: 'C:\\SAD\\backups',
    totalPendingSize,
    lastSuccessfulBackup: formattedLastSuccessfulBackup
  };
};

export const downloadBackup = async (backupId: string): Promise<string> => {
  const backup = await prisma.backupJob.findUnique({
    where: { id: backupId }
  });

  if (!backup) {
    throw new Error('Backup no encontrado');
  }

  if (backup.status !== 'COMPLETED') {
    throw new Error('Backup no completado');
  }

  if (!backup.packagePath || !fs.existsSync(backup.packagePath)) {
    throw new Error('Archivo de backup no encontrado');
  }

  return backup.packagePath;
};

const cleanOldBackups = async () => {
  try {
    const allBackups = await prisma.backupJob.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' }
    });

    if (allBackups.length > MAX_BACKUPS_TO_KEEP) {
      const backupsToDelete = allBackups.slice(MAX_BACKUPS_TO_KEEP);

      for (const backup of backupsToDelete) {
        if (backup.packagePath && fs.existsSync(backup.packagePath)) {
          fs.unlinkSync(backup.packagePath);
        }

        await prisma.backupJob.delete({
          where: { id: backup.id }
        });
      }

      console.log(`🧹 Limpieza de backups antiguos: ${backupsToDelete.length} eliminados`);
    }

    const tempFiles = fs.readdirSync(TEMP_DIR);
    for (const file of tempFiles) {
      const filePath = path.join(TEMP_DIR, file);
      fs.rmSync(filePath, { recursive: true, force: true });
    }
  } catch (error) {
    console.error('Error en limpieza de backups:', error);
  }
};

interface RestoreFilters {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  manifestData?: any;
  extractedPath?: string;
}

export const validateBackupPackage = async (backupJobId: string): Promise<ValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const backup = await prisma.backupJob.findUnique({
      where: { id: backupJobId }
    });

    if (!backup) {
      errors.push('Backup no encontrado');
      return { isValid: false, errors, warnings };
    }

    if (backup.status !== 'COMPLETED') {
      errors.push('El backup no está completado');
      return { isValid: false, errors, warnings };
    }

    if (!backup.packagePath || !fs.existsSync(backup.packagePath)) {
      errors.push('Archivo de backup no encontrado');
      return { isValid: false, errors, warnings };
    }

    const timestamp = Date.now();
    const extractPath = path.join(RESTORE_TEMP_DIR, `restore-${timestamp}`);
    fs.mkdirSync(extractPath, { recursive: true });

    await extract(backup.packagePath, { dir: extractPath });

    const manifestPath = path.join(extractPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      errors.push('Manifest.json no encontrado en el paquete');
      fs.rmSync(extractPath, { recursive: true, force: true });
      return { isValid: false, errors, warnings };
    }

    const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

    if (!manifestData.version) {
      errors.push('Versión del manifest no especificada');
    }

    if (manifestData.version !== '1.0') {
      warnings.push(`Versión del manifest (${manifestData.version}) puede no ser compatible`);
    }

    if (!manifestData.createdAt || !manifestData.summary) {
      errors.push('Manifest incompleto: faltan campos requeridos');
    }

    const databaseDir = path.join(extractPath, 'database');
    if (!fs.existsSync(databaseDir)) {
      errors.push('Directorio database/ no encontrado');
    }

    const requiredFiles = ['documents.jsonl', 'versions.jsonl', 'signatures.jsonl'];
    for (const file of requiredFiles) {
      const filePath = path.join(databaseDir, file);
      if (!fs.existsSync(filePath)) {
        warnings.push(`Archivo ${file} no encontrado en database/`);
      }
    }

    if (manifestData.items && Array.isArray(manifestData.items)) {
      for (const item of manifestData.items) {
        if (item.type === 'PDF_FILE' && item.path && item.hash) {
          const itemPath = path.join(extractPath, item.path);
          if (!fs.existsSync(itemPath)) {
            errors.push(`Archivo especificado en manifest no encontrado: ${item.path}`);
          } else {
            const actualHash = await calculateFileHash(itemPath);
            if (actualHash !== item.hash) {
              errors.push(`Hash no coincide para ${item.path}. Esperado: ${item.hash}, Actual: ${actualHash}`);
            }
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      manifestData,
      extractedPath: extractPath
    };
  } catch (error: any) {
    errors.push(`Error durante validación: ${error.message}`);
    return { isValid: false, errors, warnings };
  }
};

export const restoreDatabase = async (extractedPath: string, _manifestData: any, restoreLogId: string): Promise<void> => {
  const restoreLog: any[] = [];

  try {
    const databaseDir = path.join(extractedPath, 'database');

    const documentsPath = path.join(databaseDir, 'documents.jsonl');
    if (fs.existsSync(documentsPath)) {
      const lines = fs.readFileSync(documentsPath, 'utf-8').split('\n').filter(l => l.trim());
      restoreLog.push({ step: 'restoreDocuments', count: lines.length, timestamp: new Date() });

      for (const line of lines) {
        const doc = JSON.parse(line);
        
        const existing = await prisma.document.findUnique({
          where: { id: doc.id }
        });

        if (existing) {
          if (new Date(existing.updatedAt) < new Date(doc.updatedAt)) {
            await prisma.document.update({
              where: { id: doc.id },
              data: {
                documentNumber: doc.documentNumber,
                documentDate: new Date(doc.documentDate),
                sender: doc.sender,
                folioCount: doc.folioCount,
                annotations: doc.annotations,
                ocrContent: doc.ocrContent,
                ocrStatus: doc.ocrStatus,
                ocrError: doc.ocrError,
                currentVersion: doc.currentVersion,
                signatureStatus: doc.signatureStatus,
                lastSignedAt: doc.lastSignedAt ? new Date(doc.lastSignedAt) : null,
                signedBy: doc.signedBy,
                updatedAt: new Date(doc.updatedAt)
              }
            });
            restoreLog.push({ step: 'updateDocument', id: doc.id, timestamp: new Date() });
          } else {
            restoreLog.push({ step: 'skipDocument', id: doc.id, reason: 'existing is newer', timestamp: new Date() });
          }
        } else {
          restoreLog.push({ step: 'skipDocument', id: doc.id, reason: 'would create orphan (references may not exist)', timestamp: new Date() });
        }
      }

      await prisma.backupRestoreLog.update({
        where: { id: restoreLogId },
        data: {
          restoredRecords: lines.length,
          restoreLog: restoreLog
        }
      });
    }

    const versionsPath = path.join(databaseDir, 'versions.jsonl');
    if (fs.existsSync(versionsPath)) {
      const lines = fs.readFileSync(versionsPath, 'utf-8').split('\n').filter(l => l.trim());
      restoreLog.push({ step: 'restoreVersions', count: lines.length, timestamp: new Date() });

      for (const line of lines) {
        const version = JSON.parse(line);
        
        const existing = await prisma.documentVersion.findUnique({
          where: {
            documentId_versionNumber: {
              documentId: version.documentId,
              versionNumber: version.versionNumber
            }
          }
        });

        if (!existing) {
          const documentExists = await prisma.document.findUnique({
            where: { id: version.documentId }
          });

          if (documentExists) {
            restoreLog.push({ step: 'skipVersion', id: version.id, reason: 'would create orphan or duplicate', timestamp: new Date() });
          }
        } else {
          restoreLog.push({ step: 'skipVersion', id: version.id, reason: 'already exists', timestamp: new Date() });
        }
      }

      const currentRecords = await prisma.backupRestoreLog.findUnique({
        where: { id: restoreLogId },
        select: { restoredRecords: true }
      });

      await prisma.backupRestoreLog.update({
        where: { id: restoreLogId },
        data: {
          restoredRecords: (currentRecords?.restoredRecords || 0) + lines.length,
          restoreLog: restoreLog
        }
      });
    }

    const signaturesPath = path.join(databaseDir, 'signatures.jsonl');
    if (fs.existsSync(signaturesPath)) {
      const lines = fs.readFileSync(signaturesPath, 'utf-8').split('\n').filter(l => l.trim());
      restoreLog.push({ step: 'restoreSignatures', count: lines.length, timestamp: new Date() });

      for (const line of lines) {
        const signature = JSON.parse(line);
        
        const existing = await prisma.signature.findUnique({
          where: { id: signature.id }
        });

        if (existing) {
          if (signature.isReverted && !existing.isReverted) {
            await prisma.signature.update({
              where: { id: signature.id },
              data: {
                isReverted: signature.isReverted,
                revertedAt: signature.revertedAt ? new Date(signature.revertedAt) : null,
                revertedBy: signature.revertedBy,
                revertReason: signature.revertReason
              }
            });
            restoreLog.push({ step: 'updateSignature', id: signature.id, action: 'revert', timestamp: new Date() });
          } else {
            restoreLog.push({ step: 'skipSignature', id: signature.id, reason: 'already up to date', timestamp: new Date() });
          }
        } else {
          restoreLog.push({ step: 'skipSignature', id: signature.id, reason: 'would create orphan', timestamp: new Date() });
        }
      }

      const currentRecords = await prisma.backupRestoreLog.findUnique({
        where: { id: restoreLogId },
        select: { restoredRecords: true }
      });

      await prisma.backupRestoreLog.update({
        where: { id: restoreLogId },
        data: {
          restoredRecords: (currentRecords?.restoredRecords || 0) + lines.length,
          restoreLog: restoreLog
        }
      });
    }

  } catch (error: any) {
    restoreLog.push({ step: 'error', message: error.message, timestamp: new Date() });
    throw error;
  }
};

export const restoreDocuments = async (extractedPath: string, manifestData: any, restoreLogId: string): Promise<void> => {
  const restoreLog: any[] = [];
  let restoredCount = 0;
  let skippedCount = 0;

  try {
    if (!manifestData.items || !Array.isArray(manifestData.items)) {
      return;
    }

    const pdfItems = manifestData.items.filter((item: any) => item.type === 'PDF_FILE');
    
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { totalFiles: pdfItems.length }
    });

    for (const item of pdfItems) {
      const sourcePath = path.join(extractedPath, item.path);
      
      if (!fs.existsSync(sourcePath)) {
        restoreLog.push({ step: 'skipFile', path: item.path, reason: 'source not found', timestamp: new Date() });
        skippedCount++;
        continue;
      }

      const existingFiles = await findFilesByHash(item.hash);
      
      if (existingFiles.length > 0) {
        restoreLog.push({ 
          step: 'skipFile', 
          path: item.path, 
          hash: item.hash,
          reason: 'file with same hash already exists',
          existingPath: existingFiles[0],
          timestamp: new Date() 
        });
        skippedCount++;
        continue;
      }

      let destPath: string;
      if (item.entity === 'Document') {
        destPath = path.join(UPLOADS_DIR, item.fileName);
      } else if (item.entity === 'DocumentVersion') {
        const versionDir = path.join(UPLOADS_DIR, 'versions');
        fs.mkdirSync(versionDir, { recursive: true });
        destPath = path.join(versionDir, item.fileName);
      } else {
        destPath = path.join(UPLOADS_DIR, item.fileName);
      }

      if (fs.existsSync(destPath)) {
        const existingHash = await calculateFileHash(destPath);
        if (existingHash === item.hash) {
          restoreLog.push({ 
            step: 'skipFile', 
            path: item.path, 
            reason: 'identical file already at destination',
            timestamp: new Date() 
          });
          skippedCount++;
          continue;
        }
      }

      fs.copyFileSync(sourcePath, destPath);
      
      const verifyHash = await calculateFileHash(destPath);
      if (verifyHash !== item.hash) {
        fs.unlinkSync(destPath);
        throw new Error(`Hash verification failed after copy for ${item.path}`);
      }

      restoreLog.push({ 
        step: 'restoreFile', 
        source: item.path, 
        destination: destPath,
        hash: item.hash,
        timestamp: new Date() 
      });
      restoredCount++;
    }

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        restoredFiles: restoredCount,
        skippedFiles: skippedCount,
        restoreLog: restoreLog
      }
    });

  } catch (error: any) {
    restoreLog.push({ step: 'error', message: error.message, timestamp: new Date() });
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { restoreLog: restoreLog }
    });
    throw error;
  }
};

const findFilesByHash = async (hash: string): Promise<string[]> => {
  const documents = await prisma.document.findMany({
    select: { filePath: true }
  });

  const versions = await prisma.documentVersion.findMany({
    select: { filePath: true }
  });

  const allPaths = [
    ...documents.map(d => d.filePath),
    ...versions.map(v => v.filePath)
  ].filter(p => p && fs.existsSync(p));

  const matchingPaths: string[] = [];
  
  for (const filePath of allPaths) {
    try {
      const fileHash = await calculateFileHash(filePath);
      if (fileHash === hash) {
        matchingPaths.push(filePath);
      }
    } catch (error) {
      continue;
    }
  }

  return matchingPaths;
};

export const rebuildIndices = async (restoreLogId: string): Promise<void> => {
  const restoreLog: any[] = [];

  try {
    restoreLog.push({ step: 'rebuildIndices', action: 'start', timestamp: new Date() });

    restoreLog.push({ step: 'rebuildIndices', action: 'completed', note: 'Prisma auto-manages indices', timestamp: new Date() });

    const currentLog = await prisma.backupRestoreLog.findUnique({
      where: { id: restoreLogId },
      select: { restoreLog: true }
    });

    const existingLog = (currentLog?.restoreLog as any[]) || [];

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        restoreLog: [...existingLog, ...restoreLog]
      }
    });

  } catch (error: any) {
    restoreLog.push({ step: 'error', message: error.message, timestamp: new Date() });
    throw error;
  }
};

export const restoreBackup = async (backupJobId: string, req: Request): Promise<any> => {
  const userId = req.user!.id;
  const ipAddress = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown');
  const userAgent = req.headers['user-agent'] || 'unknown';

  const restoreLog = await prisma.backupRestoreLog.create({
    data: {
      backupJobId,
      status: 'PENDING',
      createdBy: userId,
      ipAddress,
      userAgent
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  await auditService.log({
    userId,
    action: 'RESTORE_STARTED',
    module: 'security',
    entityType: 'BackupRestoreLog',
    entityId: restoreLog.id,
    newValue: { backupJobId },
    req
  });

  processRestoreAsync(restoreLog.id, backupJobId, userId, req);

  return restoreLog;
};

const processRestoreAsync = async (restoreLogId: string, backupJobId: string, userId: string, req: Request) => {
  let extractedPath: string | undefined;

  try {
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'VALIDATING',
        startedAt: new Date()
      }
    });

    const validation = await validateBackupPackage(backupJobId);

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        validationLog: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
          timestamp: new Date()
        }
      }
    });

    if (!validation.isValid) {
      throw new Error(`Validación fallida: ${validation.errors.join(', ')}`);
    }

    extractedPath = validation.extractedPath!;
    const manifestData = validation.manifestData!;

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'RESTORING_DB',
        totalRecords: manifestData.summary.documents + manifestData.summary.versions + manifestData.summary.signatures
      }
    });

    await restoreDatabase(extractedPath, manifestData, restoreLogId);

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { status: 'RESTORING_FILES' }
    });

    await restoreDocuments(extractedPath, manifestData, restoreLogId);

    await rebuildIndices(restoreLogId);

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    if (extractedPath) {
      fs.rmSync(extractedPath, { recursive: true, force: true });
    }

    await auditService.log({
      userId,
      action: 'RESTORE_COMPLETED',
      module: 'security',
      entityType: 'BackupRestoreLog',
      entityId: restoreLogId,
      newValue: {
        backupJobId,
        status: 'COMPLETED'
      },
      req
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });

    const restoreLogData = await prisma.backupRestoreLog.findUnique({
      where: { id: restoreLogId }
    });

    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'Administrador'
        }
      },
      select: { id: true }
    });

    await Promise.all(
      adminUsers.map(admin =>
        notificationsService.createNotification({
          userId: admin.id,
          type: 'RESTORE_COMPLETED',
          title: 'Restauración completada',
          message: `${user?.firstName} ${user?.lastName} ha completado una restauración. ${restoreLogData?.restoredRecords} registros, ${restoreLogData?.restoredFiles} archivos restaurados, ${restoreLogData?.skippedFiles} archivos omitidos.`,
          data: {
            restoreLogId,
            backupJobId,
            restoredRecords: restoreLogData?.restoredRecords,
            restoredFiles: restoreLogData?.restoredFiles
          },
          priority: 'HIGH',
          actionUrl: `/dashboard/seguridad/respaldos`,
          actionLabel: 'Ver Detalles'
        })
      )
    );

  } catch (error: any) {
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errorMessage: error.message || 'Error desconocido'
      }
    });

    if (extractedPath && fs.existsSync(extractedPath)) {
      fs.rmSync(extractedPath, { recursive: true, force: true });
    }

    await auditService.log({
      userId,
      action: 'RESTORE_FAILED',
      module: 'security',
      entityType: 'BackupRestoreLog',
      entityId: restoreLogId,
      newValue: { error: error.message },
      req
    });

    const adminUsers = await prisma.user.findMany({
      where: {
        role: {
          name: 'Administrador'
        }
      },
      select: { id: true }
    });

    await Promise.all(
      adminUsers.map(admin =>
        notificationsService.createNotification({
          userId: admin.id,
          type: 'RESTORE_FAILED',
          title: 'Error en restauración',
          message: `La restauración del backup falló: ${error.message}`,
          data: { restoreLogId, backupJobId, error: error.message },
          priority: 'URGENT',
          actionUrl: `/dashboard/seguridad/respaldos`,
          actionLabel: 'Ver Detalles'
        })
      )
    );

    console.error('Error en proceso de restauración:', error);
  }
};

export const getRestores = async (filters: RestoreFilters = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    dateFrom,
    dateTo
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = dateFrom;
    if (dateTo) where.createdAt.lte = dateTo;
  }

  const [restores, total] = await Promise.all([
    prisma.backupRestoreLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.backupRestoreLog.count({ where })
  ]);

  return {
    restores,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

export const getRestoreById = async (restoreId: string) => {
  const restore = await prisma.backupRestoreLog.findUnique({
    where: { id: restoreId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!restore) {
    throw new Error('Restauración no encontrada');
  }

  return restore;
};

export default {
  createBackup,
  getBackups,
  getBackupById,
  getBackupSummary,
  downloadBackup,
  calculateFileHash,
  validateBackupPackage,
  restoreBackup,
  getRestores,
  getRestoreById
};
