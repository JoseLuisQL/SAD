/**
 * Script para aplicar manualmente la migración de URLs externas
 * 
 * Uso (en Railway o local):
 * node apply-url-migration.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('📋 Aplicando migración de URLs externas...\n');

  const columns = [
    'logoUrl',
    'faviconUrl',
    'stampUrl',
    'loginBg1Url',
    'loginBg2Url',
    'loginBg3Url',
    'loginBg4Url',
    'loginBg5Url'
  ];

  try {
    let added = 0;
    let skipped = 0;

    for (const column of columns) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE system_config 
          ADD COLUMN ${column} VARCHAR(191) NULL
        `);
        console.log(`✅ Columna ${column} añadida`);
        added++;
      } catch (error) {
        if (error.code === 'P2010' && error.meta?.message?.includes('Duplicate column')) {
          console.log(`⚠️  Columna ${column} ya existe, omitiendo`);
          skipped++;
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migración completada');
    console.log(`   Columnas añadidas: ${added}`);
    console.log(`   Columnas omitidas: ${skipped}`);
    
  } catch (error) {
    console.error('\n❌ Error al aplicar la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
