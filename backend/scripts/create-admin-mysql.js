const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  let connection;
  
  try {
    console.log('🔐 Conectando a la base de datos...');
    
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'archivo_digital_disa'
    });

    console.log('✓ Conectado a la base de datos');

    // 1. Verificar si existe el rol de Administrador
    console.log('\nVerificando rol de Administrador...');
    const [roles] = await connection.execute(
      'SELECT id FROM roles WHERE name = ?',
      ['Administrador']
    );

    let roleId;
    if (roles.length === 0) {
      console.log('Creando rol de Administrador...');
      const permissions = JSON.stringify({
        users: { create: true, read: true, update: true, delete: true },
        documents: { create: true, read: true, update: true, delete: true },
        archivadores: { create: true, read: true, update: true, delete: true },
        offices: { create: true, read: true, update: true, delete: true },
        documentTypes: { create: true, read: true, update: true, delete: true },
        periods: { create: true, read: true, update: true, delete: true },
        signatures: { create: true, read: true, update: true, delete: true },
        reports: { read: true, export: true },
        auditLogs: { read: true }
      });

      const [result] = await connection.execute(
        `INSERT INTO roles (id, name, description, permissions, createdAt, updatedAt)
         VALUES (UUID(), ?, ?, ?, NOW(), NOW())`,
        ['Administrador', 'Acceso total al sistema', permissions]
      );
      
      const [newRole] = await connection.execute(
        'SELECT id FROM roles WHERE name = ?',
        ['Administrador']
      );
      roleId = newRole[0].id;
      console.log('✓ Rol de Administrador creado');
    } else {
      roleId = roles[0].id;
      console.log('✓ Rol de Administrador ya existe');
    }

    // 2. Verificar si existe el usuario admin
    console.log('\nVerificando usuario admin...');
    const [users] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    if (users.length === 0) {
      console.log('Creando usuario admin...');
      await connection.execute(
        `INSERT INTO users (
          id, username, email, password, firstName, lastName, 
          roleId, isActive, createdAt, updatedAt
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, true, NOW(), NOW())`,
        [
          'admin',
          'admin@disachincheros.gob.pe',
          hashedPassword,
          'Administrador',
          'Sistema',
          roleId
        ]
      );
      console.log('✓ Usuario admin creado');
    } else {
      console.log('⚠️  Usuario admin ya existe. Actualizando contraseña...');
      await connection.execute(
        'UPDATE users SET password = ?, isActive = true WHERE username = ?',
        [hashedPassword, 'admin']
      );
      console.log('✓ Contraseña actualizada');
    }

    console.log('\n✅ Proceso completado exitosamente!');
    console.log('\n🔐 Credenciales de acceso:');
    console.log('   Usuario: admin');
    console.log('   Email: admin@disachincheros.gob.pe');
    console.log('   Password: Admin123!');
    console.log('\n⚠️  Recuerda cambiar la contraseña en producción!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdmin()
  .catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
