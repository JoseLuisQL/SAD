import { Router } from 'express';
import * as firmaController from '../controllers/firma.controller';
import * as signatureFlowController from '../controllers/signature-flow.controller';
import * as analyticsController from '../controllers/signature-analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission, requireAnyPermission } from '../middlewares/permissions.middleware';
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
  requirePermission('signing', 'view'),
  firmaController.getConfig
);

// Generar token de un solo uso para iniciar el proceso de firma
router.post(
  '/params-request',
  authenticate,
  requirePermission('signing', 'sign'),
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
  requirePermission('signing', 'view'),
  firmaController.getInfo
);

router.post(
  '/test-validation',
  authenticate,
  requirePermission('signing', 'view'),
  uploadSingle,
  handleUploadError,
  validateFile,
  firmaController.testValidation,
  cleanupOnError
);

router.post(
  '/clean-temp',
  authenticate,
  requirePermission('configuration', 'update'),
  firmaController.cleanTemporaryFiles
);

router.post(
  '/sign-document/:id',
  authenticate,
  requirePermission('signing', 'sign'),
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
  requirePermission('signing', 'sign'),
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
  requirePermission('signatureFlows', 'create'),
  validate(createSignatureFlowSchema),
  signatureFlowController.create
);

router.get(
  '/flows',
  authenticate,
  requirePermission('signatureFlows', 'view'),
  signatureFlowController.getAll
);

router.get(
  '/flows/pending',
  authenticate,
  requireAnyPermission([
    { module: 'signatureFlows', permission: 'view' },
    { module: 'signing', permission: 'sign' }
  ]),
  signatureFlowController.getPending
);

router.get(
  '/flows/:id',
  authenticate,
  requirePermission('signatureFlows', 'view'),
  signatureFlowController.getById
);

router.post(
  '/flows/:id/advance',
  authenticate,
  requirePermission('signing', 'sign'),
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
  requirePermission('signatureFlows', 'delete'),
  signatureFlowController.cancel
);

// ==================== VERIFICACIÓN DE FIRMA ====================

router.get(
  '/verify/:id',
  authenticate,
  requirePermission('signing', 'view'),
  firmaController.verifyDocument
);

router.post(
  '/verify-upload',
  authenticate,
  requirePermission('signing', 'view'),
  uploadSingle,
  handleUploadError,
  validateFile,
  firmaController.uploadAndVerify,
  cleanupOnError
);

router.get(
  '/validation-report/:documentId',
  authenticate,
  requirePermission('signing', 'view'),
  firmaController.getValidationReport
);

// ==================== REVERSIÓN DE FIRMAS ====================

router.post(
  '/revert/:documentId',
  authenticate,
  requirePermission('signatureFlows', 'delete'),
  updateSignatureStatusAfterRevert,
  firmaController.revertSignatures
);

router.post(
  '/revert/:documentId/version/:versionId',
  authenticate,
  requirePermission('signatureFlows', 'delete'),
  updateSignatureStatusAfterRevert,
  firmaController.revertToVersion
);

router.get(
  '/revert/:documentId/history',
  authenticate,
  requirePermission('signatureFlows', 'view'),
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
  requirePermission('analytics', 'view'),
  firmaController.getSignatureStatistics
);

// ==================== PRECHECK ====================

router.get(
  '/precheck/:documentId',
  authenticate,
  requirePermission('signing', 'sign'),
  firmaController.precheckDocument
);

// ==================== ANALÍTICAS ====================

router.get(
  '/analytics/metrics',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getMetrics
);

router.get(
  '/analytics/by-period',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getByPeriod
);

router.get(
  '/analytics/by-user',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getByUser
);

router.get(
  '/analytics/flows',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getFlowStats
);

router.get(
  '/analytics/document-types',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getDocumentTypes
);

router.get(
  '/analytics/reversions',
  authenticate,
  requirePermission('analytics', 'view'),
  analyticsController.getReversionStats
);

router.get(
  '/analytics/export',
  authenticate,
  requirePermission('analytics', 'export'),
  analyticsController.exportReport
);

export default router;
