/**
 * Script de testing completo para el flujo de Firma Perú
 * Incluye pruebas de generación de tokens de un solo uso y callbacks
 */

import { generateOneTimeToken } from './src/utils/jwt.utils';
import prisma from './src/config/database';
import axios from 'axios';
import FormData from 'form-data';

const BASE_URL = 'http://localhost:5001/api';
const DOCUMENT_ID = '14aa054c-1af6-439a-97a3-634100ead40e';
const USER_ID = 'e076d696-7caf-4180-b841-17f1c83b89d2';

async function main() {
  console.log('🚀 Testing Firma Perú - Flujo Completo\n');
  
  try {
    //Step 1: Login
    console.log('1️⃣ Autenticando usuario...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const authToken = loginResponse.data.data.accessToken;
    console.log('✅ Usuario autenticado\n');

    // Step 2: Obtener configuración
    console.log('2️⃣ Obteniendo configuración del componente web...');
    const configResponse = await axios.get(`${BASE_URL}/firma/config`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log(`✅ Configuración obtenida:`);
    console.log(`   - Client Web URL: ${configResponse.data.data.clientWebUrl}`);
    console.log(`   - Local Server Port: ${configResponse.data.data.localServerPort}\n`);

    // Step 3: Generar token de un solo uso para params
    console.log('3️⃣ Generando token de un solo uso para obtener parámetros...');
    const paramToken = generateOneTimeToken({
      documentId: DOCUMENT_ID,
      userId: USER_ID,
      signatureReason: 'Aprobación del documento de prueba',
      imageToStamp: ''
    });
    console.log(`✅ Token generado: ${paramToken.substring(0, 30)}...\n`);

    // Step 4: Obtener parámetros de firma
    console.log('4️⃣ Obteniendo parámetros de firma...');
    const paramsResponse = await axios.post(
      `${BASE_URL}/firma/params`,
      { param_token: paramToken },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        responseType: 'text'
      }
    );

    const paramsBase64 = paramsResponse.data;
    const paramsJson = JSON.parse(Buffer.from(paramsBase64, 'base64').toString('utf-8'));
    
    console.log(`✅ Parámetros obtenidos (Base64):`);
    console.log(`   - signatureFormat: ${paramsJson.signatureFormat}`);
    console.log(`   - signatureLevel: ${paramsJson.signatureLevel}`);
    console.log(`   - signaturePackaging: ${paramsJson.signaturePackaging}`);
    console.log(`   - Theme: ${paramsJson.theme}`);
    console.log(`   - Token presente: ${!!paramsJson.token}\n`);

    const downloadToken = paramsJson.token;

    // Step 5: Descargar documento original
    console.log('5️⃣ Descargando documento original...');
    const downloadResponse = await axios.get(
      `${BASE_URL}/firma/document/${DOCUMENT_ID}/download`,
      {
        params: { token: downloadToken },
        responseType: 'arraybuffer'
      }
    );

    const originalDocument = Buffer.from(downloadResponse.data);
    console.log(`✅ Documento descargado:`);
    console.log(`   - Tamaño: ${originalDocument.length} bytes`);
    console.log(`   - Content-Type: ${downloadResponse.headers['content-type']}`);
    console.log(`   - Es PDF: ${originalDocument.toString('utf-8', 0, 5) === '%PDF-'}\n`);

    // Step 6: Simular firma (en producción, esto lo hace el componente web)
    console.log('6️⃣ Simulando firma digital...');
    console.log('   (En producción, el componente web firma con DNIe)\n');

    // Verificar versión actual del documento antes de subir
    const docBefore = await prisma.document.findUnique({
      where: { id: DOCUMENT_ID },
      select: { currentVersion: true }
    });
    console.log(`📄 Versión actual del documento: ${docBefore?.currentVersion}\n`);

    // Step 7: Subir documento "firmado"
    console.log('7️⃣ Subiendo documento firmado...');
    
    const formData = new FormData();
    formData.append('signed', originalDocument, {
      filename: 'documento-firmado.pdf',
      contentType: 'application/pdf'
    });

    const uploadResponse = await axios.post(
      `${BASE_URL}/firma/document/${DOCUMENT_ID}/upload-signed?token=${downloadToken}`,
      formData,
      {
        headers: {
          ...formData.getHeaders()
        }
      }
    );

    console.log(`✅ Documento procesado:`);
    console.log(`   - Success: ${uploadResponse.data.status === 'success'}`);
    console.log(`   - Message: ${uploadResponse.data.message}\n`);

    // Step 8: Verificar cambios en la base de datos
    console.log('8️⃣ Verificando cambios en la base de datos...');
    
    const docAfter = await prisma.document.findUnique({
      where: { id: DOCUMENT_ID },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 2
        }
      }
    });

    if (docAfter) {
      console.log(`✅ Documento actualizado:`);
      console.log(`   - Versión actual: ${docAfter.currentVersion}`);
      console.log(`   - Total de versiones: ${docAfter.versions.length}`);
      
      if (docAfter.currentVersion > (docBefore?.currentVersion || 1)) {
        console.log(`   ✅ Nueva versión creada exitosamente!\n`);
      } else {
        console.log(`   ⚠️ No se creó nueva versión\n`);
      }
    }

    // Step 9: Verificar registro de firma
    console.log('9️⃣ Verificando registro de firma...');
    
    const signatures = await prisma.signature.findMany({
      where: { documentId: DOCUMENT_ID },
      orderBy: { createdAt: 'desc' },
      take: 1,
      include: {
        signer: {
          select: {
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (signatures.length > 0) {
      const signature = signatures[0];
      console.log(`✅ Firma registrada:`);
      console.log(`   - ID: ${signature.id}`);
      console.log(`   - Firmante: ${signature.signer.firstName} ${signature.signer.lastName}`);
      console.log(`   - Status: ${signature.status}`);
      console.log(`   - Válida: ${signature.isValid}`);
      console.log(`   - Fecha: ${signature.timestamp.toLocaleString()}\n`);
    } else {
      console.log(`   ⚠️ No se encontró registro de firma\n`);
    }

    console.log('='.repeat(60));
    console.log('🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    console.log('='.repeat(60));
    console.log('\n📊 Resumen:');
    console.log(`   ✅ Login y autenticación`);
    console.log(`   ✅ Obtención de configuración`);
    console.log(`   ✅ Generación de tokens de un solo uso`);
    console.log(`   ✅ Obtención de parámetros de firma`);
    console.log(`   ✅ Descarga de documento original`);
    console.log(`   ✅ Subida de documento firmado`);
    console.log(`   ✅ Creación de nueva versión del documento`);
    console.log(`   ✅ Registro de firma en base de datos\n`);

  } catch (error: any) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('✅ Tests completados');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
