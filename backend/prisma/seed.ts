import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes en orden de dependencias
  console.log('Limpiando datos existentes...');
  await prisma.auditLog.deleteMany();
  await prisma.signature.deleteMany();
  await prisma.signatureFlow.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.archivador.deleteMany();
  await prisma.period.deleteMany();
  await prisma.documentType.deleteMany();
  await prisma.office.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();

  // ==================== ROLES ====================
  console.log('Creando roles...');
  
  const adminRole = await prisma.role.create({
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

  const operatorRole = await prisma.role.create({
    data: {
      name: 'Operador',
      description: 'Puede crear y modificar documentos',
      permissions: {
        users: { view: true },
        offices: { view: true },
        documentTypes: { view: true },
        periods: { view: true },
        configuration: { view: true },
        archivadores: { view: true, create: true, update: true },
        documents: { view: true, create: true, update: true, download: true, export: true },
        versions: { view: true, download: true, compare: true },
        expedientes: { view: true, create: true, update: true },
        search: { view: true, export: true },
        reports: { view: true, generate: true, export: true },
        analytics: { view: true },
        signing: { view: true, sign: true },
        signatureFlows: { view: true },
        notifications: { view: true }
      }
    }
  });

  const consultorRole = await prisma.role.create({
    data: {
      name: 'Consultor',
      description: 'Solo puede consultar información',
      permissions: {
        documents: { view: true, download: true },
        versions: { view: true, download: true },
        expedientes: { view: true },
        search: { view: true },
        reports: { view: true, generate: true, export: true },
        analytics: { view: true },
        notifications: { view: true }
      }
    }
  });

  console.log(`✓ Roles creados: ${adminRole.name}, ${operatorRole.name}, ${consultorRole.name}`);

  // ==================== USUARIOS ====================
  console.log('Creando usuarios...');
  
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  const adminUser = await prisma.user.create({
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

  console.log(`✓ Usuario administrador creado: ${adminUser.username} (email: ${adminUser.email})`);
  console.log('  📧 Email: admin@disachincheros.gob.pe');
  console.log('  🔑 Password: Admin123!');

  // ==================== OFICINAS ====================
  console.log('Creando oficinas...');
  
  const offices = await prisma.office.createMany({
    data: [
      {
        code: 'DIR',
        name: 'Dirección General',
        description: 'Dirección General DISA Chincheros',
        isActive: true
      },
      {
        code: 'ADM',
        name: 'Administración',
        description: 'Oficina de Administración',
        isActive: true
      },
      {
        code: 'LOG',
        name: 'Logística',
        description: 'Oficina de Logística',
        isActive: true
      },
      {
        code: 'RRHH',
        name: 'Recursos Humanos',
        description: 'Oficina de Recursos Humanos',
        isActive: true
      },
      {
        code: 'PRES',
        name: 'Presupuesto',
        description: 'Oficina de Presupuesto',
        isActive: true
      }
    ]
  });

  console.log(`✓ ${offices.count} oficinas creadas`);

  // ==================== TIPOS DE DOCUMENTO ====================
  console.log('Creando tipos de documento...');
  
  const documentTypes = await prisma.documentType.createMany({
    data: [
      {
        code: 'OF',
        name: 'Oficio',
        description: 'Oficios oficiales',
        isActive: true
      },
      {
        code: 'MEM',
        name: 'Memorándum',
        description: 'Memorándums internos',
        isActive: true
      },
      {
        code: 'INF',
        name: 'Informe',
        description: 'Informes técnicos y administrativos',
        isActive: true
      },
      {
        code: 'RES',
        name: 'Resolución',
        description: 'Resoluciones directivas',
        isActive: true
      },
      {
        code: 'SOL',
        name: 'Solicitud',
        description: 'Solicitudes diversas',
        isActive: true
      },
      {
        code: 'CONT',
        name: 'Contrato',
        description: 'Contratos y convenios',
        isActive: true
      }
    ]
  });

  console.log(`✓ ${documentTypes.count} tipos de documento creados`);

  // ==================== PERÍODOS ====================
  console.log('Creando períodos...');
  
  const currentYear = new Date().getFullYear();
  const periods = await prisma.period.createMany({
    data: [
      {
        year: currentYear - 2,
        description: `Periodo ${currentYear - 2}`,
        isActive: false
      },
      {
        year: currentYear - 1,
        description: `Periodo ${currentYear - 1}`,
        isActive: false
      },
      {
        year: currentYear,
        description: `Periodo ${currentYear}`,
        isActive: true
      }
    ]
  });

  console.log(`✓ ${periods.count} períodos creados (${currentYear - 2} - ${currentYear})`);

  console.log('\n✅ Seed completado exitosamente!');
  console.log('\n📋 Resumen:');
  console.log(`   - Roles: 3`);
  console.log(`   - Usuarios: 1`);
  console.log(`   - Oficinas: 5`);
  console.log(`   - Tipos de documento: 6`);
  console.log(`   - Períodos: 3`);
  console.log('\n🔐 Credenciales de acceso:');
  console.log('   Usuario: admin');
  console.log('   Email: admin@disachincheros.gob.pe');
  console.log('   Password: Admin123!');
  console.log('\n⚠️  Recuerda cambiar la contraseña del administrador en producción!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
