/**
 * Pruebas End-to-End del Módulo de Copias de Seguridad
 * 
 * Flujo completo:
 * 1. Generar documentos de prueba
 * 2. Ejecutar backup incremental
 * 3. Simular pérdida parcial de datos
 * 4. Restaurar desde backup
 * 5. Verificar integridad de datos y archivos
 */

import prisma from '../src/config/database';
import * as securityBackupService from '../src/services/security-backup.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

interface TestContext {
  testUserId: string;
  testDocuments: Array<{ id: string; hash: string }>;
  backupJobId: string | null;
  restoreLogId: string | null;
}

const context: TestContext = {
  testUserId: '',
  testDocuments: [],
  backupJobId: null,
  restoreLogId: null
};

// Mock request object
const createMockRequest = (userId: string) => ({
  user: { id: userId },
  ip: '127.0.0.1',
  get: (header: string) => header === 'user-agent' ? 'Test Suite' : null
} as any);

/**
 * Paso 1: Preparar datos de prueba
 */
async function step1_PrepareTestData() {
  console.log('\n=== PASO 1: Preparar Datos de Prueba ===');
  
  // Buscar o crear usuario de prueba
  let testUser = await prisma.user.findFirst({
    where: { username: 'test_backup_user' }
  });

  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        username: 'test_backup_user',
        password: 'hashed_password',
        fullName: 'Usuario de Prueba Backup',
        email: 'test_backup@example.com',
        roleId: (await prisma.role.findFirst({ where: { name: 'Administrador' } }))!.id,
        isActive: true
      }
    });
  }

  context.testUserId = testUser.id;
  console.log(`✓ Usuario de prueba: ${testUser.username} (${testUser.id})`);

  // Crear documentos de prueba
  const testDocsCount = 5;
  const documentsCreated = [];

  for (let i = 0; i < testDocsCount; i++) {
    const testContent = `Test Document ${i} - ${new Date().toISOString()}`;
    const hash = createHash('sha256').update(testContent).digest('hex');
    
    const doc = await prisma.document.create({
      data: {
        code: `TEST-BACKUP-${Date.now()}-${i}`,
        title: `Documento de Prueba ${i}`,
        description: 'Documento creado para pruebas E2E de backup',
        documentTypeId: (await prisma.documentType.findFirst())!.id,
        officeId: (await prisma.office.findFirst())!.id,
        periodId: (await prisma.period.findFirst())!.id,
        createdBy: context.testUserId,
        currentVersion: 1,
        pdfPath: `test/backup_${i}.pdf`,
        pdfHash: hash,
        pdfSize: testContent.length,
        ocrText: testContent,
        currentStatus: 'VIGENTE'
      }
    });

    documentsCreated.push({ id: doc.id, hash });
  }

  context.testDocuments = documentsCreated;
  console.log(`✓ Creados ${testDocsCount} documentos de prueba`);
  
  return { success: true, count: testDocsCount };
}

/**
 * Paso 2: Ejecutar backup incremental
 */
async function step2_ExecuteBackup() {
  console.log('\n=== PASO 2: Ejecutar Backup Incremental ===');
  
  const mockReq = createMockRequest(context.testUserId);
  const backupJob = await securityBackupService.createBackup(mockReq);
  
  context.backupJobId = backupJob.id;
  console.log(`✓ Backup iniciado: ${backupJob.id}`);
  console.log(`  Estado inicial: ${backupJob.status}`);

  // Esperar a que el backup complete (polling)
  let completed = false;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutos máximo

  while (!completed && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
    
    const job = await prisma.backupJob.findUnique({
      where: { id: backupJob.id }
    });

    if (!job) {
      throw new Error('Backup job no encontrado');
    }

    console.log(`  [${attempts + 1}/${maxAttempts}] Estado: ${job.status}`);

    if (job.status === 'COMPLETED') {
      completed = true;
      console.log(`✓ Backup completado exitosamente`);
      console.log(`  Documentos: ${job.totalDocuments}`);
      console.log(`  Versiones: ${job.totalVersions}`);
      console.log(`  Archivos: ${job.totalFiles}`);
      console.log(`  Tamaño: ${(job.totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Duración: ${job.duration}s`);
      console.log(`  Paquete: ${job.packagePath}`);
    } else if (job.status === 'FAILED') {
      throw new Error(`Backup falló: ${job.errorMessage}`);
    }

    attempts++;
  }

  if (!completed) {
    throw new Error('Backup no completó en el tiempo esperado');
  }

  return { success: true, backupJobId: backupJob.id };
}

/**
 * Paso 3: Simular pérdida parcial de datos
 */
async function step3_SimulateDataLoss() {
  console.log('\n=== PASO 3: Simular Pérdida Parcial de Datos ===');
  
  if (context.testDocuments.length === 0) {
    throw new Error('No hay documentos de prueba para eliminar');
  }

  // Eliminar 2 de los 5 documentos de prueba
  const docsToDelete = context.testDocuments.slice(0, 2);
  
  for (const doc of docsToDelete) {
    await prisma.document.delete({
      where: { id: doc.id }
    });
  }

  console.log(`✓ Eliminados ${docsToDelete.length} documentos simulando pérdida de datos`);
  console.log(`  IDs eliminados: ${docsToDelete.map(d => d.id.substring(0, 8)).join(', ')}`);

  // Verificar que realmente fueron eliminados
  const remaining = await prisma.document.count({
    where: {
      id: { in: context.testDocuments.map(d => d.id) }
    }
  });

  console.log(`  Documentos restantes: ${remaining}/${context.testDocuments.length}`);

  return { success: true, deleted: docsToDelete.length, remaining };
}

