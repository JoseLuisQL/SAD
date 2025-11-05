import prisma from './src/config/database';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

async function setupTestData() {
  console.log('🚀 Creando datos de prueba...\n');

  // 1. Crear rol de Administrador
  console.log('📝 Creando rol de Administrador...');
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrador',
      description: 'Rol de administrador con todos los permisos',
      permissions: {
        users: { read: true, create: true, update: true, delete: true },
        roles: { read: true, create: true, update: true, delete: true },
        offices: { read: true, create: true, update: true, delete: true },
        documentTypes: { read: true, create: true, update: true, delete: true },
        periods: { read: true, create: true, update: true, delete: true },
        archivadores: { read: true, create: true, update: true, delete: true },
        documents: { read: true, create: true, update: true, delete: true },
        expedientes: { read: true, create: true, update: true, delete: true },
        signatures: { read: true, create: true, update: true, delete: true },
        audit: { read: true },
      }
    }
  });
  console.log(`✅ Rol creado: ${adminRole.name} (${adminRole.id})\n`);

  // 2. Crear usuario administrador
  console.log('👤 Creando usuario administrador...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
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
  console.log(`✅ Usuario creado: ${adminUser.username} (${adminUser.id})`);
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: admin123\n`);

  // 3. Crear período
  console.log('📅 Creando período...');
  const period = await prisma.period.create({
    data: {
      year: 2024,
      description: 'Período 2024',
      isActive: true
    }
  });
  console.log(`✅ Período creado: ${period.year} (${period.id})\n`);

  // 4. Crear oficina
  console.log('🏢 Creando oficina...');
  const office = await prisma.office.create({
    data: {
      code: 'OTI',
      name: 'Oficina de Tecnologías de la Información',
      description: 'Oficina encargada de gestión tecnológica',
      isActive: true
    }
  });
  console.log(`✅ Oficina creada: ${office.name} (${office.id})\n`);

  // 5. Crear tipo de documento
  console.log('📄 Creando tipo de documento...');
  const docType = await prisma.documentType.create({
    data: {
      code: 'MEM',
      name: 'Memorándum',
      description: 'Memorándum interno',
      isActive: true
    }
  });
  console.log(`✅ Tipo de documento creado: ${docType.name} (${docType.id})\n`);

  // 6. Crear archivador
  console.log('📁 Creando archivador...');
  const archivador = await prisma.archivador.create({
    data: {
      code: 'ARCH-2024-001',
      name: 'Archivador General 2024',
      periodId: period.id,
      physicalLocation: {
        building: 'Edificio Principal',
        floor: '2',
        room: 'Sala 201',
        shelf: 'Estante A',
        box: 'Caja 1'
      },
      createdBy: adminUser.id
    }
  });
  console.log(`✅ Archivador creado: ${archivador.name} (${archivador.id})\n`);

  // 7. Crear un documento de prueba (PDF vacío)
  console.log('📄 Creando documento de prueba...');
  const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Crear un PDF simple de prueba
  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT
/F1 18 Tf
50 750 Td
(Documento de Prueba) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000214 00000 n 
0000000304 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
398
%%EOF`;

  const testFileName = `${Date.now()}-documento-prueba.pdf`;
  const testFilePath = path.join(uploadsDir, testFileName);
  fs.writeFileSync(testFilePath, pdfContent);

  const document = await prisma.document.create({
    data: {
      archivadorId: archivador.id,
      documentTypeId: docType.id,
      officeId: office.id,
      documentNumber: 'MEM-2024-001',
      documentDate: new Date(),
      sender: 'Director General',
      folioCount: 1,
      annotations: 'Documento de prueba para testing de firma digital',
      ocrContent: 'Documento de Prueba',
      ocrStatus: 'COMPLETED',
      filePath: testFilePath,
      fileName: 'documento-prueba.pdf',
      fileSize: Buffer.from(pdfContent).length,
      mimeType: 'application/pdf',
      currentVersion: 1,
      createdBy: adminUser.id
    }
  });
  console.log(`✅ Documento creado: ${document.documentNumber} (${document.id})`);
  console.log(`   Archivo: ${document.fileName}\n`);

  // 8. Crear versión inicial del documento
  console.log('📋 Creando versión inicial del documento...');
  const version = await prisma.documentVersion.create({
    data: {
      documentId: document.id,
      versionNumber: 1,
      filePath: testFilePath,
      fileName: 'documento-prueba.pdf',
      changeDescription: 'Versión inicial',
      createdBy: adminUser.id
    }
  });
  console.log(`✅ Versión creada: v${version.versionNumber} (${version.id})\n`);

  console.log('✅ ¡Datos de prueba creados exitosamente!\n');
  console.log('📊 Resumen:');
  console.log(`   - Usuario: ${adminUser.username} / admin123`);
  console.log(`   - Documento ID: ${document.id}`);
  console.log(`   - Archivo: ${document.filePath}`);

  return {
    user: adminUser,
    document: document,
    role: adminRole
  };
}

setupTestData()
  .then(() => {
    console.log('\n✅ Setup completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en setup:', error);
    process.exit(1);
  });
