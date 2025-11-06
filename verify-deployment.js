/**
 * Script de Verificación de Despliegue
 * 
 * Verifica que el backend y frontend estén funcionando correctamente
 * en los entornos de producción (Railway + Vercel)
 * 
 * Uso: node verify-deployment.js <BACKEND_URL> <FRONTEND_URL>
 * 
 * Ejemplo:
 * node verify-deployment.js https://sad-backend.up.railway.app https://sad.vercel.app
 */

const https = require('https');
const http = require('http');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

// Función para hacer peticiones HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    
    lib.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Verificar Backend
async function verifyBackend(backendUrl) {
  log('\n' + '='.repeat(50), colors.bold);
  log('🔍 VERIFICANDO BACKEND (Railway)', colors.bold);
  log('='.repeat(50) + '\n', colors.bold);
  
  logInfo(`URL: ${backendUrl}`);
  
  try {
    // Health check
    logInfo('Verificando /api/health...');
    const healthResponse = await makeRequest(`${backendUrl}/api/health`);
    
    if (healthResponse.status === 200 && healthResponse.data.status === 'OK') {
      logSuccess('Health check: OK');
      logSuccess(`Database: ${healthResponse.data.database || 'Connected'}`);
      logSuccess(`Environment: ${healthResponse.data.environment || 'production'}`);
    } else {
      logError('Health check falló');
      console.log('Response:', healthResponse);
    }
    
    // Database stats
    logInfo('\nVerificando /api/health/db...');
    const dbResponse = await makeRequest(`${backendUrl}/api/health/db`);
    
    if (dbResponse.status === 200 && dbResponse.data.status === 'OK') {
      logSuccess('Database stats: OK');
      console.log('\nEstadísticas de Base de Datos:');
      const stats = dbResponse.data.data;
      for (const [key, value] of Object.entries(stats)) {
        console.log(`  - ${key}: ${value}`);
      }
    } else {
      logWarning('Database stats no disponibles (puede ser normal si no hay datos)');
    }
    
    logSuccess('\n✨ Backend verificado correctamente');
    return true;
  } catch (error) {
    logError(`Error al conectar con el backend: ${error.message}`);
    logWarning('Verifica que:');
    console.log('  1. La URL del backend sea correcta');
    console.log('  2. El servicio esté corriendo en Railway');
    console.log('  3. El dominio esté generado en Railway');
    return false;
  }
}

// Verificar Frontend
async function verifyFrontend(frontendUrl) {
  log('\n' + '='.repeat(50), colors.bold);
  log('🔍 VERIFICANDO FRONTEND (Vercel)', colors.bold);
  log('='.repeat(50) + '\n', colors.bold);
  
  logInfo(`URL: ${frontendUrl}`);
  
  try {
    logInfo('Verificando accesibilidad...');
    const response = await makeRequest(frontendUrl);
    
    if (response.status === 200 || response.status === 304) {
      logSuccess('Frontend accesible: OK');
      logSuccess('El sitio está desplegado y respondiendo');
    } else {
      logError(`Frontend respondió con status: ${response.status}`);
    }
    
    logSuccess('\n✨ Frontend verificado correctamente');
    logInfo('Abre el frontend en tu navegador para verificar la interfaz de usuario');
    return true;
  } catch (error) {
    logError(`Error al conectar con el frontend: ${error.message}`);
    logWarning('Verifica que:');
    console.log('  1. La URL del frontend sea correcta');
    console.log('  2. El proyecto esté desplegado en Vercel');
    console.log('  3. El despliegue haya terminado correctamente');
    return false;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log('\n' + '='.repeat(50), colors.bold);
    log('📋 VERIFICADOR DE DESPLIEGUE - Sistema SAD', colors.bold);
    log('='.repeat(50) + '\n', colors.bold);
    
    logError('Uso incorrecto\n');
    console.log('Uso: node verify-deployment.js <BACKEND_URL> <FRONTEND_URL>\n');
    console.log('Ejemplo:');
    console.log('  node verify-deployment.js https://sad-backend.up.railway.app https://sad.vercel.app\n');
    console.log('URLs sin rutas adicionales (sin /api/health, /login, etc.)');
    process.exit(1);
  }
  
  const backendUrl = args[0].replace(/\/$/, ''); // Eliminar slash final
  const frontendUrl = args[1].replace(/\/$/, ''); // Eliminar slash final
  
  log('\n' + '='.repeat(50), colors.bold);
  log('📋 VERIFICADOR DE DESPLIEGUE - Sistema SAD', colors.bold);
  log('='.repeat(50), colors.bold);
  
  const backendOk = await verifyBackend(backendUrl);
  const frontendOk = await verifyFrontend(frontendUrl);
  
  log('\n' + '='.repeat(50), colors.bold);
  log('📊 RESUMEN DE VERIFICACIÓN', colors.bold);
  log('='.repeat(50) + '\n', colors.bold);
  
  if (backendOk) {
    logSuccess('Backend (Railway): OK');
  } else {
    logError('Backend (Railway): FALLÓ');
  }
  
  if (frontendOk) {
    logSuccess('Frontend (Vercel): OK');
  } else {
    logError('Frontend (Vercel): FALLÓ');
  }
  
  if (backendOk && frontendOk) {
    log('\n' + '='.repeat(50), colors.bold);
    logSuccess('🎉 ¡DESPLIEGUE EXITOSO!');
    log('='.repeat(50) + '\n', colors.bold);
    console.log('Tu sistema SAD está funcionando correctamente en producción.\n');
    console.log('Próximos pasos:');
    console.log(`  1. Abre el frontend: ${frontendUrl}`);
    console.log('  2. Intenta hacer login con tus credenciales');
    console.log('  3. Verifica que puedas crear y consultar documentos');
    console.log('\n¡Felicidades! 🚀\n');
    process.exit(0);
  } else {
    log('\n' + '='.repeat(50), colors.bold);
    logError('❌ DESPLIEGUE INCOMPLETO');
    log('='.repeat(50) + '\n', colors.bold);
    console.log('Revisa los errores anteriores y consulta DEPLOYMENT.md para más ayuda.\n');
    process.exit(1);
  }
}

main();
