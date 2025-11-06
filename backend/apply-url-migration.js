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

  try {
    // Ejecutar el SQL de la migración directamente
    await prisma.$executeRawUnsafe(`
      ALTER TABLE system_configuration 
      ADD COLUMN IF NOT EXISTS logoUrl VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS faviconUrl VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS stampUrl VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS loginBg1Url VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS loginBg2Url VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS loginBg3Url VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS loginBg4Url VARCHAR(191) NULL,
      ADD COLUMN IF NOT EXISTS loginBg5Url VARCHAR(191) NULL
    `);

    console.log('✅ Migración aplicada exitosamente');
    console.log('\nColumnas añadidas:');
    console.log('  - logoUrl');
    console.log('  - faviconUrl');
    console.log('  - stampUrl');
    console.log('  - loginBg1Url');
    console.log('  - loginBg2Url');
    console.log('  - loginBg3Url');
    console.log('  - loginBg4Url');
    console.log('  - loginBg5Url');
    
  } catch (error) {
    console.error('❌ Error al aplicar la migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
