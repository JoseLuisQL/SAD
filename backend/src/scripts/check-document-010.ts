import prisma from '../config/database';

async function checkDocument010() {
  console.log('🔍 Verificando documento 010-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '010-2025' },
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
    console.log(`  Tamaño: ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`);
    console.log();

    console.log(`📚 Versiones guardadas: ${doc.versions.length}`);
    doc.versions.forEach(v => {
      console.log(`  - Versión ${v.versionNumber}:`);
      console.log(`    Archivo: ${v.fileName}`);
      console.log(`    Descripción: ${v.changeDescription}`);
      console.log(`    Fecha: ${v.createdAt}`);
    });
    console.log();

    console.log(`✍️ Firmas activas: ${doc.signatures.length}`);
    doc.signatures.forEach(s => {
      console.log(`  - Version ID: ${s.documentVersionId || 'null'}`);
      console.log(`    Status: ${s.status}`);
    });
    console.log();

    // Análisis
    if (doc.currentVersion === 2 && doc.versions.length === 1) {
      const v1 = doc.versions[0];
      console.log('✅ CORRECTO:');
      console.log('   - Documento está en versión 2 (firmado)');
      console.log('   - Tiene guardada la versión 1 (sin firma)');
      console.log(`   - Archivo v1: ${v1.fileName}`);
      console.log(`   - Archivo actual (v2): ${doc.fileName}`);
      console.log(`   - Son diferentes: ${v1.fileName !== doc.fileName ? 'SÍ' : 'NO'}`);
    } else if (doc.currentVersion === 1 && doc.versions.length === 0) {
      console.log('✅ CORRECTO (sin firmar):');
      console.log('   - Documento en versión 1');
      console.log('   - No hay versiones guardadas (versión virtual)');
    } else {
      console.log('⚠️  Estado inesperado:');
      console.log(`   - Versión actual: ${doc.currentVersion}`);
      console.log(`   - Versiones guardadas: ${doc.versions.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocument010();
