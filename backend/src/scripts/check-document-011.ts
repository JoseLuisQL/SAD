import prisma from '../config/database';

async function checkDocument011() {
  console.log('🔍 Verificando documento 011-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '011-2025' },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' },
          include: {
            signatures: true
          }
        },
        signatures: true
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Documento:');
    console.log(`  ID: ${doc.id}`);
    console.log(`  Versión actual: ${doc.currentVersion}`);
    console.log(`  Estado: ${doc.signatureStatus}`);
    console.log();

    console.log(`📚 Versiones guardadas: ${doc.versions.length}`);
    doc.versions.forEach(v => {
      console.log(`  - Versión ${v.versionNumber}:`);
      console.log(`    Descripción: ${v.changeDescription}`);
      console.log(`    Firmas asociadas: ${v.signatures.length}`);
      v.signatures.forEach(s => {
        console.log(`      * Firma ID: ${s.id}, Status: ${s.status}`);
      });
    });
    console.log();

    console.log(`✍️ Firmas totales del documento: ${doc.signatures.length}`);
    doc.signatures.forEach(s => {
      console.log(`  - Firma ID: ${s.id}`);
      console.log(`    Version ID: ${s.documentVersionId || 'null'}`);
      console.log(`    Status: ${s.status}`);
    });
    console.log();

    // Análisis
    const v1 = doc.versions.find(v => v.versionNumber === 1);
    if (v1 && v1.signatures.length > 0) {
      console.log('❌ PROBLEMA IDENTIFICADO:');
      console.log('   - La versión 1 tiene firmas asociadas');
      console.log('   - Las firmas NO deberían estar en la versión sin firma');
      console.log('   - Las firmas deberían estar sin documentVersionId (en la versión actual)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocument011();
