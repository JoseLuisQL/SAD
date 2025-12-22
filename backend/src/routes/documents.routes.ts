import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';
import { uploadSingle, uploadMultiple } from '../config/multer.config';
import { handleUploadError, validateFile, cleanupOnError } from '../middlewares/upload.middleware';

const router = Router();

router.post(
  '/upload',
  authenticate,
  requirePermission('documents', 'create'),
  uploadSingle,
  handleUploadError,
  validateFile,
  documentsController.upload,
  cleanupOnError
);

router.post(
  '/upload-batch',
  authenticate,
  requirePermission('documents', 'create'),
  uploadMultiple,
  handleUploadError,
  validateFile,
  documentsController.uploadBatch,
  cleanupOnError
);

router.get(
  '/',
  authenticate,
  requirePermission('documents', 'view'),
  documentsController.getAll
);

router.get(
  '/stats/ingest',
  authenticate,
  requirePermission('documents', 'view'),
  documentsController.getIngestStats
);

router.get(
  '/analytics',
  authenticate,
  requirePermission('analytics', 'view'),
  documentsController.getAnalytics
);

router.get(
  '/metrics',
  authenticate,
  requirePermission('analytics', 'view'),
  documentsController.getMetrics
);

router.post(
  '/validate-upload',
  authenticate,
  requirePermission('documents', 'create'),
  documentsController.validateUpload
);

router.get(
  '/:id/timeline',
  authenticate,
  requirePermission('documents', 'view'),
  documentsController.getTimeline
);

router.get(
  '/:id',
  authenticate,
  requirePermission('documents', 'view'),
  documentsController.getById
);

router.get(
  '/:id/download',
  authenticate,
  requirePermission('documents', 'download'),
  documentsController.download
);

router.put(
  '/:id',
  authenticate,
  requirePermission('documents', 'update'),
  documentsController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('documents', 'delete'),
  documentsController.deleteDocument
);

router.get(
  '/:id/ocr-status',
  authenticate,
  requirePermission('documents', 'view'),
  documentsController.getOCRStatus
);

router.post(
  '/:id/reprocess-ocr',
  authenticate,
  requirePermission('documents', 'update'),
  documentsController.reprocessOCR
);

router.get(
  '/:id/signatures',
  authenticate,
  requirePermission('signing', 'view'),
  documentsController.getSignatures
);

export default router;
