/**
 * Pruebas de Estrés para el Módulo de Backup
 * 
 * Genera un volumen alto de documentos y PDFs para validar:
 * - Deduplicación de archivos por hash
 * - Compresión de paquetes ZIP
 * - Tiempos de procesamiento aceptables
 * - Manejo de memoria
 */

import prisma from '../src/config/database';
import * as securityBackupService from '../src/services/security-backup.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

interface StressTestConfig {
  totalDocuments: number;
  uniquePDFs: number; // Número de PDFs únicos (el resto serán duplicados)
  pdfSizeKB: number; // Tamaño aproximado de cada PDF
}

interface StressTestResults {
  config: StressTestConfig;
  documentsCreated: number;
  uniqueFilesCreated: number;
  duplicatesCreated: number;
  backupDuration: number;
  backupSize: number;
  compressionRatio: number;
  deduplicationEfficiency: number;
  avgTimePerDocument: number;
  success: boolean;
}

// Generar contenido pseudo-aleatorio para PDFs
function generatePDFContent(index: number, size: number): Buffer {
  const header = `%PDF-1.4\n%Test Document ${index}\n`;
  const content = `Test content for document ${index}.\n`;
  const padding = 'X'.repeat(Math.max(0, size - header.length - content.length - 10));
  const footer = '\n%%EOF\n';
  
  return Buffer.from(header + content + padding + footer);
}

