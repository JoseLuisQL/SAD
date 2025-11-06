/**
 * Script para actualizar las URLs de configuración con URLs externas (ImgBB, Cloudinary, etc.)
 * 
 * Uso:
 * node update-config-urls.js
 * 
 * Luego ingresa las URLs cuando se te solicite
 */

const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  console.log('='.repeat(60));
  console.log('ACTUALIZAR URLs DE CONFIGURACIÓN DEL SISTEMA');
  console.log('='.repeat(60));
  console.log('\nEste script actualizará las URLs de las imágenes del sistema');
  console.log('para usar URLs externas (ImgBB, Cloudinary, etc.)\n');
  console.log('Presiona Enter para dejar un campo vacío (sin cambios)\n');

  try {
    // Obtener configuración actual
    const config = await prisma.systemConfiguration.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    if (!config) {
      console.log('❌ No se encontró configuración del sistema');
      console.log('Creando configuración por defecto...\n');
      
      const companyName = await question('Nombre de la empresa: ');
      const logoUrl = await question('URL del Logo (ej: https://i.ibb.co/xxx/logo.png): ');
      const stampUrl = await question('URL del Sello de Firma (ej: https://i.ibb.co/xxx/stamp.png): ');
      const faviconUrl = await question('URL del Favicon (ej: https://i.ibb.co/xxx/favicon.ico): ');

      await prisma.systemConfiguration.create({
        data: {
          companyName: companyName || 'Sistema Integrado de Archivos Digitales',
          logoUrl: logoUrl || null,
          stampUrl: stampUrl || null,
          faviconUrl: faviconUrl || null,
          signatureStampEnabled: !!stampUrl,
          maintenanceMode: false
        }
      });

      console.log('\n✅ Configuración creada exitosamente');
    } else {
      console.log('📋 Configuración actual:');
      console.log(`   Empresa: ${config.companyName}`);
      console.log(`   Logo: ${config.logoUrl || '(no configurado)'}`);
      console.log(`   Stamp: ${config.stampUrl || '(no configurado)'}`);
      console.log(`   Favicon: ${config.faviconUrl || '(no configurado)'}\n`);

      console.log('Ingresa las nuevas URLs (deja vacío para mantener el valor actual):\n');

      const logoUrl = await question(`Nueva URL del Logo [${config.logoUrl || 'vacío'}]: `);
      const stampUrl = await question(`Nueva URL del Sello [${config.stampUrl || 'vacío'}]: `);
      const faviconUrl = await question(`Nueva URL del Favicon [${config.faviconUrl || 'vacío'}]: `);

      const updateData = {};
      if (logoUrl) updateData.logoUrl = logoUrl;
      if (stampUrl) {
        updateData.stampUrl = stampUrl;
        updateData.signatureStampEnabled = true;
      }
      if (faviconUrl) updateData.faviconUrl = faviconUrl;

      if (Object.keys(updateData).length > 0) {
        await prisma.systemConfiguration.update({
          where: { id: config.id },
          data: updateData
        });

        console.log('\n✅ Configuración actualizada exitosamente:');
        if (logoUrl) console.log(`   ✓ Logo: ${logoUrl}`);
        if (stampUrl) console.log(`   ✓ Sello: ${stampUrl}`);
        if (faviconUrl) console.log(`   ✓ Favicon: ${faviconUrl}`);
      } else {
        console.log('\n⚠️ No se realizaron cambios');
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Proceso completado');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
