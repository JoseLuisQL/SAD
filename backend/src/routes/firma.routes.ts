import { Router } from 'express';
import * as firmaController from '../controllers/firma.controller';
import * as signatureFlowController from '../controllers/signature-flow.controller';
import * as analyticsController from '../controllers/signature-analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle, uploadMultiple } from '../config/multer.config';
import { handleUploadError, validateFile, cleanupOnError } from '../middlewares/upload.middleware';
import { validate } from '../middlewares/validation.middleware';
import { createSignatureFlowSchema } from '../utils/validators';
import {
  updateSignatureStatusAfterSign,
  updateSignatureStatusAfterRevert,
  updateSignatureStatusAfterFlowAdvance
} from '../middlewares/signature-status-updater.middleware';
import multer from 'multer';

const router = Router();

// Configurar multer para almacenar en memoria (para el componente web de Firma Perú)
const upload = multer({ storage: multer.memoryStorage() });

// ==================== ENDPOINTS PARA COMPONENTE WEB DE FIRMA PERÚ ====================

// Obtener configuración del componente web de Firma Perú
router.get(
  '/config',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.getConfig
);

// Generar token de un solo uso para iniciar el proceso de firma
router.post(
  '/params-request',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.generateOneTimeTokenForSigning
);

// Obtener parámetros de firma (llamado por el componente web, NO requiere auth JWT, usa param_token)
router.post(
  '/params',
  firmaController.getSignatureParams
);

// Descargar documento para firma (llamado por el componente web, no requiere auth, se valida con token)
router.get(
  '/document/:documentId/download',
  firmaController.downloadDocument
);

// Subir documento firmado (llamado por el componente web, no requiere auth, se valida con token)
router.post(
  '/document/:documentId/upload-signed',
  upload.single('signed_file'), // El componente web de Firma Perú envía el archivo con este nombre
  updateSignatureStatusAfterSign,
  firmaController.uploadSignedDocument
);

// ==================== ENDPOINTS EXISTENTES ====================

router.get(
  '/info',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.getInfo
);

router.post(
  '/test-validation',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadSingle,
  handleUploadError,
  validateFile,
  firmaController.testValidation,
  cleanupOnError
);

router.post(
  '/clean-temp',
  authenticate,
  authorize('Administrador'),
  firmaController.cleanTemporaryFiles
);

router.post(
  '/sign-document/:id',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadSingle,
  handleUploadError,
  validateFile,
  updateSignatureStatusAfterSign,
  firmaController.signIndividualDocument,
  cleanupOnError
);

router.post(
  '/sign-documents-batch',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadMultiple,
  handleUploadError,
  validateFile,
  updateSignatureStatusAfterSign,
  firmaController.signBatchDocuments,
  cleanupOnError
);

// ==================== FLUJOS DE FIRMA ====================

router.post(
  '/flows',
  authenticate,
  authorize('Administrador', 'Operador'),
  validate(createSignatureFlowSchema),
  signatureFlowController.create
);

router.get(
  '/flows',
  authenticate,
  signatureFlowController.getAll
);

router.get(
  '/flows/pending',
  authenticate,
  signatureFlowController.getPending
);

router.get(
  '/flows/:id',
  authenticate,
  signatureFlowController.getById
);

router.post(
  '/flows/:id/advance',
  authenticate,
  uploadSingle,
  handleUploadError,
  validateFile,
  updateSignatureStatusAfterFlowAdvance,
  signatureFlowController.advance,
  cleanupOnError
);

router.post(
  '/flows/:id/cancel',
  authenticate,
  signatureFlowController.cancel
);

// ==================== VERIFICACIÓN DE FIRMA ====================

router.get(
  '/verify/:id',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.verifyDocument
);

router.post(
  '/verify-upload',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadSingle,
  handleUploadError,
  validateFile,
  firmaController.uploadAndVerify,
  cleanupOnError
);

router.get(
  '/validation-report/:documentId',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.getValidationReport
);

// ==================== REVERSIÓN DE FIRMAS ====================

router.post(
  '/revert/:documentId',
  authenticate,
  authorize('Administrador'),
  updateSignatureStatusAfterRevert,
  firmaController.revertSignatures
);

router.post(
  '/revert/:documentId/version/:versionId',
  authenticate,
  authorize('Administrador'),
  updateSignatureStatusAfterRevert,
  firmaController.revertToVersion
);

router.get(
  '/revert/:documentId/history',
  authenticate,
  authorize('Administrador'),
  firmaController.getReversionHistory
);

router.get(
  '/revert/:documentId/can-revert',
  authenticate,
  firmaController.canRevert
);

// ==================== ESTADO Y METADATOS DE FIRMA ====================

router.get(
  '/status/:documentId',
  authenticate,
  firmaController.getDocumentSignatureStatus
);

router.post(
  '/status/batch',
  authenticate,
  firmaController.getBatchSignatureStatus
);

router.get(
  '/metadata/:signatureId',
  authenticate,
  firmaController.getSignatureMetadata
);

router.get(
  '/statistics',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.getSignatureStatistics
);

// ==================== PRECHECK ====================

router.get(
  '/precheck/:documentId',
  authenticate,
  authorize('Administrador', 'Operador'),
  firmaController.precheckDocument
);

// ==================== ANALÍTICAS ====================

router.get(
  '/analytics/metrics',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getMetrics
);

router.get(
  '/analytics/by-period',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getByPeriod
);

router.get(
  '/analytics/by-user',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getByUser
);

router.get(
  '/analytics/flows',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getFlowStats
);

router.get(
  '/analytics/document-types',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getDocumentTypes
);

router.get(
  '/analytics/reversions',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.getReversionStats
);

router.get(
  '/analytics/export',
  authenticate,
  authorize('Administrador', 'Operador'),
  analyticsController.exportReport
);

export default router;
