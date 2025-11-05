import prisma from '../config/database';

async function checkDocument011AfterRevert() {
  console.log('🔍 Verificando documento 011-2025 después de reversión...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '011-2025' },
      include: {
        signatures: {
          orderBy: { timestamp: 'desc' }
        },
        versions: {
          orderBy: { versionNumber: 'asc' }
        }
      }
    });

    if (!doc) {
      console.log('❌ Documento no encontrado');
      return;
    }

    console.log('📄 Documento:');
    console.log(`  Estado de firma: ${doc.signatureStatus}`);
    console.log(`  Versión actual: ${doc.currentVersion}`);
    console.log();

    console.log(`✍️ Firmas totales: ${doc.signatures.length}`);
    doc.signatures.forEach(sig => {
      console.log(`  - Firma ID: ${sig.id.substring(0, 8)}...`);
      console.log(`    isReverted: ${sig.isReverted}`);
      console.log(`    revertedAt: ${sig.revertedAt || 'N/A'}`);
      console.log(`    revertReason: ${sig.revertReason || 'N/A'}`);
      console.log(`    Status: ${sig.status}`);
      console.log();
    });

    console.log(`📚 Versiones: ${doc.versions.length}`);
    doc.versions.forEach(v => {
      console.log(`  - Versión ${v.versionNumber}: ${v.changeDescription}`);
    });
    console.log();

    const activeSignatures = doc.signatures.filter(s => !s.isReverted);
    const revertedSignatures = doc.signatures.filter(s => s.isReverted);

    console.log('📊 Resumen:');
    console.log(`  - Firmas activas: ${activeSignatures.length}`);
    console.log(`  - Firmas revertidas: ${revertedSignatures.length}`);
    console.log(`  - Estado del documento: ${doc.signatureStatus}`);
    
    if (doc.signatureStatus === 'REVERTED' && revertedSignatures.length > 0) {
      console.log('\n✅ Estado correcto después de reversión');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDocument011AfterRevert();
