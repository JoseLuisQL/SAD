import prisma from '../config/database';

async function checkVersions() {
  console.log('🔍 Verificando versiones del documento 005-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '005-2025' },
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
      console.log(`    ID: ${v.id}`);
      console.log(`    Archivo: ${v.fileName}`);
      console.log(`    Descripción: ${v.changeDescription}`);
    });
    console.log();

    console.log(`✍️ Firmas activas: ${doc.signatures.length}`);
    console.log();

    // Problema identificado
    if (doc.currentVersion === 2 && doc.versions.length === 0) {
      console.log('⚠️  PROBLEMA IDENTIFICADO:');
      console.log('   - El documento está en versión 2 (firmado)');
      console.log('   - Pero NO hay versiones guardadas en la base de datos');
      console.log('   - Esto significa que la versión 1 nunca se guardó');
      console.log('   - El sistema está creando una versión virtual que apunta al archivo actual (firmado)');
    } else if (doc.currentVersion === 2 && doc.versions.length === 1) {
      console.log('✅ Configuración correcta:');
      console.log('   - Versión 1 guardada en la base de datos (sin firma)');
      console.log('   - Versión 2 es el documento actual (firmado)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVersions();
