import prisma from '../config/database';
import * as signatureReversionService from '../services/signature-reversion.service';

async function testCanRevert011() {
  console.log('🔍 Probando can-revert para documento 011-2025...\n');

  try {
    const doc = await prisma.document.findFirst({
      where: { documentNumber: '011-2025' },
      include: {
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
    console.log(`  Firmas activas: ${doc.signatures.length}`);
    console.log();

    // Obtener usuario admin
    const admin = await prisma.user.findFirst({
      where: {
        role: {
          name: 'Administrador'
        }
      },
      include: {
        role: true
      }
    });

    if (!admin) {
      console.log('❌ No se encontró usuario administrador');
      return;
    }

    console.log('👤 Usuario:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Role: ${admin.role.name}`);
    console.log();

    // Probar canRevert
    console.log('🔄 Probando canRevert...');
    const result = await signatureReversionService.canRevert(doc.id, admin.id);

    console.log('\n📊 Resultado:');
    console.log(`  canRevert: ${result.canRevert}`);
    console.log(`  reason: ${result.reason || 'N/A'}`);

    if (!result.canRevert) {
      console.log('\n❌ NO se puede revertir');
      console.log(`   Razón: ${result.reason}`);
    } else {
      console.log('\n✅ SÍ se puede revertir');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCanRevert011();
