import prisma from '../config/database';

async function updateSignatureStatus() {
  console.log('🔄 Actualizando estado de firmas en documentos existentes...\n');

  try {
    // Obtener todos los documentos con firmas activas
    const documents = await prisma.document.findMany({
      include: {
        signatures: {
          where: {
            isReverted: false
          }
        }
      }
    });

    console.log(`📄 Documentos encontrados: ${documents.length}\n`);

    let updatedCount = 0;
    let alreadyCorrectCount = 0;
    let withoutSignaturesCount = 0;

    for (const doc of documents) {
      const activeSignatures = doc.signatures;

      if (activeSignatures.length === 0) {
        withoutSignaturesCount++;
        // Asegurarse de que está marcado como UNSIGNED
        if (doc.signatureStatus !== 'UNSIGNED') {
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              signatureStatus: 'UNSIGNED',
              lastSignedAt: null,
              signedBy: null
            }
          });
          console.log(`  ✅ ${doc.documentNumber}: Actualizado a UNSIGNED`);
          updatedCount++;
        } else {
          alreadyCorrectCount++;
        }
        continue;
      }

      // Tiene firmas activas
      const lastSignature = activeSignatures.reduce((latest, current) => {
        return new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest;
      });

      if (doc.signatureStatus !== 'SIGNED' || doc.lastSignedAt?.toISOString() !== lastSignature.timestamp.toISOString() || doc.signedBy !== lastSignature.signerId) {
        await prisma.document.update({
          where: { id: doc.id },
          data: {
            signatureStatus: 'SIGNED',
            lastSignedAt: lastSignature.timestamp,
            signedBy: lastSignature.signerId
          }
        });
        console.log(`  ✅ ${doc.documentNumber}: Actualizado a SIGNED (${activeSignatures.length} firma(s))`);
        updatedCount++;
      } else {
        alreadyCorrectCount++;
      }
    }

    console.log('\n📊 Resumen:');
    console.log(`  - Documentos actualizados: ${updatedCount}`);
    console.log(`  - Documentos ya correctos: ${alreadyCorrectCount}`);
    console.log(`  - Documentos sin firmas: ${withoutSignaturesCount}`);
    console.log('\n✅ Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error al actualizar estado de firmas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateSignatureStatus()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
