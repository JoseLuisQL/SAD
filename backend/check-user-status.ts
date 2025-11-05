import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndFixUserStatus() {
  const username = process.argv[2] || 'admin';
  
  console.log(`\n🔍 Verificando estado del usuario: ${username}\n`);
  
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        role: {
          select: {
            name: true
          }
        }
      }
    });

    if (!user) {
      console.log(`❌ Usuario "${username}" no encontrado en la base de datos`);
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.firstName} ${user.lastName}`);
    console.log(`   Rol: ${user.role.name}`);
    console.log(`   Activo: ${user.isActive ? '✅ Sí' : '❌ No'}`);
    console.log(`   Intentos fallidos: ${user.failedAttempts}`);
    console.log(`   Último intento fallido: ${user.lastFailedAt || 'N/A'}`);
    console.log(`   Bloqueado hasta: ${user.lockedUntil || 'No bloqueado'}`);

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000 / 60);
      console.log(`\n⚠️  CUENTA BLOQUEADA por ${minutesRemaining} minutos más`);
      
      // Unlock account
      console.log(`\n🔓 Desbloqueando cuenta...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lockedUntil: null,
          failedAttempts: 0,
          lastFailedAt: null
        }
      });
      console.log(`✅ Cuenta desbloqueada exitosamente`);
    } else if (user.failedAttempts > 0) {
      console.log(`\n🔄 Reiniciando contador de intentos fallidos...`);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lastFailedAt: null
        }
      });
      console.log(`✅ Contador reiniciado`);
    } else {
      console.log(`\n✅ Cuenta en buen estado, no requiere acciones`);
    }

    // Verify password hash format
    console.log(`\n🔐 Verificando formato de contraseña...`);
    const isValidBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    console.log(`   Hash válido: ${isValidBcryptHash ? '✅ Sí' : '❌ No'}`);
    
    if (!isValidBcryptHash) {
      console.log(`   ⚠️  El hash de contraseña no parece ser un hash bcrypt válido`);
      console.log(`   Hash actual: ${user.password.substring(0, 20)}...`);
      
      // Optionally rehash the password
      const newPassword = process.argv[3];
      if (newPassword) {
        console.log(`\n🔄 Rehashing contraseña con: ${newPassword}`);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: hashedPassword
          }
        });
        console.log(`✅ Contraseña actualizada exitosamente`);
      } else {
        console.log(`   💡 Para rehashear la contraseña, ejecuta:`);
        console.log(`   npx ts-node check-user-status.ts ${username} NUEVA_CONTRASEÑA`);
      }
    } else {
      // Test password if provided
      const testPassword = process.argv[3];
      if (testPassword) {
        console.log(`\n🧪 Probando contraseña proporcionada...`);
        const isValid = await bcrypt.compare(testPassword, user.password);
        console.log(`   Contraseña "${testPassword}": ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
      } else {
        console.log(`   💡 Para probar una contraseña, ejecuta:`);
        console.log(`   npx ts-node check-user-status.ts ${username} CONTRASEÑA_A_PROBAR`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFixUserStatus();
