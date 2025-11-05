import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { FIRMA_PERU_CONFIG } from '../config/firma-peru';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

const getAccessToken = async (): Promise<string> => {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.token;
  }

  if (!FIRMA_PERU_CONFIG.CLIENT_ID || !FIRMA_PERU_CONFIG.CLIENT_SECRET) {
    console.warn('Firma Perú OAuth credentials not configured, skipping authentication');
    return '';
  }

  try {
    // Usar URLSearchParams para application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('client_id', FIRMA_PERU_CONFIG.CLIENT_ID);
    params.append('client_secret', FIRMA_PERU_CONFIG.CLIENT_SECRET);

    const response = await axios.post<string>(
      FIRMA_PERU_CONFIG.TOKEN_URL,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      }
    );

    // El servidor retorna el token directamente como string (JWT)
    const token = typeof response.data === 'string' ? response.data : '';
    
    if (!token) {
      throw new Error('No se recibió token del servidor');
    }

    // Decodificar el JWT para obtener la fecha de expiración
    let expiresAt = Date.now() + (24 * 60 * 60 * 1000); // Default: 24 horas
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        if (payload.exp) {
          // Restar 1 minuto como margen de seguridad
          expiresAt = (payload.exp * 1000) - 60000;
        }
      }
    } catch (e) {
      console.warn('No se pudo decodificar el payload del JWT, usando tiempo por defecto');
    }

    tokenCache = {
      token,
      expiresAt
    };

    console.log(`✅ Token de Firma Perú obtenido. Expira: ${new Date(expiresAt).toLocaleString()}`);

    return tokenCache.token;
  } catch (error) {
    console.error('Error obtaining Firma Perú access token:', error);
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `Error al obtener token de Firma Perú: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
        );
      }
    }
    throw new Error(
      `Error al obtener token de autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

interface FirmaPeruServiceInfo {
  'vAuthorization.json': string;
  'credentials.json': string;
  temp: string;
  log: string;
  'user.home': string;
  home: string;
}

interface FirmaPeruValidationResponse {
  result: string;
  validationDate: string;
  file: string;
  signatures: number;
  validSignatures: number;
  integrity: string;
  observations: string[];
  listSignatures: FirmaSignature[];
  detailedReport: string;
  trustedSignatures: boolean;
  errorMessage: string;
  generatedBy: string;
}

interface FirmaSignature {
  number: number;
  signer: string;
  status: string;
  date: string;
  format: string;
  signatureAlgorithm: string;
  rootInTsl: boolean;
  serial: string;
  notBeFore: string;
  notAfter: string;
  chain: string[];
  trustSigningTime: boolean;
  timestampType?: string;
  tsaNotes?: string;
  tsaDate?: string;
  tsaSignatureAlgorithm?: string;
  rootTsaInTsl?: boolean;
  tsaSerial?: string;
  tsaNotBeFore?: string;
  tsaNotAfter?: string;
  tsaChain?: string[];
  indications: string[];
  informations: string[];
  warnings: string[];
  errors: string[];
  notes: string[];
  issuerDN: string;
  subjectDN: string;
  contactInfo: string;
}

interface CleanTempResponse {
  status: string;
  error_message?: string;
}

export const getServiceInfo = async (): Promise<FirmaPeruServiceInfo> => {
  try {
    const token = await getAccessToken();
    const headers: any = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.get<FirmaPeruServiceInfo>(
      `${FIRMA_PERU_CONFIG.API_URL}/info`,
      {
        headers,
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new Error(
          `Error del servicio de Firma Perú: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error(
          `No se pudo conectar con el servicio de Firma Perú en ${FIRMA_PERU_CONFIG.API_URL}. Verifique que el servicio esté desplegado y accesible.`
        );
      }
    }
    throw new Error(
      `Error al obtener información del servicio de Firma Perú: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

export const validateSignature = async (
  signedDocumentBuffer: Buffer,
  documentExtension: string,
  originalDocumentBuffer?: Buffer
): Promise<FirmaPeruValidationResponse> => {
  try {
    const token = await getAccessToken();
    const formData = new FormData();

    const paramJson = JSON.stringify({
      documentExtension: documentExtension.toLowerCase().replace('.', ''),
    });

    formData.append('param', paramJson);
    formData.append('credential', FIRMA_PERU_CONFIG.CREDENTIAL);
    formData.append('signed', signedDocumentBuffer, {
      filename: `document.${documentExtension}`,
      contentType: 'application/octet-stream',
    });

    if (originalDocumentBuffer && documentExtension.toLowerCase() === 'p7s') {
      formData.append('original', originalDocumentBuffer, {
        filename: 'original',
        contentType: 'application/octet-stream',
      });
    }

    const headers: any = {
      ...formData.getHeaders(),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post<FirmaPeruValidationResponse>(
      `${FIRMA_PERU_CONFIG.API_URL}/validation`,
      formData,
      {
        headers,
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const responseData = axiosError.response.data as any;
        if (responseData?.errorMessage) {
          throw new Error(`Error de validación: ${responseData.errorMessage}`);
        }
        throw new Error(
          `Error del servicio de Firma Perú: ${axiosError.response.status} - ${JSON.stringify(axiosError.response.data)}`
        );
      } else if (axiosError.request) {
        throw new Error(
          `No se pudo conectar con el servicio de Firma Perú. Verifique que el servicio esté desplegado y accesible.`
        );
      }
    }
    throw new Error(
      `Error al validar firma digital: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

export const cleanTemp = async (): Promise<CleanTempResponse> => {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams();
    params.append('credential', FIRMA_PERU_CONFIG.CREDENTIAL);

    const headers: any = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post<CleanTempResponse>(
      `${FIRMA_PERU_CONFIG.API_URL}/clean_temp`,
      params,
      {
        headers,
        timeout: 10000,
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.error_message || 'Error al limpiar archivos temporales'
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const responseData = axiosError.response.data as CleanTempResponse;
        throw new Error(
          responseData.error_message || `Error del servicio: ${axiosError.response.status}`
        );
      } else if (axiosError.request) {
        throw new Error(
          'No se pudo conectar con el servicio de Firma Perú para limpiar temporales.'
        );
      }
    }
    throw new Error(
      `Error al limpiar archivos temporales: ${error instanceof Error ? error.message : 'Error desconocido'}`
    );
  }
};

export const parseFirmaPeruValidationResponse = (response: FirmaPeruValidationResponse) => {
  const isValid = response.result === 'VÁLIDO';
  const hasSignatures = response.signatures > 0;

  const parsedSignatures = response.listSignatures.map((sig) => ({
    number: sig.number,
    signer: sig.signer,
    status: sig.status,
    date: sig.date,
    format: sig.format,
    signatureAlgorithm: sig.signatureAlgorithm,
    certificateData: {
      serial: sig.serial,
      issuerDN: sig.issuerDN,
      subjectDN: sig.subjectDN,
      notBefore: sig.notBeFore,
      notAfter: sig.notAfter,
      rootInTsl: sig.rootInTsl,
      chain: sig.chain,
      contactInfo: sig.contactInfo,
    },
    timestampData: sig.timestampType ? {
      type: sig.timestampType,
      date: sig.tsaDate,
      notes: sig.tsaNotes,
      signatureAlgorithm: sig.tsaSignatureAlgorithm,
      serial: sig.tsaSerial,
      notBefore: sig.tsaNotBeFore,
      notAfter: sig.tsaNotAfter,
      rootInTsl: sig.rootTsaInTsl,
      chain: sig.tsaChain,
      trustSigningTime: sig.trustSigningTime,
    } : null,
    indications: sig.indications || [],
    informations: sig.informations || [],
    warnings: sig.warnings || [],
    errors: sig.errors || [],
    notes: sig.notes || [],
  }));

  return {
    result: response.result,
    validationDate: response.validationDate,
    file: response.file,
    signatures: response.signatures,
    validSignatures: response.validSignatures,
    integrity: response.integrity,
    observations: response.observations || [],
    trustedSignatures: response.trustedSignatures,
    errorMessage: response.errorMessage || null,
    generatedBy: response.generatedBy,
    detailedReport: response.detailedReport,
    isValid,
    hasSignatures,
    parsedSignatures,
  };
};

export type {
  FirmaPeruServiceInfo,
  FirmaPeruValidationResponse,
  FirmaSignature,
  CleanTempResponse,
};

// ==================== FUNCIONES PARA EL COMPONENTE WEB DE FIRMA PERÚ ====================

import prisma from '../config/database';
import * as storageService from './storage.service';
import * as signatureFlowService from './signature-flow.service';
import * as fs from 'fs';
import * as path from 'path';
import { log as auditLog } from './audit.service';
import { Request } from 'express';

/**
 * Genera los parámetros JSON para el componente web de Firma Perú.
 * @param documentId ID del documento a firmar.
 * @param userId ID del usuario que firma.
 * @param signatureReason Razón de la firma.
 * @param imageToStamp URL de la imagen de estampado (opcional).
 * @param flowId ID del flujo de firma (opcional).
 * @returns Objeto JSON con los parámetros de firma codificado en Base64.
 */
export const generateSignatureParams = async (
  documentId: string,
  userId: string,
  signatureReason: string,
  imageToStamp?: string,
  flowId?: string
): Promise<string> => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Documento no encontrado.');
  }

  // Generar un simple ID de sesión para las URLs (incluye flowId si existe)
  const sessionData = flowId 
    ? `${documentId}:${userId}:${Date.now()}:${flowId}`
    : `${documentId}:${userId}:${Date.now()}`;
  const sessionId = Buffer.from(sessionData).toString('base64');
  
  // Obtener token oficial de Firma Perú (usa el token cacheado que obtiene getAccessToken())
  const firmaPeruToken = await getAccessToken();

  const params: any = {
    signatureFormat: 'PAdES', // O XAdES/CAdES según el tipo de documento y requerimiento
    signatureLevel: 'B', // B, T, LTA
    signaturePackaging: 'enveloped', // enveloped, detached, internallydetached
    documentToSign: `${FIRMA_PERU_CONFIG.BACKEND_BASE_URL}/document/${documentId}/download?session=${sessionId}`, // Endpoint para descargar el documento
    certificateFilter: '.*', // Filtrar certificados si es necesario, ej: '.*FIR.*'
    webTsa: '', // URL del servicio de sello de tiempo TSA (si aplica)
    userTsa: '',
    passwordTsa: '',
    theme: 'claro', // Estilo de la interfaz del firmador
    visiblePosition: true, // Permite al usuario posicionar la firma visualmente
    contactInfo: userId, // Información de contacto del firmante
    signatureReason: signatureReason, // Razón de la firma
    bachtOperation: false, // true para firma en lote
    oneByOne: true, // true si bachtOperation es true y se firma uno por uno
    signatureStyle: 1, // Estilo de la representación gráfica de la firma
    stampTextSize: 14,
    stampWordWrap: 37,
    role: 'Firmante', // Rol del firmante
    stampPage: 1, // Página donde se estampará la firma (si visiblePosition es false)
    positionx: 20, // Posición X (si visiblePosition es false)
    positiony: 20, // Posición Y (si visiblePosition es false)
    uploadDocumentSigned: `${FIRMA_PERU_CONFIG.BACKEND_BASE_URL}/document/${documentId}/upload-signed?session=${sessionId}`, // Endpoint para subir el documento firmado
    certificationSignature: false, // true para firma de certificación
    token: firmaPeruToken, // Token oficial de Firma Perú obtenido con credenciales fwAuthorization.json
  };

  // Solo incluir imageToStamp si tiene un valor válido
  console.log('🔍 DEBUG - imageToStamp recibido:', imageToStamp);
  console.log('🔍 DEBUG - tipo de imageToStamp:', typeof imageToStamp);
  if (imageToStamp && imageToStamp.trim() !== '') {
    console.log('✅ DEBUG - Agregando imageToStamp al params');
    params.imageToStamp = imageToStamp;
  } else {
    console.log('❌ DEBUG - NO se agregó imageToStamp (undefined, null o vacío)');
  }
  console.log('📦 DEBUG - params finales (primeros 200 chars):', JSON.stringify(params).substring(0, 200));

  // Codificar el objeto JSON a Base64
  return Buffer.from(JSON.stringify(params)).toString('base64');
};

/**
 * Procesa el documento firmado recibido del componente web de Firma Perú.
 * @param documentId ID del documento original.
 * @param signedDocumentBuffer Buffer del documento PDF firmado.
 * @param sessionId Session ID para validación.
 * @param req Request object para audit log.
 * @returns Resultado de la operación.
 */
export const processSignedDocument = async (
  documentId: string,
  signedDocumentBuffer: Buffer,
  sessionId: string,
  req: Request
): Promise<any> => {
  // Decodificar session para obtener userId y flowId (si existe)
  const decoded = Buffer.from(sessionId, 'base64').toString('utf-8');
  const parts = decoded.split(':');
  const [, userId, , flowId] = parts; // documentId, userId, timestamp, flowId (opcional)

  // 1. Validar la firma con el servicio de validación de Firma Perú
  let validationResult;
  let validationError: string | null = null;
  try {
    console.log('🔍 Validando firma digital del documento...');
    validationResult = await validateSignature(signedDocumentBuffer, 'pdf');
    console.log('✅ Validación de firma completada exitosamente');
  } catch (error) {
    validationError = error instanceof Error ? error.message : 'Error desconocido';
    console.warn('⚠️ No se pudo validar la firma automáticamente:', validationError);
    console.warn('ℹ️ El documento se guardará con estado "Pendiente de validación"');
    // Si la validación falla, aún así guardamos el documento pero marcamos la firma como pendiente de validación
    validationResult = null;
  }

  // 2. Guardar el documento firmado como una nueva versión
  const originalDocument = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      filePath: true,
      fileName: true,
      fileSize: true,
      currentVersion: true,
      signatureStatus: true,
      createdBy: true,
      documentTypeId: true,
      documentNumber: true,
      documentDate: true,
      folioCount: true,
      sender: true,
      officeId: true,
      archivadorId: true,
      expedienteId: true,
      annotations: true,
      ocrContent: true,
      ocrStatus: true,
      mimeType: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!originalDocument) {
    throw new Error('Documento original no encontrado.');
  }

  // Validar que el documento no esté ya firmado completamente
  // EXCEPCIÓN: Si viene desde un flujo (flowId presente), permitir firmas múltiples
  if (originalDocument.signatureStatus === 'SIGNED' && !flowId) {
    throw new Error('Este documento ya está firmado. No se permite firmar documentos ya firmados desde este módulo.');
  }

  // Si viene de un flujo, permitir firmar documentos con cualquier estado (IN_FLOW, PARTIALLY_SIGNED, SIGNED)
  // porque son firmas colaborativas de múltiples usuarios
  console.log(`ℹ️ Estado del documento: ${originalDocument.signatureStatus}, FlowId: ${flowId || 'N/A'}`);
  if (flowId) {
    console.log('✅ Firma desde flujo detectada - Permitiendo firma múltiple');
  }

  // Guardar el archivo firmado en disco
  const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // PASO 1: Guardar la versión SIN FIRMA (original) - verificar si ya existe
  let originalVersion = await prisma.documentVersion.findUnique({
    where: {
      documentId_versionNumber: {
        documentId: originalDocument.id,
        versionNumber: originalDocument.currentVersion,
      },
    },
  });

  // Si no existe la versión original, crearla
  if (!originalVersion) {
    originalVersion = await prisma.documentVersion.create({
      data: {
        documentId: originalDocument.id,
        versionNumber: originalDocument.currentVersion,
        filePath: originalDocument.filePath,
        fileName: originalDocument.fileName,
        changeDescription: 'Versión original sin firma',
        createdBy: userId,
      },
    });
    console.log(`✅ Versión ${originalDocument.currentVersion} creada para documento ${documentId}`);
  } else {
    console.log(`ℹ️ Versión ${originalDocument.currentVersion} ya existe para documento ${documentId}, se reutiliza`);
  }

  // PASO 2: Guardar el archivo firmado
  const newFileName = `${Date.now()}-${originalDocument.fileName}`;
  const newFilePath = path.join(uploadsDir, newFileName);
  fs.writeFileSync(newFilePath, signedDocumentBuffer);

  // PASO 3: Actualizar el documento principal para apuntar al archivo firmado
  // Si viene de un flujo, NO actualizar el status aquí (lo hará advanceSignatureFlowFromComponent)
  // Si NO viene de un flujo, marcar como SIGNED
  await prisma.document.update({
    where: { id: documentId },
    data: {
      filePath: newFilePath,
      fileName: newFileName,
      fileSize: signedDocumentBuffer.length,
      currentVersion: originalDocument.currentVersion + 1,
      signatureStatus: flowId ? originalDocument.signatureStatus : 'SIGNED', // Mantener status si es flujo
      lastSignedAt: new Date(),
      signedBy: userId,
      updatedAt: new Date(),
    },
  });

  // 3. Registrar la firma en la base de datos
  const signatureData = validationResult ? parseFirmaPeruValidationResponse(validationResult) : {};
  const certificateData = validationResult && validationResult.listSignatures.length > 0
    ? validationResult.listSignatures[0]
    : {};

  const isValid = validationResult ? validationResult.result === 'VÁLIDO' : false;
  const status = validationResult
    ? (validationResult.result === 'VÁLIDO' ? 'VALID' : validationResult.result === 'INVÁLIDO' ? 'INVALID' : 'INDETERMINATE')
    : 'PENDING';
  
  // Construir observaciones según el resultado
  let observations: string[];
  if (validationResult) {
    observations = validationResult.observations || [];
  } else {
    observations = [
      'Firma procesada y guardada exitosamente.',
      'Validación pendiente: ' + (validationError || 'No se pudo conectar con el servicio de validación.'),
      'Puede validar la firma manualmente más adelante.'
    ];
  }

  // La firma se asocia al documento actual (versión firmada), NO a la versión sin firma
  const newSignature = await prisma.signature.create({
    data: {
      documentId: documentId,
      documentVersionId: null, // NULL = versión actual del documento (firmada)
      signerId: userId,
      signatureData: signatureData,
      certificateData: certificateData,
      timestamp: new Date(),
      isValid: isValid,
      status: status,
      observations: JSON.stringify(observations),
    },
  });

  await auditLog({
    userId,
    action: 'DOCUMENT_SIGNED',
    module: 'Firma Digital',
    entityType: 'Document',
    entityId: documentId,
    oldValue: null,
    newValue: { newVersion: originalVersion.id, signatureId: newSignature.id },
    req
  });

  // Si la firma es parte de un flujo, avanzar el flujo
  if (flowId) {
    try {
      await signatureFlowService.advanceSignatureFlowFromComponent({
        flowId,
        signerId: userId,
        signatureId: newSignature.id,
        req
      });
    } catch (error) {
      console.error('Error al avanzar flujo de firma:', error);
      // No lanzamos error para no afectar el proceso de firma,
      // pero registramos el problema
      await auditLog({
        userId,
        action: 'SIGNATURE_FLOW_ADVANCE_ERROR',
        module: 'Firma Digital',
        entityType: 'SignatureFlow',
        entityId: flowId,
        oldValue: null,
        newValue: { error: error instanceof Error ? error.message : 'Error desconocido' },
        req
      });
    }
  }

  return {
    success: true,
    message: validationResult 
      ? 'Documento firmado, validado y procesado exitosamente.'
      : 'Documento firmado y guardado exitosamente. La validación de la firma está pendiente.',
    validationResult: validationResult ? parseFirmaPeruValidationResponse(validationResult) : null,
    validationStatus: status,
    requiresManualValidation: !validationResult,
    signatureId: newSignature.id,
  };
};

/**
 * Descarga un documento para el componente web de Firma Perú.
 * @param documentId ID del documento.
 * @param oneTimeToken Token de un solo uso para validación.
 * @returns Buffer del archivo y mimeType.
 */
export const downloadDocumentForSigning = async (
  documentId: string,
  _sessionId: string // Prefijo con _ para indicar que no se usa (validación en controlador)
): Promise<{ buffer: Buffer; mimeType: string }> => {
  // La validación de la sesión ya se hace en el controlador
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Documento no encontrado.');
  }

  const fileBuffer = await storageService.getFile(document.filePath);
  return { buffer: fileBuffer, mimeType: document.mimeType };
};