async function runStressTest(config: StressTestConfig): Promise<StressTestResults> {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         Pruebas de Estrés - Módulo de Backup           ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log('Configuración:');
  console.log(`   Total documentos: ${config.totalDocuments}`);
  console.log(`   PDFs únicos: ${config.uniquePDFs}`);
  console.log(`   PDFs duplicados: ${config.totalDocuments - config.uniquePDFs}`);
  console.log(`   Tamaño por PDF: ${config.pdfSizeKB} KB`);
  console.log(`   Tamaño total sin dedup: ${(config.totalDocuments * config.pdfSizeKB / 1024).toFixed(2)} MB`);
  console.log(`   Tamaño esperado con dedup: ${(config.uniquePDFs * config.pdfSizeKB / 1024).toFixed(2)} MB\n`);

  const startTime = Date.now();
  const results: Partial<StressTestResults> = {
    config,
    documentsCreated: 0,
    uniqueFilesCreated: 0,
    duplicatesCreated: 0,
    success: false
  };

  try {
    // Paso 1: Obtener datos necesarios para crear documentos
    console.log('1. Preparando datos de prueba...');
    
    const testUser = await prisma.user.findFirst({
      where: { username: { contains: 'admin' } }
    });
    
    if (!testUser) {
      throw new Error('No se encontró usuario administrador');
    }

    const documentType = await prisma.documentType.findFirst();
    const office = await prisma.office.findFirst();
    const period = await prisma.period.findFirst();

    if (!documentType || !office || !period) {
      throw new Error('Faltan datos maestros requeridos');
    }

    // Paso 2: Crear directorio temporal para PDFs
    const tempDir = path.join(process.cwd(), 'temp_stress_test');
    await fs.mkdir(tempDir, { recursive: true });
    console.log(`   ✓ Directorio temporal: ${tempDir}`);

    // Paso 3: Generar PDFs únicos
    console.log('\n2. Generando PDFs únicos...');
    const uniquePDFs: Array<{ path: string; hash: string; size: number }> = [];
    
    for (let i = 0; i < config.uniquePDFs; i++) {
      const content = generatePDFContent(i, config.pdfSizeKB * 1024);
      const hash = createHash('sha256').update(content).digest('hex');
      const fileName = `stress_test_${hash.substring(0, 16)}.pdf`;
      const filePath = path.join(tempDir, fileName);
      
      await fs.writeFile(filePath, content);
      uniquePDFs.push({ path: filePath, hash, size: content.length });
      
      if ((i + 1) % 100 === 0) {
        console.log(`   Progreso: ${i + 1}/${config.uniquePDFs} PDFs únicos creados`);
      }
    }
    
    results.uniqueFilesCreated = uniquePDFs.length;
    console.log(`   ✓ Creados ${uniquePDFs.length} PDFs únicos`);

    // Paso 4: Crear documentos en la base de datos
    console.log('\n3. Creando documentos en base de datos...');
    const documentsToCreate = [];
    
    for (let i = 0; i < config.totalDocuments; i++) {
      // Seleccionar PDF (único o duplicado)
      const pdfIndex = i < config.uniquePDFs ? i : Math.floor(Math.random() * config.uniquePDFs);
      const pdf = uniquePDFs[pdfIndex];
      
      documentsToCreate.push({
        code: `STRESS-TEST-${Date.now()}-${i}`,
        title: `Documento de Estrés ${i}`,
        description: 'Documento para pruebas de estrés',
        documentTypeId: documentType.id,
        officeId: office.id,
        periodId: period.id,
        createdBy: testUser.id,
        currentVersion: 1,
        pdfPath: pdf.path,
        pdfHash: pdf.hash,
        pdfSize: pdf.size,
        ocrText: `Documento de prueba ${i}`,
        currentStatus: 'VIGENTE'
      });
      
      // Insertar en lotes de 100
      if (documentsToCreate.length >= 100) {
        await prisma.document.createMany({ data: documentsToCreate });
        results.documentsCreated! += documentsToCreate.length;
        console.log(`   Progreso: ${results.documentsCreated}/${config.totalDocuments} documentos creados`);
        documentsToCreate.length = 0;
      }
    }
    
    // Insertar los restantes
    if (documentsToCreate.length > 0) {
      await prisma.document.createMany({ data: documentsToCreate });
      results.documentsCreated! += documentsToCreate.length;
    }
    
    results.duplicatesCreated = results.documentsCreated! - config.uniquePDFs;
    console.log(`   ✓ Creados ${results.documentsCreated} documentos`);
    console.log(`   ✓ ${results.duplicatesCreated} duplicados (para probar deduplicación)`);

    // Paso 5: Ejecutar backup
    console.log('\n4. Ejecutando backup...');
    const backupStartTime = Date.now();
    
    const mockReq = {
      user: { id: testUser.id },
      ip: '127.0.0.1',
      get: (header: string) => header === 'user-agent' ? 'Stress Test' : null
    } as any;
    
    const backupJob = await securityBackupService.createBackup(mockReq);
    console.log(`   ✓ Backup iniciado: ${backupJob.id}`);

    // Esperar a que complete
    let completed = false;
    let attempts = 0;
    const maxAttempts = 120; // 10 minutos máximo
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const job = await prisma.backupJob.findUnique({
        where: { id: backupJob.id }
      });

      if (!job) break;
      
      if (attempts % 6 === 0) { // Cada 30 segundos
        const elapsed = Math.floor((Date.now() - backupStartTime) / 1000);
        console.log(`   [${elapsed}s] Estado: ${job.status}`);
      }

      if (job.status === 'COMPLETED') {
        completed = true;
        results.backupDuration = job.duration || 0;
        results.backupSize = job.totalSize;
        
        console.log(`\n   ✓ Backup completado exitosamente`);
        console.log(`   Duración: ${results.backupDuration}s`);
        console.log(`   Tamaño paquete: ${(results.backupSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`   Archivos en paquete: ${job.totalFiles}`);
        
        // Calcular métricas
        const expectedSizeWithoutDedup = config.totalDocuments * config.pdfSizeKB * 1024;
        const expectedSizeWithDedup = config.uniquePDFs * config.pdfSizeKB * 1024;
        
        results.compressionRatio = expectedSizeWithDedup / results.backupSize;
        results.deduplicationEfficiency = 1 - (results.backupSize / expectedSizeWithoutDedup);
        results.avgTimePerDocument = results.backupDuration / config.totalDocuments;
        
      } else if (job.status === 'FAILED') {
        throw new Error(`Backup falló: ${job.errorMessage}`);
      }
      
      attempts++;
    }

    if (!completed) {
      throw new Error('Backup no completó en el tiempo esperado');
    }

    // Paso 6: Limpieza
    console.log('\n5. Limpiando datos de prueba...');
    
    // Eliminar documentos
    await prisma.document.deleteMany({
      where: { code: { startsWith: 'STRESS-TEST-' } }
    });
    console.log(`   ✓ Eliminados ${results.documentsCreated} documentos`);
    
    // Eliminar archivos temporales
    await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`   ✓ Eliminado directorio temporal`);

    // Paso 7: Resultados finales
    results.success = true;
    
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  Resultados Finales                     ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    console.log(`✓ Documentos procesados: ${results.documentsCreated}`);
    console.log(`✓ PDFs únicos: ${results.uniqueFilesCreated}`);
    console.log(`✓ PDFs duplicados: ${results.duplicatesCreated}`);
    console.log(`✓ Duración backup: ${results.backupDuration}s (${(results.backupDuration! / 60).toFixed(2)}m)`);
    console.log(`✓ Tiempo promedio por documento: ${(results.avgTimePerDocument! * 1000).toFixed(2)}ms`);
    console.log(`✓ Tamaño sin deduplicación: ${(expectedSizeWithoutDedup / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✓ Tamaño con deduplicación: ${(results.backupSize! / 1024 / 1024).toFixed(2)} MB`);
    console.log(`✓ Eficiencia deduplicación: ${(results.deduplicationEfficiency! * 100).toFixed(2)}%`);
    console.log(`✓ Ratio de compresión: ${results.compressionRatio!.toFixed(2)}x`);
    
    // Evaluar rendimiento
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║                  Evaluación de Rendimiento              ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');
    
    const evaluations = [];
    
    // Evaluar tiempo por documento
    if (results.avgTimePerDocument! < 0.05) { // < 50ms
      evaluations.push('✓ Excelente: < 50ms por documento');
    } else if (results.avgTimePerDocument! < 0.1) { // < 100ms
      evaluations.push('✓ Bueno: < 100ms por documento');
    } else if (results.avgTimePerDocument! < 0.2) { // < 200ms
      evaluations.push('⚠ Aceptable: < 200ms por documento');
    } else {
      evaluations.push('✗ Lento: > 200ms por documento - considerar optimizaciones');
    }
    
    // Evaluar deduplicación
    if (results.deduplicationEfficiency! > 0.5) {
      evaluations.push(`✓ Deduplicación efectiva: ${(results.deduplicationEfficiency! * 100).toFixed(2)}% de ahorro`);
    } else {
      evaluations.push(`⚠ Deduplicación baja: ${(results.deduplicationEfficiency! * 100).toFixed(2)}% de ahorro`);
    }
    
    // Evaluar compresión
    if (results.compressionRatio! > 2) {
      evaluations.push(`✓ Compresión excelente: ${results.compressionRatio!.toFixed(2)}x`);
    } else if (results.compressionRatio! > 1.5) {
      evaluations.push(`✓ Compresión buena: ${results.compressionRatio!.toFixed(2)}x`);
    } else {
      evaluations.push(`⚠ Compresión moderada: ${results.compressionRatio!.toFixed(2)}x`);
    }
    
    evaluations.forEach(e => console.log(e));
    
    const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n✓ Prueba completa en ${totalTime} minutos`);

    return results as StressTestResults;

  } catch (error) {
    console.error('\n✗ Error en prueba de estrés:', error);
    throw error;
    
  } finally {
    await prisma.$disconnect();
  }
}

// Configuraciones predefinidas
const PRESETS: Record<string, StressTestConfig> = {
  small: {
    totalDocuments: 100,
    uniquePDFs: 50,
    pdfSizeKB: 100
  },
  medium: {
    totalDocuments: 1000,
    uniquePDFs: 500,
    pdfSizeKB: 200
  },
  large: {
    totalDocuments: 5000,
    uniquePDFs: 2000,
    pdfSizeKB: 300
  },
  extreme: {
    totalDocuments: 10000,
    uniquePDFs: 3000,
    pdfSizeKB: 500
  }
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  const preset = process.argv[2] || 'small';
  
  if (!PRESETS[preset]) {
    console.error(`Preset inválido: ${preset}`);
    console.error(`Opciones disponibles: ${Object.keys(PRESETS).join(', ')}`);
    process.exit(1);
  }
  
  console.log(`Ejecutando prueba con preset: ${preset}`);
  
  runStressTest(PRESETS[preset])
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { runStressTest, PRESETS };
