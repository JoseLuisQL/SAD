import { Request, Response } from 'express';
import * as firmaPeruService from '../services/firma-peru.service';
import * as signatureService from '../services/signature.service';
import * as verificationService from '../services/verification.service';
import * as signatureReversionService from '../services/signature-reversion.service';
import * as signatureStatusService from '../services/signature-status.service';
import * as validationReportService from '../services/validation-report.service';
import * as fs from 'fs';
import * as path from 'path';
import { uuidSchema } from '../utils/validators';
import { FIRMA_PERU_CONFIG } from '../config/firma-peru';
import { verifyOneTimeToken, generateOneTimeToken } from '../utils/jwt.utils';

export const getInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const serviceInfo = await firmaPeruService.getServiceInfo();

    res.status(200).json({
      status: 'success',
      message: 'Información del servicio de Firma Perú obtenida correctamente',
      data: serviceInfo
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener información del servicio'
    });
  }
};

export const testValidation = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo para validar'
      });
      return;
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

    if (!['pdf', 'xml', 'p7s'].includes(fileExtension)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(400).json({
        status: 'error',
        message: 'El archivo debe ser PDF, XML o P7S'
      });
      return;
    }

    const fileBuffer = fs.readFileSync(file.path);

    let originalBuffer: Buffer | undefined;
    if (fileExtension === 'p7s' && req.body.originalFile) {
      originalBuffer = Buffer.from(req.body.originalFile, 'base64');
    }

    const validationResult = await firmaPeruService.validateSignature(
      fileBuffer,
      fileExtension,
      originalBuffer
    );

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      status: 'success',
      message: 'Validación de firma digital completada',
      data: validationResult
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof Error) {
      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Error de validación')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al validar firma digital'
    });
  }
};

export const cleanTemporaryFiles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await firmaPeruService.cleanTemp();

    res.status(200).json({
      status: 'success',
      message: 'Archivos temporales limpiados correctamente',
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al limpiar archivos temporales'
    });
  }
};

export const signIndividualDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: documentId } = req.params;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo firmado'
      });
      return;
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

    if (!['pdf', 'xml', 'p7s'].includes(fileExtension)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(400).json({
        status: 'error',
        message: 'El archivo debe ser PDF, XML o P7S'
      });
      return;
    }

    const signedFileBuffer = fs.readFileSync(file.path);

    const result = await signatureService.signDocument({
      documentId,
      signerId: req.user!.id,
      documentExtension: fileExtension,
      signedFileBuffer,
      req
    });

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (result.status === 'error') {
      res.status(400).json({
        status: 'error',
        message: result.error || 'Error al procesar firma del documento'
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Documento firmado y validado correctamente',
      data: result.validationData
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof Error) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al firmar documento'
    });
  }
};

export const signBatchDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionaron archivos'
      });
      return;
    }

    let documentMetadata: Array<{
      documentId: string;
      documentExtension: string;
    }>;

    try {
      documentMetadata = JSON.parse(req.body.documentMetadata);
      
      if (!Array.isArray(documentMetadata)) {
        throw new Error('documentMetadata debe ser un array');
      }
    } catch (parseError) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      res.status(400).json({
        status: 'error',
        message: 'El campo documentMetadata debe ser un JSON array válido'
      });
      return;
    }

    if (req.files.length !== documentMetadata.length) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
      res.status(400).json({
        status: 'error',
        message: 'El número de archivos no coincide con los metadatos proporcionados'
      });
      return;
    }

    const documents = req.files.map((file, index) => {
      const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();
      
      if (!['pdf', 'xml', 'p7s'].includes(fileExtension)) {
        throw new Error(`El archivo ${file.originalname} debe ser PDF, XML o P7S`);
      }

      return {
        documentId: documentMetadata[index].documentId,
        signedFileBuffer: fs.readFileSync(file.path),
        documentExtension: fileExtension
      };
    });

    const result = await signatureService.signMultipleDocuments(
      documents,
      req.user!.id,
      req
    );

    for (const file of req.files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    res.status(200).json({
      status: 'success',
      message: `Proceso completado. ${result.successful} exitosos, ${result.failed} fallidos`,
      data: result
    });
  } catch (error) {
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    if (error instanceof Error) {
      if (error.message.includes('no coincide')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('debe ser PDF, XML o P7S')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al firmar documentos'
    });
  }
};

