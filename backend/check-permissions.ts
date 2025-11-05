import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPermissions() {
  console.log('🔍 Verificando permisos en la base de datos...\n');

  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    console.log(`📋 Total de roles encontrados: ${roles.length}\n`);

    for (const role of roles) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎭 Rol: ${role.name}`);
      console.log(`📝 Descripción: ${role.description || 'Sin descripción'}`);
      console.log(`👥 Usuarios asignados: ${role._count.users}`);
      console.log(`\n🔐 Permisos:`);
      
      if (role.permissions && typeof role.permissions === 'object') {
        const perms = role.permissions as Record<string, any>;
        const modules = Object.keys(perms);
        
        console.log(`   Módulos totales: ${modules.length}`);
        
        modules.forEach(module => {
          const modulePerms = perms[module];
          if (typeof modulePerms === 'object') {
            const actions = Object.entries(modulePerms)
              .filter(([, value]) => value === true)
              .map(([key]) => key);
            
            console.log(`   ├─ ${module}: [${actions.join(', ')}]`);
          }
        });
      } else {
        console.log('   ⚠️  Sin permisos definidos');
      }
      
      console.log('');
    }

    // Verificar usuario admin
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Verificando usuario administrador...\n');

    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: 'admin' },
          { email: 'admin@disachincheros.gob.pe' }
        ]
      },
      include: {
        role: true
      }
    });

    if (adminUser) {
      console.log(`✅ Usuario encontrado:`);
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nombre: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`   Rol: ${adminUser.role.name}`);
      console.log(`   Activo: ${adminUser.isActive ? 'Sí' : 'No'}`);
      
      if (adminUser.role.permissions) {
        const perms = adminUser.role.permissions as Record<string, any>;
        const moduleCount = Object.keys(perms).length;
        console.log(`   Módulos de permisos: ${moduleCount}`);
      }
    } else {
      console.log('❌ Usuario administrador NO encontrado');
    }

  } catch (error) {
    console.error('❌ Error al verificar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
