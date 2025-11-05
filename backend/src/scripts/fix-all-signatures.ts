import prisma from '../config/database';

async function fixAllSignatures() {
  console.log('🔧 Corrigiendo todas las firmas mal asociadas...\n');

  try {
    const docs = await prisma.document.findMany({
      where: {
        documentNumber: { in: ['009-2025', '010-2025'] }
      },
      include: {
        versions: { orderBy: { versionNumber: 'asc' } },
        signatures: true
      }
    });

    console.log(`📄 Documentos encontrados: ${docs.length}\n`);

    let fixedCount = 0;

    for (const doc of docs) {
      const v1 = doc.versions.find(v => v.versionNumber === 1);
      
      if (v1) {
        const sigsOnV1 = doc.signatures.filter(s => s.documentVersionId === v1.id);
        
        if (sigsOnV1.length > 0) {
          console.log(`Documento ${doc.documentNumber}:`);
          console.log(`  ❌ ${sigsOnV1.length} firma(s) en versión 1`);
          
          for (const sig of sigsOnV1) {
            await prisma.signature.update({
              where: { id: sig.id },
              data: { documentVersionId: null }
            });
          }
          
          console.log(`  ✅ Corregido\n`);
          fixedCount++;
        } else {
          console.log(`Documento ${doc.documentNumber}: ✅ OK\n`);
        }
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`  - Documentos corregidos: ${fixedCount}`);
    console.log(`  - Documentos ya correctos: ${docs.length - fixedCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllSignatures();
