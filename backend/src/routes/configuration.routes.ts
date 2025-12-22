import { Router } from 'express';
import * as configurationController from '../controllers/configuration.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';
import { uploadLogo, uploadStamp, uploadFavicon, uploadLoginBg } from '../config/branding-multer.config';

const router = Router();

// Public endpoint - no authentication required for reading configuration
router.get('/', configurationController.getConfig);

router.put(
  '/',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.updateConfig
);

router.post(
  '/logo',
  authenticate,
  requirePermission('configuration', 'update'),
  uploadLogo,
  configurationController.uploadLogo
);

router.post(
  '/favicon',
  authenticate,
  requirePermission('configuration', 'update'),
  uploadFavicon,
  configurationController.uploadFavicon
);

router.post(
  '/stamp',
  authenticate,
  requirePermission('configuration', 'update'),
  uploadStamp,
  configurationController.uploadStamp
);

router.post(
  '/login-background/:slot',
  authenticate,
  requirePermission('configuration', 'update'),
  uploadLoginBg,
  configurationController.uploadLoginBackground
);

router.delete(
  '/logo',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.removeLogo
);

router.delete(
  '/favicon',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.removeFavicon
);

router.delete(
  '/stamp',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.removeStamp
);

router.delete(
  '/login-background/:slot',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.removeLoginBackground
);

router.put(
  '/external-urls',
  authenticate,
  requirePermission('configuration', 'update'),
  configurationController.updateExternalUrls
);

export default router;
