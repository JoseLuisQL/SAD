import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('🔍 Verificando base de datos...\n');

  try {
    // Verificar roles
    const rolesCount = await prisma.role.count();
    console.log(`✓ Roles: ${rolesCount}`);
    const roles = await prisma.role.findMany({ select: { name: true } });
    roles.forEach(role => console.log(`  - ${role.name}`));

    // Verificar usuarios
    const usersCount = await prisma.user.count();
    console.log(`\n✓ Usuarios: ${usersCount}`);
    const users = await prisma.user.findMany({ 
      select: { username: true, email: true, role: { select: { name: true } } } 
    });
    users.forEach(user => console.log(`  - ${user.username} (${user.email}) - Rol: ${user.role.name}`));

    // Verificar oficinas
    const officesCount = await prisma.office.count();
    console.log(`\n✓ Oficinas: ${officesCount}`);

    // Verificar tipos de documento
    const documentTypesCount = await prisma.documentType.count();
    console.log(`✓ Tipos de documento: ${documentTypesCount}`);

    // Verificar períodos
    const periodsCount = await prisma.period.count();
    console.log(`✓ Períodos: ${periodsCount}`);

    // Verificar archivadores
    const archivadoresCount = await prisma.archivador.count();
    console.log(`✓ Archivadores: ${archivadoresCount}`);

    // Verificar documentos
    const documentsCount = await prisma.document.count();
    console.log(`✓ Documentos: ${documentsCount}`);

    console.log('\n✅ Base de datos verificada correctamente!\n');

  } catch (error) {
    console.error('❌ Error al verificar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabase();
