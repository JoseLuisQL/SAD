import prisma from '../src/config/database';

async function fixDocumentSignatures() {
  console.log('🔧 Corrigiendo estado de firmas del documento 029-23...\n');

  try {
    // Buscar el documento
    const doc = await prisma.document.findFirst({
      where: {
        documentNumber: '029-23'
      },
      include: {
        signatures: true
      }
    });

    if (!doc) {
      console.log('❌ Documento 029-23 no encontrado');
      return;
    }

    console.log('📄 Estado ANTES de la corrección:');
    console.log(`  Versión Actual: ${doc.currentVersion}`);
    console.log(`  Estado de Firmas: ${doc.signatureStatus}`);
    console.log(`  Firmas totales: ${doc.signatures.length}`);
    console.log(`  Firmas activas: ${doc.signatures.filter(s => !s.isReverted).length}\n`);

    // Obtener la versión 3 actual
    const version3 = await prisma.documentVersion.findFirst({
      where: {
        documentId: doc.id,
        versionNumber: 3
      },
      include: {
        signatures: true
      }
    });

    if (!version3) {
      console.log('❌ Versión 3 no encontrada');
      return;
    }

    console.log(`📌 Versión 3 tiene ${version3.signatures.length} firmas\n`);

    // Si la versión 3 no tiene firmas pero el documento tiene firmas activas,
    // debemos revertir esas firmas
    const activeSigs = doc.signatures.filter(s => !s.isReverted);
    
    if (activeSigs.length > 0 && version3.signatures.length === 0) {
      console.log('🔄 Revirtiendo firmas huérfanas...');
      
      const now = new Date();
      
      // Revertir firmas activas
      await prisma.signature.updateMany({
        where: {
          documentId: doc.id,
          isReverted: false
        },
        data: {
          isReverted: true,
          revertedAt: now,
          revertedBy: doc.createdBy, // Usuario del sistema
          revertReason: 'Corrección automática: versión actual sin firmas'
        }
      });

      console.log(`  ✅ ${activeSigs.length} firma(s) revertida(s)\n`);

      // Actualizar estado del documento
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          signatureStatus: 'UNSIGNED'
        }
      });

      console.log('  ✅ Estado actualizado a UNSIGNED\n');
    }

    // Verificar estado DESPUÉS
    const docAfter = await prisma.document.findUnique({
      where: { id: doc.id },
      include: {
        signatures: true
      }
    });

    if (docAfter) {
      console.log('📄 Estado DESPUÉS de la corrección:');
      console.log(`  Versión Actual: ${docAfter.currentVersion}`);
      console.log(`  Estado de Firmas: ${docAfter.signatureStatus}`);
      console.log(`  Firmas totales: ${docAfter.signatures.length}`);
      console.log(`  Firmas activas: ${docAfter.signatures.filter(s => !s.isReverted).length}`);
      console.log(`  Firmas revertidas: ${docAfter.signatures.filter(s => s.isReverted).length}\n`);
    }

    console.log('✅ Corrección completada');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDocumentSignatures();
