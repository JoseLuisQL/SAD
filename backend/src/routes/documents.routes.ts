import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadSingle, uploadMultiple } from '../config/multer.config';
import { handleUploadError, validateFile, cleanupOnError } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/upload',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadSingle,
  handleUploadError,
  validateFile,
  documentsController.upload,
  cleanupOnError
);

router.post(
  '/upload-batch',
  authenticate,
  authorize('Administrador', 'Operador'),
  uploadMultiple,
  handleUploadError,
  validateFile,
  documentsController.uploadBatch,
  cleanupOnError
);

router.get(
  '/',
  authenticate,
  documentsController.getAll
);

router.get(
  '/stats/ingest',
  authenticate,
  documentsController.getIngestStats
);

router.get(
  '/analytics',
  authenticate,
  documentsController.getAnalytics
);

router.get(
  '/metrics',
  authenticate,
  documentsController.getMetrics
);

router.post(
  '/validate-upload',
  authenticate,
  authorize('Administrador', 'Operador'),
  documentsController.validateUpload
);

router.get(
  '/:id/timeline',
  authenticate,
  documentsController.getTimeline
);

router.get(
  '/:id',
  authenticate,
  documentsController.getById
);

router.get(
  '/:id/download',
  authenticate,
  documentsController.download
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador', 'Operador'),
  documentsController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  documentsController.deleteDocument
);

router.get(
  '/:id/ocr-status',
  authenticate,
  documentsController.getOCRStatus
);

router.post(
  '/:id/reprocess-ocr',
  authenticate,
  authorize('Administrador', 'Operador'),
  documentsController.reprocessOCR
);

router.get(
  '/:id/signatures',
  authenticate,
  documentsController.getSignatures
);

export default router;
