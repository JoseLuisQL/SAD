import { Router } from 'express';
import * as versionsController from '../controllers/versions.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Rutas con documentId
router.get(
  '/:id/versions',
  authenticate,
  versionsController.getVersions
);

router.get(
  '/:id/versions/:versionId',
  authenticate,
  versionsController.getVersion
);

router.post(
  '/:id/versions/:versionId/restore',
  authenticate,
  authorize('Administrador', 'Operador'),
  versionsController.restoreVersion
);

router.get(
  '/:id/versions/:versionId/download',
  authenticate,
  versionsController.downloadVersion
);

router.get(
  '/versions/compare',
  authenticate,
  versionsController.compareVersions
);

export default router;
