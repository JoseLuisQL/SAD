import prisma from '../config/database';

async function fixDocument009Versions() {
  console.log('🔧 Corrigiendo versiones del documento 009-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '009-2025' },
      include: {
        versions: { orderBy: { versionNumber: 'asc' } }
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Estado actual:');
    console.log(`  Versión actual del documento: ${doc.currentVersion}`);
    console.log(`  Versiones guardadas: ${doc.versions.map(v => v.versionNumber).join(', ')}`);
    console.log();

    // El documento tiene una versión 2 que debería ser versión 1
    const wrongVersion = doc.versions.find(v => v.versionNumber === 2);
    
    if (!wrongVersion) {
      console.log('❌ No se encontró la versión 2 para corregir');
      return;
    }

    console.log('🔄 Corrigiendo...');
    console.log(`  Renumerando versión 2 → versión 1`);
    console.log(`  Cambiando descripción: "${wrongVersion.changeDescription}" → "Versión original sin firma"`);
    console.log();

    // Actualizar la versión
    await prisma.documentVersion.update({
      where: { id: wrongVersion.id },
      data: {
        versionNumber: 1,
        changeDescription: 'Versión original sin firma'
      }
    });

    console.log('✅ Versión corregida!');
    console.log();

    // Verificar
    const updatedDoc = await prisma.document.findUnique({
      where: { id: doc.id },
      include: {
        versions: { orderBy: { versionNumber: 'asc' } }
      }
    });

    console.log('📊 Estado final:');
    console.log(`  Versión actual del documento: ${updatedDoc?.currentVersion}`);
    console.log(`  Versiones guardadas: ${updatedDoc?.versions.map(v => v.versionNumber).join(', ')}`);
    updatedDoc?.versions.forEach(v => {
      console.log(`    - Versión ${v.versionNumber}: ${v.changeDescription}`);
    });
    console.log();
    console.log('✅ ¡Documento corregido! Ahora tiene la versión 1 (sin firma) correctamente guardada.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDocument009Versions();
