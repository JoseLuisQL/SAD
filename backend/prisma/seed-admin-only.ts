import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario administrador inicial para producción...');

  // Verificar si el rol ya existe, si no, crearlo
  let adminRole = await prisma.role.findUnique({
    where: { name: 'Administrador' }
  });

  if (!adminRole) {
    console.log('  → Creando rol de Administrador...');
    adminRole = await prisma.role.create({
      data: {
        name: 'Administrador',
        description: 'Acceso total al sistema',
        permissions: {
          users: { view: true, create: true, update: true, delete: true },
          roles: { view: true, create: true, update: true, delete: true },
          offices: { view: true, create: true, update: true, delete: true },
          documentTypes: { view: true, create: true, update: true, delete: true },
          periods: { view: true, create: true, update: true, delete: true },
          audit: { view: true, export: true },
          configuration: { view: true, update: true },
          archivadores: { view: true, create: true, update: true, delete: true },
          documents: { view: true, create: true, update: true, delete: true, download: true, export: true },
          versions: { view: true, restore: true, download: true, compare: true },
          expedientes: { view: true, create: true, update: true, delete: true },
          search: { view: true, export: true },
          reports: { view: true, generate: true, export: true },
          analytics: { view: true, export: true },
          signing: { view: true, sign: true },
          signatureFlows: { view: true, create: true, update: true, delete: true, approve: true },
          notifications: { view: true, delete: true }
        }
      }
    });
    console.log('  ✓ Rol creado');
  } else {
    console.log('  ℹ Rol "Administrador" ya existe');
  }

  // Verificar si el usuario admin ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { username: 'admin' }
  });

  if (existingAdmin) {
    console.log('  ℹ Usuario "admin" ya existe');
    console.log('  ⚠️  Si necesitas resetear la contraseña, elimina el usuario manualmente primero');
  } else {
    // Crear usuario administrador
    console.log('  → Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@risvirgendecocharcas.gob.pe',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        roleId: adminRole.id,
        isActive: true
      }
    });
    console.log('  ✓ Usuario creado');
  }

  console.log('✓ Usuario administrador creado exitosamente');
  console.log('=============================================');
  console.log('  Username: admin');
  console.log('  Password: Admin123!');
  console.log('  Email: admin@risvirgendecocharcas.gob.pe');
  console.log('=============================================');
  console.log('⚠️  IMPORTANTE: CAMBIAR LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
}

main()
  .catch((e) => {
    console.error('Error al crear usuario administrador:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
