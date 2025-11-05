import prisma from '../src/config/database';

/**
 * Script to ensure a single SystemConfig record exists with default values
 * This should be run after migrations to initialize the system configuration
 */
async function ensureSystemConfig() {
  try {
    console.log('🔍 Checking for existing SystemConfig...');

    const existingConfig = await prisma.systemConfig.findFirst();

    if (existingConfig) {
      console.log('✅ SystemConfig already exists:', {
        id: existingConfig.id,
        companyName: existingConfig.companyName,
        signatureStampEnabled: existingConfig.signatureStampEnabled,
        maintenanceMode: existingConfig.maintenanceMode,
      });
      return;
    }

    console.log('📝 Creating default SystemConfig...');

    const defaultConfig = await prisma.systemConfig.create({
      data: {
        companyName: 'Sistema Integrado de Archivos Digitales',
        companyTagline: 'Gestión Documental Inteligente',
        signatureStampEnabled: true,
        maintenanceMode: false,
      },
    });

    console.log('✅ SystemConfig created successfully:', {
      id: defaultConfig.id,
      companyName: defaultConfig.companyName,
      companyTagline: defaultConfig.companyTagline,
      signatureStampEnabled: defaultConfig.signatureStampEnabled,
      maintenanceMode: defaultConfig.maintenanceMode,
    });

  } catch (error) {
    console.error('❌ Error ensuring SystemConfig:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
ensureSystemConfig()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
