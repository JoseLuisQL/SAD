const mysql = require('mysql2/promise');

async function addColumns() {
  let connection;
  
  try {
    console.log('🔧 Agregando columnas de intentos fallidos a la tabla users...\n');
    
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'archivo_digital_disa'
    });

    console.log('✓ Conectado a la base de datos\n');

    // Verificar si las columnas ya existen
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'archivo_digital_disa' 
        AND TABLE_NAME = 'users' 
        AND COLUMN_NAME IN ('failedAttempts', 'lastFailedAt', 'lockedUntil')
    `);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Agregar failedAttempts si no existe
    if (!existingColumns.includes('failedAttempts')) {
      console.log('Agregando columna failedAttempts...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN failedAttempts INT NOT NULL DEFAULT 0
      `);
      console.log('✓ Columna failedAttempts agregada');
    } else {
      console.log('✓ Columna failedAttempts ya existe');
    }

    // Agregar lastFailedAt si no existe
    if (!existingColumns.includes('lastFailedAt')) {
      console.log('Agregando columna lastFailedAt...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN lastFailedAt DATETIME(3) NULL
      `);
      console.log('✓ Columna lastFailedAt agregada');
    } else {
      console.log('✓ Columna lastFailedAt ya existe');
    }

    // Agregar lockedUntil si no existe
    if (!existingColumns.includes('lockedUntil')) {
      console.log('Agregando columna lockedUntil...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN lockedUntil DATETIME(3) NULL
      `);
      console.log('✓ Columna lockedUntil agregada');
    } else {
      console.log('✓ Columna lockedUntil ya existe');
    }

    console.log('\n✅ Proceso completado exitosamente!\n');
    console.log('🔄 Ahora reinicia el servidor backend para aplicar los cambios.\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addColumns()
  .catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
