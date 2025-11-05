/**
 * Script para probar la obtención del token de Firma Perú
 * con las credenciales reales de fwAuthorization.json
 */

import axios from 'axios';
import { FIRMA_PERU_CONFIG } from './src/config/firma-peru';

async function testTokenGeneration() {
  console.log('🔐 Probando obtención de token de Firma Perú\n');
  console.log('='.repeat(60));
  
  console.log('\n📋 Configuración:');
  console.log(`   - Client ID: ${FIRMA_PERU_CONFIG.CLIENT_ID}`);
  console.log(`   - Client Secret: ${FIRMA_PERU_CONFIG.CLIENT_SECRET.substring(0, 20)}...`);
  console.log(`   - Token URL: ${FIRMA_PERU_CONFIG.TOKEN_URL}\n`);

  try {
    console.log('🚀 Enviando solicitud de token...\n');
    
    // Usar URLSearchParams para application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('client_id', FIRMA_PERU_CONFIG.CLIENT_ID);
    params.append('client_secret', FIRMA_PERU_CONFIG.CLIENT_SECRET);

    console.log('Request Body (x-www-form-urlencoded):');
    console.log(`   client_id=${FIRMA_PERU_CONFIG.CLIENT_ID}`);
    console.log(`   client_secret=${FIRMA_PERU_CONFIG.CLIENT_SECRET.substring(0, 20)}...`);

    const response = await axios.post(
      FIRMA_PERU_CONFIG.TOKEN_URL,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      }
    );

    console.log('\n✅ Token obtenido exitosamente!\n');
    console.log('Response:');
    console.log(`   - Status: ${response.status}`);
    
    // El servidor retorna el token directamente como string
    const token = typeof response.data === 'string' ? response.data : response.data.access_token;
    
    if (token) {
      console.log(`   - Token (JWT): ${token.substring(0, 80)}...`);
      console.log(`   - Longitud: ${token.length} caracteres`);
      
      // Intentar decodificar el JWT para ver su contenido (sin verificar)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log(`\n   Payload del token:`);
          console.log(`   - Subject: ${payload.sub || 'N/A'}`);
          console.log(`   - Issued At: ${payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'}`);
          console.log(`   - Expires: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'}`);
          
          if (payload.exp) {
            const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
            console.log(`   - Expira en: ${expiresIn} segundos (${Math.floor(expiresIn / 60)} minutos)`);
          }
        }
      } catch (e) {
        console.log('   (No se pudo decodificar el payload del JWT)');
      }
      console.log('');
    } else {
      console.log('\n⚠️  No se pudo obtener el token del response.\n');
    }

    console.log('='.repeat(60));
    console.log('🎉 ¡Credenciales de Firma Perú verificadas correctamente!');
    console.log('='.repeat(60));

    return response.data;

  } catch (error: any) {
    console.error('\n❌ Error al obtener token:\n');
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        console.error('\n⚠️  Posibles causas:');
        console.error('   - Credenciales incorrectas (client_id o client_secret)');
        console.error('   - URL del token incorrecta');
        console.error('   - Credenciales expiradas o revocadas');
      } else if (error.request) {
        console.error('No se pudo conectar al servidor de Firma Perú');
        console.error('\n⚠️  Posibles causas:');
        console.error('   - Sin conexión a internet');
        console.error('   - URL incorrecta');
        console.error('   - Firewall bloqueando la conexión');
      }
    } else {
      console.error('Error:', error.message);
    }
    
    console.error('\n='.repeat(60));
    throw error;
  }
}

// Ejecutar test
testTokenGeneration()
  .then(() => {
    console.log('\n✅ Test completado exitosamente');
    process.exit(0);
  })
  .catch(() => {
    console.error('\n❌ Test falló');
    process.exit(1);
  });
