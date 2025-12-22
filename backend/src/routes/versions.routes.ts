import { Router } from 'express';
import * as versionsController from '../controllers/versions.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

// Rutas con documentId
router.get(
  '/:id/versions',
  authenticate,
  requirePermission('versions', 'view'),
  versionsController.getVersions
);

router.get(
  '/:id/versions/:versionId',
  authenticate,
  requirePermission('versions', 'view'),
  versionsController.getVersion
);

router.post(
  '/:id/versions/:versionId/restore',
  authenticate,
  requirePermission('versions', 'restore'),
  versionsController.restoreVersion
);

router.get(
  '/:id/versions/:versionId/download',
  authenticate,
  requirePermission('versions', 'download'),
  versionsController.downloadVersion
);

router.get(
  '/versions/compare',
  authenticate,
  requirePermission('versions', 'compare'),
  versionsController.compareVersions
);

export default router;