export const verifyDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: documentId } = req.params;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const verificationResult = await verificationService.verifyDocumentSignatures(
      documentId,
      req.user!.id,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Verificación de firma digital completada',
      data: verificationResult
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Documento no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Error de validación')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al verificar firma digital'
    });
  }
};

export const uploadAndVerify = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se proporcionó ningún archivo para verificar'
      });
      return;
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname).substring(1).toLowerCase();

    if (!['pdf', 'xml', 'p7s'].includes(fileExtension)) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      res.status(400).json({
        status: 'error',
        message: 'El archivo debe ser PDF, XML o P7S'
      });
      return;
    }

    const fileBuffer = fs.readFileSync(file.path);

    const verificationResult = await verificationService.verifyUploadedDocument(
      fileBuffer,
      fileExtension,
      req.user!.id,
      req
    );

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    res.status(200).json({
      status: 'success',
      message: 'Verificación de firma digital completada',
      data: verificationResult
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error instanceof Error) {
      if (error.message.includes('No se pudo conectar')) {
        res.status(503).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('Error de validación')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al verificar firma digital'
    });
  }
};

// ==================== ENDPOINTS PARA COMPONENTE WEB DE FIRMA PERÚ ====================

/**
 * Endpoint para generar un token de un solo uso para el proceso de firma.
 * POST /api/firma/params-request
 */
export const generateOneTimeTokenForSigning = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, signatureReason, imageToStamp, flowId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado.'
      });
      return;
    }

    if (!documentId || !signatureReason) {
      res.status(400).json({
        status: 'error',
        message: 'documentId y signatureReason son requeridos.'
      });
      return;
    }

    const oneTimeToken = generateOneTimeToken({
      documentId,
      userId,
      signatureReason,
      imageToStamp: imageToStamp || undefined,
      flowId: flowId || undefined
    });

    res.status(200).json({
      status: 'success',
      message: 'Token de un solo uso generado correctamente',
      data: { oneTimeToken }
    });
  } catch (error) {
    console.error('Error al generar token de un solo uso para firma:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error interno del servidor.'
    });
  }
};

/**
 * Endpoint para obtener la configuración del componente web de Firma Perú.
 * GET /api/firma/config
 */
export const getConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Configuración del componente web de Firma Perú',
      data: {
        clientWebUrl: FIRMA_PERU_CONFIG.CLIENT_WEB_URL,
        localServerPort: FIRMA_PERU_CONFIG.LOCAL_SERVER_PORT,
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener configuración de Firma Perú'
    });
  }
};

/**
 * Endpoint para que el componente web de Firma Perú obtenga los parámetros de firma.
 * Recibe un token de un solo uso para validar la solicitud.
 * POST /api/firma/params
 */
export const getSignatureParams = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('🔍 getSignatureParams - req.body:', req.body);
    const { param_token } = req.body;
    console.log('🔍 getSignatureParams - param_token:', param_token);
    
    if (!param_token) {
      console.log('❌ getSignatureParams - No se proporcionó param_token');
      res.status(400).json({
        status: 'error',
        message: 'Token de parámetro requerido.'
      });
      return;
    }

    console.log('🔍 getSignatureParams - Verificando token...');
    const tokenPayload = verifyOneTimeToken(param_token);
    console.log('🔍 getSignatureParams - tokenPayload:', tokenPayload);
    
    if (!tokenPayload) {
      console.log('❌ getSignatureParams - Token inválido o expirado');
      res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado.'
      });
      return;
    }
    
    console.log('✅ getSignatureParams - Token válido, generando parámetros...');

    const { documentId, userId, signatureReason, imageToStamp, flowId } = tokenPayload;
    const paramsBase64 = await firmaPeruService.generateSignatureParams(
      documentId,
      userId,
      signatureReason || 'Firma de documento',
      imageToStamp,
      flowId
    );

    // Retorna el JSON codificado en Base64 (texto plano, no JSON)
    res.status(200).send(paramsBase64);
  } catch (error) {
    console.error('Error al generar parámetros de firma:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error interno del servidor.'
    });
  }
};

/**
 * Endpoint para que el componente web de Firma Perú descargue el documento original.
 * Recibe un token de un solo uso para validar la solicitud.
 * GET /api/firma/document/:documentId/download
 */
