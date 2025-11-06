// Script para generar hash de contraseña con bcrypt
// Uso: node generar-hash-password.js

const bcrypt = require('bcryptjs');

// Contraseña por defecto
const password = 'Admin123!';

// Generar hash
const hash = bcrypt.hashSync(password, 10);

console.log('========================================');
console.log('  HASH DE CONTRASEÑA GENERADO');
console.log('========================================');
console.log('');
console.log('Contraseña:', password);
console.log('Hash:', hash);
console.log('');
console.log('Copia este hash y úsalo en el archivo crear-usuario-admin.sql');
console.log('Reemplaza el valor del campo "password" en el INSERT de users');
console.log('');
console.log('========================================');

