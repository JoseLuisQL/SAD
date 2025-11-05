import prisma from '../config/database';

async function fixMissingVersion1() {
  console.log('🔧 Corrigiendo documentos sin versión 1...\n');

  try {
    // Obtener documentos firmados (versión > 1)
    const documents = await prisma.document.findMany({
      where: {
        currentVersion: {
          gt: 1
        }
      },
      include: {
        versions: {
          orderBy: { versionNumber: 'asc' }
        }
      }
    });

    console.log(`📄 Documentos firmados encontrados: ${documents.length}\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;

    for (const doc of documents) {
      const hasVersion1 = doc.versions.some(v => v.versionNumber === 1);

      if (!hasVersion1) {
        console.log(`⚠️  Documento ${doc.documentNumber}:`);
        console.log(`   - Versión actual: ${doc.currentVersion}`);
        console.log(`   - Versiones guardadas: ${doc.versions.map(v => v.versionNumber).join(', ')}`);
        console.log(`   - ❌ Falta la versión 1`);
        
        // Este documento tiene versiones pero le falta la versión 1
        // La versión más antigua guardada debería ser renumerada
        if (doc.versions.length > 0) {
          const oldestVersion = doc.versions[0];
          
          // Verificar si la versión más antigua es la versión firmada
          // (descripción contiene "firmado digitalmente")
          if (oldestVersion.changeDescription?.includes('firmado digitalmente')) {
            console.log(`   - ⚠️  PROBLEMA: La versión ${oldestVersion.versionNumber} guardada es el documento FIRMADO`);
            console.log(`   - Esta versión debería ser la original SIN firma`);
            console.log(`   - El archivo actual del documento es el correcto (firmado)`);
            console.log(`   - Solución: Marcar como caso especial y usar archivo actual para versión virtual\n`);
            
            // En este caso, NO podemos recuperar el archivo sin firma
            // La versión 1 virtual tendrá que apuntar al archivo firmado (es lo mejor que podemos hacer)
          } else {
            console.log(`   - Esta versión podría ser renumerada a versión 1\n`);
          }
        }
        
        fixedCount++;
      } else {
        alreadyCorrectCount++;
        console.log(`✅ Documento ${doc.documentNumber}: Tiene versión 1 correcta`);
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  - Documentos con problema: ${fixedCount}`);
    console.log(`  - Documentos correctos: ${alreadyCorrectCount}`);
    
    if (fixedCount > 0) {
      console.log('\n⚠️  ADVERTENCIA:');
      console.log('  No se puede recuperar el archivo original sin firma.');
      console.log('  Los documentos ya están firmados y no se guardó la versión original.');
      console.log('  La solución es:');
      console.log('  1. No mostrar la versión 1 virtual para estos documentos');
      console.log('  2. O aceptar que la versión 1 es el archivo firmado (no ideal)');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMissingVersion1();
