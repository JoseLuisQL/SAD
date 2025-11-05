/**
 * Script para generar datos de demostración para el dashboard
 * 
 * Este script crea:
 * - Documentos con diferentes estados de firma y OCR
 * - Archivadores con diferentes niveles de ocupación
 * - Flujos de firma en distintos estados
 * - Actividad de auditoría
 * 
 * IMPORTANTE: Este script NO debe ejecutarse en producción
 * 
 * Uso: npx ts-node scripts/seed-dashboard-demo.ts
 * 
 * Para revertir los datos demo:
 * 1. Identificar los registros creados por el script (contienen metadata específica)
 * 2. Eliminarlos manualmente o ejecutar un script de limpieza
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_TAG = '[DEMO]';

async function seedDashboardDemo() {
  console.log('🌱 Iniciando seed de datos demo para dashboard...');

  try {
    // Obtener datos existentes necesarios
    const users = await prisma.user.findMany({ take: 3 });
    const offices = await prisma.office.findMany({ take: 3 });
    const documentTypes = await prisma.documentType.findMany({ take: 3 });
    const periods = await prisma.period.findMany({ take: 1 });

    if (!users.length || !offices.length || !documentTypes.length || !periods.length) {
      console.error('❌ Error: No hay datos base suficientes (usuarios, oficinas, tipos de documento, periodos)');
      console.log('Por favor, asegúrate de que el sistema tenga datos iniciales antes de ejecutar este script.');
      return;
    }

    const user = users[0];
    const office = offices[0];
    const documentType = documentTypes[0];
    const period = periods[0];

    console.log('📦 Creando archivadores demo...');

    // Crear 3 archivadores con diferentes niveles de ocupación
    const archivadores = await Promise.all([
      prisma.archivador.create({
        data: {
          code: `${DEMO_TAG}-ARCH-001`,
          name: `${DEMO_TAG} Archivador Demo 1 - Ocupación Media`,
          periodId: period.id,
          physicalLocation: {
            building: 'Demo Building',
            floor: '1',
            room: '101',
            shelf: 'A1'
          },
          createdBy: user.id
        }
      }),
      prisma.archivador.create({
        data: {
          code: `${DEMO_TAG}-ARCH-002`,
          name: `${DEMO_TAG} Archivador Demo 2 - Alta Ocupación`,
          periodId: period.id,
          physicalLocation: {
            building: 'Demo Building',
            floor: '1',
            room: '102',
            shelf: 'B1'
          },
          createdBy: user.id
        }
      }),
      prisma.archivador.create({
        data: {
          code: `${DEMO_TAG}-ARCH-003`,
          name: `${DEMO_TAG} Archivador Demo 3 - Baja Ocupación`,
          periodId: period.id,
          physicalLocation: {
            building: 'Demo Building',
            floor: '2',
            room: '201',
            shelf: 'C1'
          },
          createdBy: user.id
        }
      })
    ]);

    console.log(`✅ ${archivadores.length} archivadores creados`);

    console.log('📄 Creando documentos demo...');

    const now = new Date();
    const documentPromises: any[] = [];

    // Archivador 1: 50 documentos (ocupación media)
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const docDate = new Date(now);
      docDate.setDate(docDate.getDate() - daysAgo);

      const signatureStatuses = ['SIGNED', 'UNSIGNED', 'PARTIALLY_SIGNED'];
      const ocrStatuses = ['COMPLETED', 'PENDING', 'ERROR'];
      
      documentPromises.push(
        prisma.document.create({
          data: {
            archivadorId: archivadores[0].id,
            documentTypeId: documentTypes[Math.floor(Math.random() * documentTypes.length)].id,
            officeId: offices[Math.floor(Math.random() * offices.length)].id,
            documentNumber: `${DEMO_TAG}-DOC-A1-${String(i + 1).padStart(4, '0')}`,
            documentDate: docDate,
            sender: `${DEMO_TAG} Remitente ${i + 1}`,
            folioCount: Math.floor(Math.random() * 20) + 1,
            annotations: `${DEMO_TAG} Documento de prueba ${i + 1} para archivador 1`,
            ocrStatus: i < 5 ? 'PENDING' : (i < 8 ? 'ERROR' : 'COMPLETED'),
            ocrContent: i >= 8 ? `${DEMO_TAG} Contenido OCR extraído del documento ${i + 1}` : null,
            filePath: `/demo/archivador1/doc${i + 1}.pdf`,
            fileName: `${DEMO_TAG}_doc_a1_${i + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 1000000) + 100000,
            mimeType: 'application/pdf',
            signatureStatus: signatureStatuses[Math.floor(Math.random() * signatureStatuses.length)],
            createdBy: user.id,
            createdAt: docDate
          }
        })
      );
    }

    // Archivador 2: 90 documentos (alta ocupación - generará alerta)
    for (let i = 0; i < 90; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const docDate = new Date(now);
      docDate.setDate(docDate.getDate() - daysAgo);

      documentPromises.push(
        prisma.document.create({
          data: {
            archivadorId: archivadores[1].id,
            documentTypeId: documentTypes[Math.floor(Math.random() * documentTypes.length)].id,
            officeId: offices[Math.floor(Math.random() * offices.length)].id,
            documentNumber: `${DEMO_TAG}-DOC-A2-${String(i + 1).padStart(4, '0')}`,
            documentDate: docDate,
            sender: `${DEMO_TAG} Remitente ${i + 1}`,
            folioCount: Math.floor(Math.random() * 20) + 1,
            annotations: `${DEMO_TAG} Documento de prueba ${i + 1} para archivador 2 (alta ocupación)`,
            ocrStatus: i < 15 ? 'PENDING' : 'COMPLETED',
            ocrContent: i >= 15 ? `${DEMO_TAG} Contenido OCR extraído del documento ${i + 1}` : null,
            filePath: `/demo/archivador2/doc${i + 1}.pdf`,
            fileName: `${DEMO_TAG}_doc_a2_${i + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 1000000) + 100000,
            mimeType: 'application/pdf',
            signatureStatus: i % 3 === 0 ? 'SIGNED' : (i % 3 === 1 ? 'UNSIGNED' : 'PARTIALLY_SIGNED'),
            createdBy: user.id,
            createdAt: docDate
          }
        })
      );
    }

    // Archivador 3: 20 documentos (baja ocupación)
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const docDate = new Date(now);
      docDate.setDate(docDate.getDate() - daysAgo);

      documentPromises.push(
        prisma.document.create({
          data: {
            archivadorId: archivadores[2].id,
            documentTypeId: documentTypes[Math.floor(Math.random() * documentTypes.length)].id,
            officeId: offices[Math.floor(Math.random() * offices.length)].id,
            documentNumber: `${DEMO_TAG}-DOC-A3-${String(i + 1).padStart(4, '0')}`,
            documentDate: docDate,
            sender: `${DEMO_TAG} Remitente ${i + 1}`,
            folioCount: Math.floor(Math.random() * 20) + 1,
            annotations: `${DEMO_TAG} Documento de prueba ${i + 1} para archivador 3`,
            ocrStatus: 'COMPLETED',
            ocrContent: `${DEMO_TAG} Contenido OCR extraído del documento ${i + 1}`,
            filePath: `/demo/archivador3/doc${i + 1}.pdf`,
            fileName: `${DEMO_TAG}_doc_a3_${i + 1}.pdf`,
            fileSize: Math.floor(Math.random() * 1000000) + 100000,
            mimeType: 'application/pdf',
            signatureStatus: 'SIGNED',
            createdBy: user.id,
            createdAt: docDate
          }
        })
      );
    }

    const documents = await Promise.all(documentPromises);
    console.log(`✅ ${documents.length} documentos creados`);

    console.log('📝 Creando registros de auditoría demo...');

    // Crear registros de auditoría para simular actividad reciente
    const auditPromises = [];
    const actions = [
      'DOCUMENT_CREATED',
      'DOCUMENT_UPDATED',
      'DOCUMENT_SIGNED',
      'DOCUMENT_DOWNLOADED',
      'ARCHIVADOR_CREATED'
    ];

    for (let i = 0; i < 20; i++) {
      const hoursAgo = Math.floor(Math.random() * 24);
      const auditDate = new Date(now);
      auditDate.setHours(auditDate.getHours() - hoursAgo);

      auditPromises.push(
        prisma.auditLog.create({
          data: {
            userId: users[Math.floor(Math.random() * users.length)].id,
            action: actions[Math.floor(Math.random() * actions.length)],
            module: 'Documentos',
            entityType: 'Document',
            entityId: documents[Math.floor(Math.random() * documents.length)].id,
            ipAddress: '127.0.0.1',
            userAgent: `${DEMO_TAG} Demo User Agent`,
            createdAt: auditDate
          }
        })
      );
    }

    await Promise.all(auditPromises);
    console.log(`✅ ${auditPromises.length} registros de auditoría creados`);

    console.log('✨ Seed de datos demo completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - Archivadores: ${archivadores.length}`);
    console.log(`   - Documentos: ${documents.length}`);
    console.log(`   - Auditorías: ${auditPromises.length}`);
    console.log('\n⚠️  Para eliminar estos datos, busca registros que contengan "[DEMO]" en sus campos.');

  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
seedDashboardDemo()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
