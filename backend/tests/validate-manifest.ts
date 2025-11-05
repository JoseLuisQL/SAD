/**
 * Script de Validación de Manifiestos de Backup
 * 
 * Valida que los manifiestos permiten identificar exactamente
 * desde qué fecha existen datos pendientes y verifica la integridad.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import prisma from '../src/config/database';

interface ManifestData {
  version: string;
  createdAt: string;
  type: string;
  database: {
    documents: { count: number; file: string; since?: string };
    versions: { count: number; file: string; since?: string };
    signatures: { count: number; file: string; since?: string };
  };
  documents: {
    count: number;
    totalSize: number;
    files: Array<{
      relativePath: string;
      hash: string;
      size: number;
    }>;
  };
}

async function validateManifest(manifestPath: string) {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║        Validación de Manifiesto de Backup              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  console.log(`Archivo: ${manifestPath}\n`);

  // 1. Leer y parsear manifiesto
  console.log('1. Leyendo manifiesto...');
  const manifestContent = await fs.readFile(manifestPath, 'utf-8');
  const manifest: ManifestData = JSON.parse(manifestContent);
  
  console.log(`   ✓ Versión: ${manifest.version}`);
  console.log(`   ✓ Fecha creación: ${manifest.createdAt}`);
  console.log(`   ✓ Tipo: ${manifest.type}`);

  // 2. Validar fechas de datos pendientes
  console.log('\n2. Validando fechas de datos pendientes...');
  
  if (manifest.database.documents.since) {
    console.log(`   ✓ Documentos desde: ${manifest.database.documents.since}`);
    const sinceDate = new Date(manifest.database.documents.since);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - sinceDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log(`     (${daysDiff} días de antigüedad)`);
  } else {
    console.log(`   ✓ Documentos: Backup completo (sin fecha desde)`);
  }

  if (manifest.database.versions.since) {
    console.log(`   ✓ Versiones desde: ${manifest.database.versions.since}`);
  }

  if (manifest.database.signatures.since) {
    console.log(`   ✓ Firmas desde: ${manifest.database.signatures.since}`);
  }

  // 3. Validar conteos
  console.log('\n3. Validando conteos...');
  console.log(`   ✓ Documentos en BD: ${manifest.database.documents.count}`);
  console.log(`   ✓ Versiones en BD: ${manifest.database.versions.count}`);
  console.log(`   ✓ Firmas en BD: ${manifest.database.signatures.count}`);
  console.log(`   ✓ Archivos PDF: ${manifest.documents.count}`);
  console.log(`   ✓ Tamaño total: ${(manifest.documents.totalSize / 1024 / 1024).toFixed(2)} MB`);

  // 4. Validar hashes de archivos
  console.log('\n4. Validando hashes de archivos...');
  const backupDir = path.dirname(manifestPath);
  const documentsDir = path.join(backupDir, 'documents');
  
  let hashesValidados = 0;
  let hashesInvalidos = 0;
  let archivosNoEncontrados = 0;

  for (const file of manifest.documents.files) {
    const filePath = path.join(documentsDir, file.relativePath);
    
    try {
      const fileContent = await fs.readFile(filePath);
      const calculatedHash = createHash('sha256').update(fileContent).digest('hex');
      
      if (calculatedHash === file.hash) {
        hashesValidados++;
      } else {
        hashesInvalidos++;
        console.log(`   ✗ Hash inválido: ${file.relativePath}`);
        console.log(`     Esperado: ${file.hash}`);
        console.log(`     Calculado: ${calculatedHash}`);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        archivosNoEncontrados++;
        console.log(`   ✗ Archivo no encontrado: ${file.relativePath}`);
      } else {
        throw error;
      }
    }
  }

  console.log(`   ✓ Hashes validados: ${hashesValidados}/${manifest.documents.count}`);
  
  if (hashesInvalidos > 0) {
    console.log(`   ✗ Hashes inválidos: ${hashesInvalidos}`);
  }
  
  if (archivosNoEncontrados > 0) {
    console.log(`   ✗ Archivos no encontrados: ${archivosNoEncontrados}`);
  }

  // 5. Validar archivos JSONL de base de datos
  console.log('\n5. Validando archivos de base de datos...');
  const databaseDir = path.join(backupDir, 'database');
  
  const dbFiles = [
    { name: 'documents.jsonl', expected: manifest.database.documents.count },
    { name: 'versions.jsonl', expected: manifest.database.versions.count },
    { name: 'signatures.jsonl', expected: manifest.database.signatures.count }
  ];

  for (const dbFile of dbFiles) {
    const filePath = path.join(databaseDir, dbFile.name);
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      const actualCount = lines.length;
      
      if (actualCount === dbFile.expected) {
        console.log(`   ✓ ${dbFile.name}: ${actualCount} registros`);
      } else {
        console.log(`   ✗ ${dbFile.name}: Esperados ${dbFile.expected}, encontrados ${actualCount}`);
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log(`   ✗ ${dbFile.name}: Archivo no encontrado`);
      } else {
        throw error;
      }
    }
  }

  // 6. Resumen de validación
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                  Resumen de Validación                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  const isValid = hashesInvalidos === 0 && archivosNoEncontrados === 0;
  
  if (isValid) {
    console.log('   ✓ MANIFIESTO VÁLIDO: Todos los checks pasaron');
  } else {
    console.log('   ✗ MANIFIESTO INVÁLIDO: Se encontraron errores');
  }
  
  console.log(`\n   Archivos validados: ${hashesValidados}`);
  console.log(`   Hashes inválidos: ${hashesInvalidos}`);
  console.log(`   Archivos faltantes: ${archivosNoEncontrados}`);
  console.log(`   Fecha datos pendientes desde: ${manifest.database.documents.since || 'N/A'}`);

  return {
    isValid,
    hashesValidados,
    hashesInvalidos,
    archivosNoEncontrados,
    manifest
  };
}

async function validateCurrentBackupSummary() {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║    Validación de Datos Pendientes vs Frontend          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Obtener último backup exitoso
  const lastSuccessfulBackup = await prisma.backupJob.findFirst({
    where: { status: 'COMPLETED' },
    orderBy: { completedAt: 'desc' }
  });

  let sinceDate: Date;
  
  if (lastSuccessfulBackup && lastSuccessfulBackup.completedAt) {
    sinceDate = lastSuccessfulBackup.completedAt;
    console.log(`Último backup exitoso: ${sinceDate.toISOString()}`);
  } else {
    console.log('No hay backups exitosos previos, contando todos los registros');
    sinceDate = new Date(0); // Epoch
  }

  // Contar datos pendientes
  const pendingDocuments = await prisma.document.count({
    where: {
      OR: [
        { createdAt: { gt: sinceDate } },
        { updatedAt: { gt: sinceDate } }
      ]
    }
  });

  const pendingVersions = await prisma.documentVersion.count({
    where: { createdAt: { gt: sinceDate } }
  });

  const pendingSignatures = await prisma.signature.count({
    where: { signedAt: { gt: sinceDate } }
  });

  console.log(`\nDatos pendientes desde ${sinceDate.toISOString()}:`);
  console.log(`   Documentos: ${pendingDocuments}`);
  console.log(`   Versiones: ${pendingVersions}`);
  console.log(`   Firmas: ${pendingSignatures}`);
  console.log(`   Total: ${pendingDocuments + pendingVersions + pendingSignatures}`);

  // Calcular tamaño estimado
  const documentsWithSize = await prisma.document.findMany({
    where: {
      OR: [
        { createdAt: { gt: sinceDate } },
        { updatedAt: { gt: sinceDate } }
      ]
    },
    select: { pdfSize: true }
  });

  const totalSize = documentsWithSize.reduce((sum, doc) => sum + (doc.pdfSize || 0), 0);
  console.log(`   Tamaño estimado: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

  console.log('\n✓ Esta información debe coincidir con el frontend en /dashboard/seguridad/copias');

  return {
    sinceDate,
    pendingDocuments,
    pendingVersions,
    pendingSignatures,
    totalSize
  };
}

// Ejecutar validaciones
async function runValidations() {
  try {
    // Primero validar datos pendientes actuales
    await validateCurrentBackupSummary();

    // Luego validar el último backup si existe
    const lastBackup = await prisma.backupJob.findFirst({
      where: { status: 'COMPLETED', packagePath: { not: null } },
      orderBy: { completedAt: 'desc' }
    });

    if (lastBackup && lastBackup.packagePath) {
      console.log(`\nValidando último backup: ${lastBackup.packagePath}`);
      
      // Buscar el manifiesto en el paquete extraído o extraerlo temporalmente
      const backupDir = lastBackup.packagePath.replace('.zip', '');
      const manifestPath = path.join(backupDir, 'manifest.json');
      
      if (await fs.access(manifestPath).then(() => true).catch(() => false)) {
        await validateManifest(manifestPath);
      } else {
        console.log('   Nota: Paquete ZIP no extraído. Extráigalo manualmente para validar manifest.');
      }
    } else {
      console.log('\nNo hay backups completados para validar.');
    }

  } catch (error) {
    console.error('Error en validación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const manifestPath = process.argv[2];
  
  if (manifestPath) {
    // Validar manifiesto específico
    validateManifest(manifestPath)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    // Validar datos pendientes actuales
    runValidations()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  }
}

export { validateManifest, validateCurrentBackupSummary };
