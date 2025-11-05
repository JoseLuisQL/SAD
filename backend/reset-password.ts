import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  const username = process.argv[2];
  const newPassword = process.argv[3];
  
  if (!username || !newPassword) {
    console.log('❌ Uso: npx ts-node reset-password.ts <username> <nueva_contraseña>');
    process.exit(1);
  }

  console.log(`\n🔄 Reseteando contraseña para usuario: ${username}\n`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log(`❌ Usuario "${username}" no encontrado`);
      return;
    }

    console.log(`✅ Usuario encontrado: ${user.firstName} ${user.lastName} (${user.email})`);
    console.log(`🔐 Nueva contraseña: ${newPassword}`);
    console.log(`\n⏳ Generando hash...`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log(`✅ Hash generado: ${hashedPassword.substring(0, 30)}...`);
    console.log(`\n💾 Actualizando en base de datos...`);
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        failedAttempts: 0,
        lastFailedAt: null,
        lockedUntil: null
      }
    });

    console.log(`\n✅ ¡Contraseña actualizada exitosamente!`);
    console.log(`\n🔐 Verificando...`);
    
    // Verify the new password
    const isValid = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`   Prueba de contraseña: ${isValid ? '✅ CORRECTA' : '❌ ERROR'}`);
    
    if (isValid) {
      console.log(`\n🎉 Ahora puedes iniciar sesión con:`);
      console.log(`   Usuario: ${username}`);
      console.log(`   Contraseña: ${newPassword}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
