const mysql = require('mysql2/promise');

async function checkTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'archivo_digital_disa'
    });

    console.log('📋 Estructura de la tabla users:\n');
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.table(columns);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTable();
