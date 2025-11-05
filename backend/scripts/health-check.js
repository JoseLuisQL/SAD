/**
 * Health Check Script para Backend
 * Verifica que el servidor esté respondiendo correctamente
 * Uso: node scripts/health-check.js
 */

const http = require('http');
const https = require('https');

const config = {
  protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http',
  host: process.env.HEALTH_CHECK_HOST || 'localhost',
  port: process.env.PORT || 5000,
  timeout: 5000,
};

const makeRequest = (options) => {
  return new Promise((resolve, reject) => {
    const client = options.protocol === 'https' ? https : http;
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
};

const checkHealth = async () => {
  console.log('🔍 Verificando salud del backend...');
  console.log(`   URL: ${config.protocol}://${config.host}:${config.port}`);
  
  const checks = [
    {
      name: 'Health Endpoint',
      path: '/api/health',
      expected: 200,
    },
    {
      name: 'Root API',
      path: '/api',
      expected: [200, 404], // Puede retornar 404 si no hay ruta raíz
    },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const options = {
        protocol: config.protocol,
        hostname: config.host,
        port: config.port,
        path: check.path,
        method: 'GET',
      };
      
      const result = await makeRequest(options);
      
      const expectedCodes = Array.isArray(check.expected) ? check.expected : [check.expected];
      const passed = expectedCodes.includes(result.statusCode);
      
      if (passed) {
        console.log(`✅ ${check.name}: OK (${result.statusCode})`);
      } else {
        console.log(`❌ ${check.name}: FAIL (esperado: ${check.expected}, recibido: ${result.statusCode})`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ERROR - ${error.message}`);
      allPassed = false;
    }
  }
  
  console.log('');
  if (allPassed) {
    console.log('✅ Todos los checks pasaron');
    process.exit(0);
  } else {
    console.log('❌ Algunos checks fallaron');
    process.exit(1);
  }
};

// Ejecutar health check
checkHealth().catch((error) => {
  console.error('❌ Error ejecutando health check:', error);
  process.exit(1);
});
