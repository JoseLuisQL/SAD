import prisma from '../config/database';
import * as versionsService from '../services/versions.service';

async function testCompare011() {
  console.log('🔍 Probando comparación de versiones documento 011-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '011-2025' },
      include: {
        versions: { orderBy: { versionNumber: 'asc' } }
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Documento encontrado:');
    console.log(`  ID: ${doc.id}`);
    console.log(`  Versión actual: ${doc.currentVersion}`);
    console.log();

    // Obtener todas las versiones
    const allVersions = await versionsService.getAllVersions(doc.id);
    
    console.log(`📚 Versiones disponibles: ${allVersions.length}`);
    allVersions.forEach(v => {
      console.log(`  - Versión ${v.versionNumber}:`);
      console.log(`    ID: ${v.id}`);
      console.log(`    Descripción: ${v.changeDescription}`);
      console.log(`    Es actual: ${v.isCurrent}`);
    });
    console.log();

    // Intentar comparar
    const v1 = allVersions.find(v => v.versionNumber === 1);
    const v2 = allVersions.find(v => v.versionNumber === 2);

    if (!v1 || !v2) {
      console.log('❌ No se encontraron ambas versiones para comparar');
      return;
    }

    console.log(`🔄 Comparando:`);
    console.log(`  Versión 1 ID: ${v1.id}`);
    console.log(`  Versión 2 ID: ${v2.id}`);
    console.log();

    const comparison = await versionsService.compareVersions(v1.id, v2.id);

    console.log('📊 Resultado de comparación:');
    console.log(`  Version 1:`);
    console.log(`    Número: ${comparison.version1.versionNumber}`);
    console.log(`    Descripción: ${comparison.version1.changeDescription}`);
    console.log(`    Tamaño: ${(comparison.version1.fileSize / 1024).toFixed(2)} KB`);
    console.log();
    console.log(`  Version 2:`);
    console.log(`    Número: ${comparison.version2.versionNumber}`);
    console.log(`    Descripción: ${comparison.version2.changeDescription}`);
    console.log(`    Tamaño: ${(comparison.version2.fileSize / 1024).toFixed(2)} KB`);
    console.log();
    console.log(`  Diferencias:`);
    console.log(`    Versiones: ${comparison.differences.versionNumber}`);
    console.log(`    Tamaño: ${(comparison.differences.sizeChange / 1024).toFixed(2)} KB`);
    console.log(`    Firmas: ${comparison.differences.signaturesAdded}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompare011();
