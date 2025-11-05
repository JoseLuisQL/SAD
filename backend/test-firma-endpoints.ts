import axios from 'axios';
import { generateOneTimeToken } from './src/utils/jwt.utils';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5001';
const DOCUMENT_ID = '14aa054c-1af6-439a-97a3-634100ead40e';
const USER_ID = 'e076d696-7caf-4180-b841-17f1c83b89d2';

interface TestResult {
  testName: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(testName: string, status: 'SUCCESS' | 'FAILED', message: string, data?: any) {
  results.push({ testName, status, message, data });
  const emoji = status === 'SUCCESS' ? '✅' : '❌';
  console.log(`\n${emoji} ${testName}`);
  console.log(`   ${message}`);
  if (data) {
    console.log(`   Data:`, JSON.stringify(data, null, 2).substring(0, 200));
  }
}

async function runTests() {
  console.log('🚀 Iniciando pruebas de endpoints de Firma Perú\n');
  console.log('='.repeat(60));

  let authToken: string = '';

  // TEST 1: Login
  try {
    console.log('\n📝 TEST 1: Login - Obtener Token JWT');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.data.accessToken;
    logTest(
      'Login',
      'SUCCESS',
      'Usuario autenticado exitosamente',
      { username: loginResponse.data.data.user.username }
    );
  } catch (error: any) {
    console.error('Error completo:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    logTest(
      'Login',
      'FAILED',
      error.response?.data?.message || error.message || 'Error desconocido'
    );
    return;
  }

  // TEST 2: GET /api/firma/config
  try {
    console.log('\n📝 TEST 2: GET /api/firma/config');
    const configResponse = await axios.get(`${BASE_URL}/api/firma/config`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    logTest(
      'GET /api/firma/config',
      'SUCCESS',
      'Configuración obtenida correctamente',
      configResponse.data.data
    );
  } catch (error: any) {
    logTest(
      'GET /api/firma/config',
      'FAILED',
      error.response?.data?.message || error.message
    );
  }

  // TEST 3: POST /api/firma/params (con param_token válido)
  try {
    console.log('\n📝 TEST 3: POST /api/firma/params (generar parámetros de firma)');
    
    // Generar el param_token (esto normalmente lo haría el frontend)
    const paramToken = generateOneTimeToken({
      documentId: DOCUMENT_ID,
      userId: USER_ID,
      signatureReason: 'Aprobación del documento de prueba',
      imageToStamp: ''
    });

    const paramsResponse = await axios.post(
      `${BASE_URL}/api/firma/params`,
      { param_token: paramToken },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // El response debe ser un string Base64
    const paramsBase64 = paramsResponse.data;
    const paramsJson = JSON.parse(Buffer.from(paramsBase64, 'base64').toString('utf-8'));
    
    logTest(
      'POST /api/firma/params',
      'SUCCESS',
      'Parámetros de firma generados correctamente en Base64',
      {
        signatureFormat: paramsJson.signatureFormat,
        signatureLevel: paramsJson.signatureLevel,
        documentToSign: paramsJson.documentToSign.substring(0, 80) + '...',
        uploadDocumentSigned: paramsJson.uploadDocumentSigned.substring(0, 80) + '...',
        hasToken: !!paramsJson.token
      }
    );

    // Guardar el token para las siguientes pruebas
    const oneTimeToken = paramsJson.token;

    // TEST 4: GET /api/firma/document/:id/download (descargar documento)
    try {
      console.log('\n📝 TEST 4: GET /api/firma/document/:id/download (descargar documento)');
      
      const downloadResponse = await axios.get(
        `${BASE_URL}/api/firma/document/${DOCUMENT_ID}/download`,
        {
          params: { token: oneTimeToken },
          responseType: 'arraybuffer'
        }
      );

      const downloadedBuffer = Buffer.from(downloadResponse.data);
      logTest(
        'GET /api/firma/document/:id/download',
        'SUCCESS',
        'Documento descargado correctamente',
        {
          contentType: downloadResponse.headers['content-type'],
          size: downloadedBuffer.length,
          isPDF: downloadedBuffer.toString('utf-8', 0, 5) === '%PDF-'
        }
      );

      // TEST 5: POST /api/firma/document/:id/upload-signed (simular subida de documento firmado)
      try {
        console.log('\n📝 TEST 5: POST /api/firma/document/:id/upload-signed (subir documento firmado)');
        
        // Para esta prueba, vamos a usar el mismo documento (simulando que fue firmado)
        // En producción, este sería el PDF firmado por el componente web
        const testSignedDoc = downloadedBuffer;

        // Crear FormData
        const formData = new FormData();
        formData.append('signed', testSignedDoc, {
          filename: 'documento-firmado.pdf',
          contentType: 'application/pdf'
        });

        const uploadResponse = await axios.post(
          `${BASE_URL}/api/firma/document/${DOCUMENT_ID}/upload-signed`,
          formData,
          {
            params: { token: oneTimeToken },
            headers: {
              ...formData.getHeaders()
            }
          }
        );

        logTest(
          'POST /api/firma/document/:id/upload-signed',
          'SUCCESS',
          'Documento firmado procesado correctamente',
          uploadResponse.data.data
        );

        // TEST 6: Verificar en base de datos
        try {
          console.log('\n📝 TEST 6: Verificar nueva versión y firma en base de datos');
          
          const docResponse = await axios.get(
            `${BASE_URL}/api/documents/${DOCUMENT_ID}`,
            {
              headers: { Authorization: `Bearer ${authToken}` }
            }
          );

          const newVersion = docResponse.data.data.currentVersion;
          
          logTest(
            'Verificar nueva versión en BD',
            newVersion === 2 ? 'SUCCESS' : 'FAILED',
            newVersion === 2 
              ? 'Nueva versión del documento creada (v2)' 
              : `Versión esperada: 2, versión actual: ${newVersion}`,
            {
              documentNumber: docResponse.data.data.documentNumber,
              currentVersion: docResponse.data.data.currentVersion,
              fileName: docResponse.data.data.fileName
            }
          );

        } catch (error: any) {
          logTest(
            'Verificar nueva versión en BD',
            'FAILED',
            error.response?.data?.message || error.message
          );
        }

      } catch (error: any) {
        logTest(
          'POST /api/firma/document/:id/upload-signed',
          'FAILED',
          error.response?.data?.message || error.message
        );
      }

    } catch (error: any) {
      logTest(
        'GET /api/firma/document/:id/download',
        'FAILED',
        error.response?.data?.message || error.message
      );
    }

  } catch (error: any) {
    logTest(
      'POST /api/firma/params',
      'FAILED',
      error.response?.data?.message || error.message
    );
  }

  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS\n');
  
  const successCount = results.filter(r => r.status === 'SUCCESS').length;
  const failedCount = results.filter(r => r.status === 'FAILED').length;
  
  console.log(`Total de pruebas: ${results.length}`);
  console.log(`✅ Exitosas: ${successCount}`);
  console.log(`❌ Fallidas: ${failedCount}`);
  console.log('\nDetalle:');
  results.forEach((result, index) => {
    const emoji = result.status === 'SUCCESS' ? '✅' : '❌';
    console.log(`${index + 1}. ${emoji} ${result.testName}: ${result.message}`);
  });

  console.log('\n' + '='.repeat(60));
  
  if (failedCount === 0) {
    console.log('🎉 ¡Todas las pruebas pasaron exitosamente!\n');
  } else {
    console.log(`⚠️  ${failedCount} prueba(s) fallaron\n`);
  }
}

runTests()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal en las pruebas:', error);
    process.exit(1);
  });
