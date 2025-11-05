import prisma from '../config/database';

async function checkDocument009() {
  console.log('🔍 Verificando documento 009-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '009-2025' },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' }
        },
        signatures: {
          where: { isReverted: false }
        }
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Documento:');
    console.log(`  ID: ${doc.id}`);
    console.log(`  Versión actual: ${doc.currentVersion}`);
    console.log(`  Estado de firma: ${doc.signatureStatus}`);
    console.log(`  Archivo actual: ${doc.fileName}`);
    console.log(`  Ruta: ${doc.filePath}`);
    console.log(`  Tamaño: ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log();

    console.log(`📚 Versiones guardadas: ${doc.versions.length}`);
    doc.versions.forEach(v => {
      console.log(`  - Versión ${v.versionNumber}:`);
      console.log(`    ID: ${v.id}`);
      console.log(`    Archivo: ${v.fileName}`);
      console.log(`    Ruta: ${v.filePath}`);
      console.log(`    Descripción: ${v.changeDescription}`);
      console.log(`    Creada: ${v.createdAt}`);
    });
    console.log();

    console.log(`✍️ Firmas activas: ${doc.signatures.length}`);
    doc.signatures.forEach(s => {
      console.log(`  - Firma ID: ${s.id}`);
      console.log(`    Version ID: ${s.documentVersionId || 'null'}`);
      console.log(`    Status: ${s.status}`);
      console.log(`    Timestamp: ${s.timestamp}`);
    });
    console.log();

    // Análisis
    if (doc.currentVersion === 2 && doc.versions.length === 1) {
      const v1 = doc.versions.find(v => v.versionNumber === 1);
      if (v1) {
        console.log('✅ CORRECTO:');
        console.log('   - Versión 1 guardada (original sin firma)');
        console.log('   - Versión 2 es el archivo actual (firmado)');
        console.log(`   - Archivo versión 1: ${v1.fileName}`);
        console.log(`   - Archivo actual (v2): ${doc.fileName}`);
        console.log(`   - Son diferentes: ${v1.fileName !== doc.fileName ? 'SÍ' : 'NO'}`);
      } else {
        console.log('❌ PROBLEMA: Versión guardada no es la versión 1');
      }
    } else if (doc.currentVersion === 2 && doc.versions.length === 0) {
      console.log('❌ PROBLEMA: No hay versiones guardadas');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocument009();
