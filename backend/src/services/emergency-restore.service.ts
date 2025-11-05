/**
 * Servicio de Restauración de Emergencia
 * 
 * Maneja la restauración desde archivos ZIP locales cuando:
 * - Se perdió toda la base de datos
 * - Se perdieron todos los backups del servidor
 * - Solo se tiene copias descargadas localmente
 */

import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express';
import prisma from '../config/database';
import extract from 'extract-zip';
import * as crypto from 'crypto';
import * as auditService from './audit.service';

const TEMP_RESTORE_DIR = path.join(__dirname, '../../temp/emergency-restore');

interface EmergencyRestoreResult {
  restoreLogId: string;
  backupJobId: string | null;
  status: string;
  message: string;
}

const calculateFileHash = async (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (error) => reject(error));
  });
};

/**
 * Restaurar desde un archivo ZIP local subido
 */
export const restoreFromUploadedFile = async (
  filePath: string,
  originalName: string,
  userId: string,
  req: Request
): Promise<EmergencyRestoreResult> => {
  let extractedPath: string | null = null;
  let restoreLogId: string | null = null;

  try {
    console.log(`🚨 RESTAURACIÓN DE EMERGENCIA iniciada desde: ${originalName}`);

    // 1. Extraer el ZIP a directorio temporal
    const extractDir = path.join(TEMP_RESTORE_DIR, `extract-${Date.now()}`);
    fs.mkdirSync(extractDir, { recursive: true });
    
    await extract(filePath, { dir: extractDir });
    extractedPath = extractDir;

    // 2. Validar estructura y leer manifest
    const manifestPath = path.join(extractDir, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Archivo ZIP inválido: no contiene manifest.json');
    }

    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    const manifestData = JSON.parse(manifestContent);

    console.log(`📦 Manifest validado: ${manifestData.summary.documents} docs, ${manifestData.summary.versions} versiones, ${manifestData.summary.signatures} firmas`);

    // 3. Crear o recuperar BackupJob en la BD
    let backupJob = await prisma.backupJob.findFirst({
      where: {
        createdAt: new Date(manifestData.createdAt)
      }
    });

    // Si no existe, crear un registro del backup perdido
    if (!backupJob) {
      console.log('📝 Creando registro de backup recuperado en BD...');
      backupJob = await prisma.backupJob.create({
        data: {
          status: 'COMPLETED',
          startedAt: new Date(manifestData.createdAt),
          completedAt: new Date(manifestData.createdAt),
          totalSize: 0, // No conocemos el tamaño exacto
          recordCount: manifestData.summary.documents + manifestData.summary.versions + manifestData.summary.signatures,
          fileCount: manifestData.items ? manifestData.items.length : 0,
          packagePath: `RECOVERED: ${originalName}`,
          manifestPath: 'emergency-restore',
          createdBy: userId,
          ipAddress: (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown'),
          userAgent: req.headers['user-agent'] || 'Emergency Restore'
        }
      });
      console.log(`✅ Backup job creado: ${backupJob.id}`);
    }

    // 4. Crear BackupRestoreLog
    const restoreLog = await prisma.backupRestoreLog.create({
      data: {
        backupJobId: backupJob.id,
        status: 'PENDING',
        startedAt: new Date(),
        createdBy: userId,
        ipAddress: (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown'),
        userAgent: req.headers['user-agent'] || 'Emergency Restore'
      }
    });

    restoreLogId = restoreLog.id;
    console.log(`📋 Restore log creado: ${restoreLogId}`);

    // 5. Validar paquete
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'VALIDATING',
        validationLog: {
          step: 'validating',
          manifestVersion: manifestData.version,
          timestamp: new Date()
        }
      }
    });

    // Validar hashes de archivos
    const errors: string[] = [];
    const warnings: string[] = [];

    if (manifestData.items && Array.isArray(manifestData.items)) {
      for (const item of manifestData.items.slice(0, 10)) { // Validar solo primeros 10 para velocidad
        if (item.type === 'PDF_FILE') {
          const filePath = path.join(extractDir, item.path);
          if (fs.existsSync(filePath)) {
            const actualHash = await calculateFileHash(filePath);
            if (actualHash !== item.hash) {
              warnings.push(`Hash no coincide para ${item.path}`);
            }
          } else {
            warnings.push(`Archivo no encontrado: ${item.path}`);
          }
        }
      }
    }

    console.log(`🔍 Validación: ${errors.length} errores, ${warnings.length} advertencias`);

    // 6. Restaurar Base de Datos
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'RESTORING_DB',
        totalRecords: manifestData.summary.documents + manifestData.summary.versions + manifestData.summary.signatures
      }
    });

    let restoredRecords = 0;

    // Restaurar documentos
    const documentsPath = path.join(extractDir, 'database', 'documents.jsonl');
    if (fs.existsSync(documentsPath)) {
      const lines = fs.readFileSync(documentsPath, 'utf-8').split('\n').filter(l => l.trim());
      console.log(`📄 Restaurando ${lines.length} documentos...`);

      for (const line of lines) {
        const doc = JSON.parse(line);
        
        const existing = await prisma.document.findUnique({ where: { id: doc.id } });

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
                currentVersion: doc.currentVersion,
                signatureStatus: doc.signatureStatus,
                updatedAt: new Date(doc.updatedAt)
              }
            });
          }
        } else {
          // Verificar que existan referencias
          const [archivadorExists, documentTypeExists, officeExists] = await Promise.all([
            prisma.archivador.findUnique({ where: { id: doc.archivadorId } }),
            prisma.documentType.findUnique({ where: { id: doc.documentTypeId } }),
            prisma.office.findUnique({ where: { id: doc.officeId } })
          ]);

          if (archivadorExists && documentTypeExists && officeExists) {
            await prisma.document.create({
              data: {
                id: doc.id,
                archivadorId: doc.archivadorId,
                documentTypeId: doc.documentTypeId,
                officeId: doc.officeId,
                expedienteId: doc.expedienteId,
                documentNumber: doc.documentNumber,
                documentDate: new Date(doc.documentDate),
                sender: doc.sender,
                folioCount: doc.folioCount,
                annotations: doc.annotations,
                ocrContent: doc.ocrContent,
                ocrStatus: doc.ocrStatus,
                ocrError: doc.ocrError,
                filePath: doc.filePath,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                mimeType: doc.mimeType,
                currentVersion: doc.currentVersion,
                signatureStatus: doc.signatureStatus,
                lastSignedAt: doc.lastSignedAt ? new Date(doc.lastSignedAt) : null,
                signedBy: doc.signedBy,
                createdBy: doc.createdBy,
                createdAt: new Date(doc.createdAt),
                updatedAt: new Date(doc.updatedAt)
              }
            });
          }
        }
        restoredRecords++;
      }
      console.log(`✅ ${restoredRecords} documentos restaurados`);
    }

    // Restaurar versiones
    const versionsPath = path.join(extractDir, 'database', 'versions.jsonl');
    if (fs.existsSync(versionsPath)) {
      const lines = fs.readFileSync(versionsPath, 'utf-8').split('\n').filter(l => l.trim());
      console.log(`📑 Restaurando ${lines.length} versiones...`);

      for (const line of lines) {
        const version = JSON.parse(line);
        
        const documentExists = await prisma.document.findUnique({ where: { id: version.documentId } });
        if (!documentExists) continue;

        const existing = await prisma.documentVersion.findUnique({ where: { id: version.id } });

        if (!existing) {
          await prisma.documentVersion.create({
            data: {
              id: version.id,
              documentId: version.documentId,
              versionNumber: version.versionNumber,
              filePath: version.filePath,
              fileName: version.fileName,
              changeDescription: version.changeDescription,
              createdBy: version.createdBy,
              createdAt: new Date(version.createdAt)
            }
          }).catch(() => {}); // Ignorar duplicados
        }
        restoredRecords++;
      }
      console.log(`✅ ${lines.length} versiones procesadas`);
    }

    // Restaurar firmas
    const signaturesPath = path.join(extractDir, 'database', 'signatures.jsonl');
    if (fs.existsSync(signaturesPath)) {
      const lines = fs.readFileSync(signaturesPath, 'utf-8').split('\n').filter(l => l.trim());
      console.log(`✍️ Restaurando ${lines.length} firmas...`);

      for (const line of lines) {
        const signature = JSON.parse(line);
        
        const documentExists = await prisma.document.findUnique({ where: { id: signature.documentId } });
        if (!documentExists) continue;

        const existing = await prisma.signature.findUnique({ where: { id: signature.id } });

        if (!existing) {
          await prisma.signature.create({
            data: {
              id: signature.id,
              documentId: signature.documentId,
              documentVersionId: signature.documentVersionId,
              signerId: signature.signerId,
              signatureData: signature.signatureData,
              certificateData: signature.certificateData,
              timestamp: new Date(signature.timestamp),
              isValid: signature.isValid,
              status: signature.status,
              observations: signature.observations,
              isReverted: signature.isReverted,
              revertedAt: signature.revertedAt ? new Date(signature.revertedAt) : null,
              revertedBy: signature.revertedBy,
              revertReason: signature.revertReason,
              createdAt: new Date(signature.createdAt)
            }
          }).catch(() => {}); // Ignorar duplicados
        }
        restoredRecords++;
      }
      console.log(`✅ ${lines.length} firmas procesadas`);
    }

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { restoredRecords }
    });

    // 7. Restaurar Archivos PDF
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { status: 'RESTORING_FILES' }
    });

    let restoredFiles = 0;
    let skippedFiles = 0;

    if (manifestData.items && Array.isArray(manifestData.items)) {
      await prisma.backupRestoreLog.update({
        where: { id: restoreLogId },
        data: { totalFiles: manifestData.items.filter((i: any) => i.type === 'PDF_FILE').length }
      });

      const pdfItems = manifestData.items.filter((item: any) => item.type === 'PDF_FILE');
      console.log(`📁 Restaurando ${pdfItems.length} archivos PDF...`);

      for (const item of pdfItems) {
        const sourcePath = path.join(extractDir, item.path);
        if (!fs.existsSync(sourcePath)) {
          skippedFiles++;
          continue;
        }

        const destDir = path.join(__dirname, '../../uploads/documents');
        fs.mkdirSync(destDir, { recursive: true });

        const destPath = path.join(destDir, path.basename(item.path));

        // Verificar si ya existe
        if (fs.existsSync(destPath)) {
          const existingHash = await calculateFileHash(destPath);
          if (existingHash === item.hash) {
            skippedFiles++;
            continue;
          }
        }

        fs.copyFileSync(sourcePath, destPath);
        
        // Verificar hash después de copiar
        const copiedHash = await calculateFileHash(destPath);
        if (copiedHash === item.hash) {
          restoredFiles++;
        } else {
          warnings.push(`Hash no coincide después de copiar: ${item.path}`);
        }
      }

      console.log(`✅ ${restoredFiles} archivos restaurados, ${skippedFiles} omitidos`);
    }

    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: { 
        restoredFiles,
        skippedFiles
      }
    });

    // 8. Completar
    await prisma.backupRestoreLog.update({
      where: { id: restoreLogId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        validationLog: {
          errors,
          warnings,
          manifestData: manifestData.summary
        }
      }
    });

    // 9. Limpiar temporales
    if (extractedPath) {
      fs.rmSync(extractedPath, { recursive: true, force: true });
    }
    fs.unlinkSync(filePath); // Eliminar ZIP subido

    // 10. Auditar
    await auditService.log({
      userId,
      action: 'RESTORE_COMPLETED' as any,
      module: 'security',
      entityType: 'BackupRestoreLog',
      entityId: restoreLogId,
      newValue: {
        emergencyRestore: true,
        fileName: originalName,
        restoredRecords,
        restoredFiles,
        skippedFiles
      },
      req
    });

    console.log(`✅ RESTAURACIÓN DE EMERGENCIA COMPLETADA`);
    console.log(`   📊 Registros: ${restoredRecords}`);
    console.log(`   📁 Archivos: ${restoredFiles} restaurados, ${skippedFiles} omitidos`);
    console.log(`   ⚠️  Advertencias: ${warnings.length}`);

    return {
      restoreLogId,
      backupJobId: backupJob.id,
      status: 'COMPLETED',
      message: `Restauración completada: ${restoredRecords} registros, ${restoredFiles} archivos`
    };

  } catch (error: any) {
    console.error('❌ ERROR EN RESTAURACIÓN DE EMERGENCIA:', error);

    // Actualizar log con error si existe
    if (restoreLogId) {
      await prisma.backupRestoreLog.update({
        where: { id: restoreLogId },
        data: {
          status: 'FAILED',
          completedAt: new Date(),
          errorMessage: error.message
        }
      }).catch(() => {});
    }

    // Limpiar temporales en caso de error
    if (extractedPath && fs.existsSync(extractedPath)) {
      fs.rmSync(extractedPath, { recursive: true, force: true });
    }
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    throw error;
  }
};