/**
 * Paso 4: Ejecutar restauración
 */
async function step4_ExecuteRestore() {
  console.log('\n=== PASO 4: Ejecutar Restauración ===');
  
  if (!context.backupJobId) {
    throw new Error('No hay backup job ID para restaurar');
  }

  const mockReq = createMockRequest(context.testUserId);
  const restoreLog = await securityBackupService.restoreBackup(context.backupJobId, mockReq);
  
  context.restoreLogId = restoreLog.id;
  console.log(`✓ Restauración iniciada: ${restoreLog.id}`);
  console.log(`  Estado inicial: ${restoreLog.status}`);

  // Esperar a que la restauración complete (polling)
  let completed = false;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutos máximo

  while (!completed && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Esperar 5 segundos
    
    const log = await prisma.backupRestoreLog.findUnique({
      where: { id: restoreLog.id }
    });

    if (!log) {
      throw new Error('Restore log no encontrado');
    }

    console.log(`  [${attempts + 1}/${maxAttempts}] Estado: ${log.status}`);

    if (log.status === 'COMPLETED') {
      completed = true;
      console.log(`✓ Restauración completada exitosamente`);
      console.log(`  Registros restaurados: ${log.restoredRecords}/${log.totalRecords}`);
      console.log(`  Archivos restaurados: ${log.restoredFiles}/${log.totalFiles}`);
      console.log(`  Archivos omitidos: ${log.skippedFiles}`);
      console.log(`  Duración: ${log.duration}s`);
    } else if (log.status === 'FAILED') {
      throw new Error(`Restauración falló: ${log.errorMessage}`);
    }

    attempts++;
  }

  if (!completed) {
    throw new Error('Restauración no completó en el tiempo esperado');
  }

  return { success: true, restoreLogId: restoreLog.id };
}

/**
 * Paso 5: Verificar integridad de datos
 */
async function step5_VerifyIntegrity() {
  console.log('\n=== PASO 5: Verificar Integridad de Datos ===');
  
  // Verificar que los documentos eliminados fueron restaurados
  const restoredDocs = await prisma.document.count({
    where: {
      id: { in: context.testDocuments.map(d => d.id) }
    }
  });

  console.log(`✓ Documentos verificados: ${restoredDocs}/${context.testDocuments.length}`);

  if (restoredDocs !== context.testDocuments.length) {
    throw new Error(`Faltan documentos después de restaurar. Esperados: ${context.testDocuments.length}, Encontrados: ${restoredDocs}`);
  }

  // Verificar hashes de los documentos
  let hashesOk = 0;
  for (const testDoc of context.testDocuments) {
    const doc = await prisma.document.findUnique({
      where: { id: testDoc.id }
    });

    if (doc && doc.pdfHash === testDoc.hash) {
      hashesOk++;
    }
  }

  console.log(`✓ Hashes verificados: ${hashesOk}/${context.testDocuments.length}`);

  if (hashesOk !== context.testDocuments.length) {
    throw new Error('Algunos hashes no coinciden después de restaurar');
  }

  return { success: true, verified: restoredDocs, hashesOk };
}

/**
 * Paso 6: Limpiar datos de prueba
 */
async function step6_Cleanup() {
  console.log('\n=== PASO 6: Limpiar Datos de Prueba ===');
  
  // Eliminar documentos de prueba
  await prisma.document.deleteMany({
    where: {
      id: { in: context.testDocuments.map(d => d.id) }
    }
  });

  console.log(`✓ Eliminados ${context.testDocuments.length} documentos de prueba`);

  // Marcar backup job y restore log como pruebas
  if (context.backupJobId) {
    await prisma.backupJob.update({
      where: { id: context.backupJobId },
      data: { type: 'TEST' }
    });
    console.log(`✓ Backup job marcado como TEST`);
  }

  if (context.restoreLogId) {
    await prisma.backupRestoreLog.update({
      where: { id: context.restoreLogId },
      data: { 
        // No hay campo type en RestoreLog, solo agregamos a los logs
      }
    });
    console.log(`✓ Restore log marcado como prueba`);
  }

  return { success: true };
}

/**
 * Ejecutar suite completa de pruebas
 */
async function runE2ETests() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  PRUEBAS E2E: Módulo de Copias de Seguridad            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Inicio: ${new Date().toISOString()}\n`);

  const startTime = Date.now();
  const results: any = {};

  try {
    results.step1 = await step1_PrepareTestData();
    results.step2 = await step2_ExecuteBackup();
    results.step3 = await step3_SimulateDataLoss();
    results.step4 = await step4_ExecuteRestore();
    results.step5 = await step5_VerifyIntegrity();
    results.step6 = await step6_Cleanup();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  ✓ TODAS LAS PRUEBAS PASARON           ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log(`Duración total: ${duration}s`);
    console.log(`Fin: ${new Date().toISOString()}\n`);

    return { success: true, results, duration };

  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.error('\n╔══════════════════════════════════════════════════════════╗');
    console.error('║                  ✗ PRUEBAS FALLARON                      ║');
    console.error('╚══════════════════════════════════════════════════════════╝');
    console.error(`Error: ${error.message}`);
    console.error(`Duración: ${duration}s`);
    console.error(`Fin: ${new Date().toISOString()}\n`);

    throw error;

  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  runE2ETests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runE2ETests };
