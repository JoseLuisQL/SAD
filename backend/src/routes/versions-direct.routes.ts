import { Router } from 'express';
import * as versionsController from '../controllers/versions.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Ruta directa para descargar versión por ID (sin necesidad de documentId)
router.get(
  '/:versionId/download',
  authenticate,
  versionsController.downloadVersion
);

export default router;
