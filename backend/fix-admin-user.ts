import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminUser() {
  try {
    console.log('🔍 Buscando usuario admin...');
    
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: {
        role: true
      }
    });

    if (!adminUser) {
      console.log('❌ Usuario admin no encontrado');
      console.log('💡 Creando usuario admin...');
      
      const adminRole = await prisma.role.findFirst({
        where: { name: 'Administrador' }
      });

      if (!adminRole) {
        console.log('❌ Rol Administrador no encontrado. Por favor, ejecuta el seed primero.');
        return;
      }

      const hashedPassword = await bcrypt.hash('admin123!', 10);
      
      const newAdmin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@disa.gob.pe',
          password: hashedPassword,
          firstName: 'Administrador',
          lastName: 'Sistema',
          roleId: adminRole.id,
          isActive: true
        }
      });

      console.log('✅ Usuario admin creado exitosamente');
      console.log('📧 Email:', newAdmin.email);
      console.log('🔑 Password: admin123!');
    } else {
      console.log('✅ Usuario admin encontrado');
      console.log('📧 Email:', adminUser.email);
      console.log('👤 Nombre:', `${adminUser.firstName} ${adminUser.lastName}`);
      console.log('🎭 Rol:', adminUser.role.name);
      console.log('📊 Estado:', adminUser.isActive ? 'Activo' : 'Inactivo');
      
      console.log('\n🔄 Actualizando contraseña del usuario admin...');
      
      const hashedPassword = await bcrypt.hash('admin123!', 10);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedPassword,
          isActive: true
        }
      });

      console.log('✅ Contraseña actualizada exitosamente');
      console.log('🔑 Nueva contraseña: admin123!');
    }

    console.log('\n📝 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Contraseña: admin123!');
    console.log('\n✅ Puedes intentar iniciar sesión nuevamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