export const downloadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { session } = req.query;

    console.log('📥 downloadDocument - documentId:', documentId);
    console.log('📥 downloadDocument - session:', session);

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    if (!session || typeof session !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Session ID requerido.'
      });
      return;
    }

    // Decodificar y validar session ID
    try {
      const decoded = Buffer.from(session, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      const [sessionDocId, sessionUserId, timestamp] = parts; // flowId opcional en parts[3]
      
      console.log('🔍 Session decodificada:', { sessionDocId, sessionUserId, timestamp, flowId: parts[3] });
      
      if (sessionDocId !== documentId) {
        throw new Error('Session ID no coincide con el documento');
      }
      
      // Verificar que la sesión no tenga más de 10 minutos
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      if (now - sessionTime > 10 * 60 * 1000) {
        throw new Error('Session expirada');
      }
      
      console.log('✅ Session válida');
    } catch (err) {
      console.error('❌ Error validando session:', err);
      res.status(401).json({
        status: 'error',
        message: 'Session inválida o expirada.'
      });
      return;
    }

    const { buffer, mimeType } = await firmaPeruService.downloadDocumentForSigning(
      documentId,
      session
    );

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="documento_original.pdf"`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error al descargar documento para firma:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Token inválido') || error.message.includes('expirado')) {
        res.status(401).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'Documento no encontrado.') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error interno del servidor.'
    });
  }
};

/**
 * Endpoint para que el componente web de Firma Perú suba el documento firmado.
 * Recibe el documento firmado como un archivo y un token de un solo uso.
 * POST /api/firma/document/:documentId/upload-signed
 */
export const uploadSignedDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { session } = req.query;

    console.log('📤 uploadSignedDocument - documentId:', documentId);
    console.log('📤 uploadSignedDocument - session:', session);

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({
        status: 'error',
        message: 'No se ha subido ningún archivo.'
      });
      return;
    }

    if (!session || typeof session !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Session ID requerido.'
      });
      return;
    }

    // Decodificar y validar session ID
    let userId: string;
    try {
      const decoded = Buffer.from(session, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      const [sessionDocId, sessionUserId, timestamp] = parts; // flowId opcional en parts[3]
      
      console.log('🔍 Session decodificada:', { sessionDocId, sessionUserId, timestamp, flowId: parts[3] });
      
      if (sessionDocId !== documentId) {
        throw new Error('Session ID no coincide con el documento');
      }
      
      // Verificar que la sesión no tenga más de 10 minutos
      const sessionTime = parseInt(timestamp);
      const now = Date.now();
      if (now - sessionTime > 10 * 60 * 1000) {
        throw new Error('Session expirada');
      }
      
      userId = sessionUserId;
      console.log('✅ Session válida, userId:', userId);
    } catch (err) {
      console.error('❌ Error validando session:', err);
      res.status(401).json({
        status: 'error',
        message: 'Session inválida o expirada.'
      });
      return;
    }

    const signedDocumentBuffer = req.file.buffer;
    console.log('📄 Tamaño del documento firmado:', signedDocumentBuffer.length, 'bytes');

    console.log('🔄 Procesando documento firmado...');
    const result = await firmaPeruService.processSignedDocument(
      documentId,
      signedDocumentBuffer,
      session,
      req
    );

    console.log('✅ Documento firmado procesado exitosamente');
    res.status(200).json({
      status: 'success',
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('❌ Error al subir documento firmado:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack available');

    if (error instanceof Error) {
      if (error.message.includes('Token inválido') || error.message.includes('expirado')) {
        res.status(401).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'Documento original no encontrado.') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error interno del servidor.'
    });
  }
};

export const revertSignatures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const { reason, notifySigners = true } = req.body;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    if (!reason || reason.trim() === '') {
      res.status(400).json({
        status: 'error',
        message: 'La razón de la reversión es obligatoria'
      });
      return;
    }

    const summary = await signatureReversionService.revertDocumentSignatures(
      documentId,
      req.user!.id,
      reason,
      req,
      { notifySigners }
    );

    res.status(200).json({
      status: 'success',
      message: 'Firmas revertidas correctamente',
      data: summary
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Solo los administradores')) {
        res.status(403).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message === 'Documento no encontrado') {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no tiene firmas activas')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al revertir firmas'
    });
  }
};

export const revertToVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId, versionId } = req.params;
    const { reason } = req.body;

    const docValidation = uuidSchema.validate(documentId);
    if (docValidation.error) {
      res.status(400).json({
        status: 'error',
        message: `ID de documento inválido: ${docValidation.error.details[0].message}`
      });
      return;
    }

    const versionValidation = uuidSchema.validate(versionId);
    if (versionValidation.error) {
      res.status(400).json({
        status: 'error',
        message: `ID de versión inválido: ${versionValidation.error.details[0].message}`
      });
      return;
    }

    if (!reason || reason.trim() === '') {
      res.status(400).json({
        status: 'error',
        message: 'La razón de la reversión es obligatoria'
      });
      return;
    }

    const result = await signatureReversionService.revertToVersion(
      documentId,
      versionId,
      req.user!.id,
      reason,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Documento revertido a versión anterior correctamente',
      data: result
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Solo los administradores')) {
        res.status(403).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no encontrad')) {
        res.status(404).json({
          status: 'error',
          message: error.message
        });
        return;
      }

      if (error.message.includes('no pertenece')) {
        res.status(400).json({
          status: 'error',
          message: error.message
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al revertir a versión'
    });
  }
};

export const getReversionHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const history = await signatureReversionService.getReversionHistory(documentId);

    res.status(200).json({
      status: 'success',
      message: 'Historial de reversiones obtenido correctamente',
      data: history
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Documento no encontrado') {
      res.status(404).json({
        status: 'error',
        message: error.message
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener historial'
    });
  }
};

export const canRevert = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const result = await signatureReversionService.canRevert(documentId, req.user!.id);

    res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al verificar permisos'
    });
  }
};

export const getDocumentSignatureStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const status = await signatureStatusService.getDocumentSignatureStatus(documentId);

    res.status(200).json({
      status: 'success',
      message: 'Estado de firma obtenido correctamente',
      data: status
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Document not found') {
      res.status(404).json({
        status: 'error',
        message: 'Documento no encontrado'
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estado de firma'
    });
  }
};

export const getBatchSignatureStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentIds } = req.body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'Se debe proporcionar un array de IDs de documentos'
      });
      return;
    }

    const statuses = await signatureStatusService.getBatchSignatureStatus(documentIds);

    res.status(200).json({
      status: 'success',
      message: 'Estados de firma obtenidos correctamente',
      data: statuses
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estados de firma'
    });
  }
};

export const getSignatureMetadata = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signatureId } = req.params;

    const { error } = uuidSchema.validate(signatureId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const metadata = await signatureStatusService.getSignatureMetadata(signatureId);

    res.status(200).json({
      status: 'success',
      message: 'Metadatos de firma obtenidos correctamente',
      data: metadata
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'Signature not found') {
      res.status(404).json({
        status: 'error',
        message: 'Firma no encontrada'
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener metadatos de firma'
    });
  }
};

export const getSignatureStatistics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await signatureStatusService.getSignatureStatistics();

    res.status(200).json({
      status: 'success',
      message: 'Estadísticas de firma obtenidas correctamente',
      data: statistics
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al obtener estadísticas de firma'
    });
  }
};

export const precheckDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    // Obtener el estado del documento
    const documentStatus = await signatureStatusService.getDocumentSignatureStatus(documentId);

    // Determinar si el usuario tiene permisos para firmar
    const userRole = req.user?.roleName;
    const canSign = userRole === 'Administrador' || userRole === 'Operador';

    // Construir checklist
    const checklist = {
      canSign,
      documentExists: !!documentStatus,
      hasActiveFlow: documentStatus?.hasActiveFlows || false,
      isAlreadySigned: documentStatus?.totalSignatures ? documentStatus.totalSignatures > 0 : false,
      documentStatus: documentStatus?.status || 'NOT_SIGNED',
      signatureCount: documentStatus?.totalSignatures || 0
    };

    res.status(200).json({
      status: 'success',
      message: 'Precheck de documento completado',
      data: {
        checklist,
        document: documentStatus
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      res.status(404).json({
        status: 'error',
        message: 'Documento no encontrado'
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al realizar precheck del documento'
    });
  }
};

export const getValidationReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const { error } = uuidSchema.validate(documentId);
    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details[0].message
      });
      return;
    }

    const report = await validationReportService.getValidationReport(
      documentId,
      userId,
      req
    );

    res.status(200).json({
      status: 'success',
      message: 'Reporte de validación generado correctamente',
      data: report
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('no encontrado')) {
      res.status(404).json({
        status: 'error',
        message: 'Documento no encontrado'
      });
      return;
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Error al generar reporte de validación'
    });
  }
};
