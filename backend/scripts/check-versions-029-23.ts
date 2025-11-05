import prisma from '../src/config/database';

async function checkVersions() {
  console.log('🔍 Verificando versiones del documento 029-23...\n');

  try {
    // Buscar el documento
    const doc = await prisma.document.findFirst({
      where: {
        documentNumber: '029-23'
      },
      include: {
        signatures: {
          select: {
            id: true,
            isReverted: true,
            signatureData: true
          }
        }
      }
    });

    if (!doc) {
      console.log('❌ Documento 029-23 no encontrado');
      return;
    }

    console.log('📄 DOCUMENTO 029-23:');
    console.log(`  ID: ${doc.id}`);
    console.log(`  Número: ${doc.documentNumber}`);
    console.log(`  Versión Actual: ${doc.currentVersion}`);
    console.log(`  Estado de Firmas: ${doc.signatureStatus}`);
    console.log(`  Archivo: ${doc.fileName}`);
    console.log(`  Firmas totales: ${doc.signatures.length}`);
    console.log(`  Firmas activas: ${doc.signatures.filter(s => !s.isReverted).length}`);
    console.log(`  Firmas revertidas: ${doc.signatures.filter(s => s.isReverted).length}`);
    console.log();

    // Buscar todas las versiones guardadas
    const versions = await prisma.documentVersion.findMany({
      where: {
        documentId: doc.id
      },
      include: {
        signatures: true,
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        versionNumber: 'desc'
      }
    });

    console.log(`📦 VERSIONES GUARDADAS: ${versions.length}`);
    console.log();

    versions.forEach(v => {
      console.log(`  📌 Versión ${v.versionNumber}:`);
      console.log(`     ID: ${v.id.substring(0, 8)}...`);
      console.log(`     Archivo: ${v.fileName}`);
      console.log(`     Descripción: ${v.changeDescription}`);
      console.log(`     Creada: ${v.createdAt}`);
      console.log(`     Creado por: ${v.creator?.firstName} ${v.creator?.lastName}`);
      console.log(`     Firmas: ${v.signatures.length} (activas: ${v.signatures.filter(s => !s.isReverted).length})`);
      console.log(`     Es actual: ${v.versionNumber === doc.currentVersion ? 'SÍ' : 'NO'}`);
      console.log();
    });

    // Verificar estructura esperada
    console.log('✅ ANÁLISIS:');
    console.log(`  - Versión actual en DB: ${doc.currentVersion}`);
    console.log(`  - Versiones registradas: ${versions.map(v => v.versionNumber).join(', ')}`);
    
    if (versions.length === 0) {
      console.log('  ⚠️  No hay versiones guardadas, solo existe la versión actual');
    } else {
      const maxVersion = Math.max(...versions.map(v => v.versionNumber));
      if (doc.currentVersion > maxVersion) {
        console.log(`  ℹ️  La versión actual (${doc.currentVersion}) es más nueva que las guardadas`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVersions();
