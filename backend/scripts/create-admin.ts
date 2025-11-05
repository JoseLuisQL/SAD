import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔐 Creando usuario administrador...');

  try {
    // Buscar o crear el rol de Administrador
    let adminRole = await prisma.role.findUnique({
      where: { name: 'Administrador' }
    });

    if (!adminRole) {
      console.log('Creando rol de Administrador...');
      adminRole = await prisma.role.create({
        data: {
          name: 'Administrador',
          description: 'Acceso total al sistema',
          permissions: {
            users: { create: true, read: true, update: true, delete: true },
            documents: { create: true, read: true, update: true, delete: true },
            archivadores: { create: true, read: true, update: true, delete: true },
            offices: { create: true, read: true, update: true, delete: true },
            documentTypes: { create: true, read: true, update: true, delete: true },
            periods: { create: true, read: true, update: true, delete: true },
            signatures: { create: true, read: true, update: true, delete: true },
            reports: { read: true, export: true },
            auditLogs: { read: true }
          }
        }
      });
      console.log('✓ Rol de Administrador creado');
    } else {
      console.log('✓ Rol de Administrador ya existe');
    }

    // Verificar si el usuario admin ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  El usuario admin ya existe. Actualizando contraseña...');
      
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await prisma.user.update({
        where: { username: 'admin' },
        data: {
          password: hashedPassword,
          isActive: true
        }
      });

      console.log('✓ Contraseña del usuario admin actualizada');
    } else {
      console.log('Creando usuario admin...');
      
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@disachincheros.gob.pe',
          password: hashedPassword,
          firstName: 'Administrador',
          lastName: 'Sistema',
          roleId: adminRole.id,
          isActive: true
        }
      });

      console.log('✓ Usuario admin creado');
    }

    console.log('\n✅ Proceso completado exitosamente!');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Email: admin@disachincheros.gob.pe');
    console.log('   Password: Admin123!');
    console.log('\n⚠️  Recuerda cambiar la contraseña en producción!\n');

  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  });
