import prisma from '../config/database';

async function fixDocument011Signature() {
  console.log('🔧 Corrigiendo firmas del documento 011-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '011-2025' },
      include: {
        versions: { orderBy: { versionNumber: 'asc' } },
        signatures: true
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Estado actual:');
    console.log(`  Versión actual: ${doc.currentVersion}`);
    console.log(`  Firmas totales: ${doc.signatures.length}`);
    console.log();

    const v1 = doc.versions.find(v => v.versionNumber === 1);
    const signaturesOnV1 = doc.signatures.filter(s => s.documentVersionId === v1?.id);

    console.log(`🔍 Firmas asociadas incorrectamente a versión 1: ${signaturesOnV1.length}`);
    signaturesOnV1.forEach(s => {
      console.log(`  - Firma ID: ${s.id}`);
    });
    console.log();

    if (signaturesOnV1.length > 0) {
      console.log('🔄 Corrigiendo asociación de firmas...');
      console.log('   Moviendo firmas de versión 1 → NULL (versión actual)');
      console.log();

      for (const signature of signaturesOnV1) {
        await prisma.signature.update({
          where: { id: signature.id },
          data: { documentVersionId: null }
        });
        console.log(`  ✅ Firma ${signature.id} actualizada`);
      }

      console.log();
      console.log('✅ Firmas corregidas!');
      console.log();

      // Verificar
      const updatedDoc = await prisma.document.findUnique({
        where: { id: doc.id },
        include: {
          versions: {
            orderBy: { versionNumber: 'asc' },
            include: { signatures: true }
          },
          signatures: true
        }
      });

      console.log('📊 Estado final:');
      updatedDoc?.versions.forEach(v => {
        console.log(`  - Versión ${v.versionNumber}:`);
        console.log(`    Firmas asociadas: ${v.signatures.length}`);
      });

      const signaturesWithoutVersion = updatedDoc?.signatures.filter(s => s.documentVersionId === null).length || 0;
      console.log(`  - Firmas en versión actual (NULL): ${signaturesWithoutVersion}`);
      console.log();
      console.log('✅ ¡Documento corregido! Ahora:');
      console.log('   - Versión 1 = Sin firmas (archivo sin firmar)');
      console.log('   - Versión 2 (actual) = Con firmas (archivo firmado)');
    } else {
      console.log('✅ No hay firmas que corregir');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDocument011Signature();
