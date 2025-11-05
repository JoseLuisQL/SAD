import { Router } from 'express';
import * as configurationController from '../controllers/configuration.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { uploadLogo, uploadStamp, uploadFavicon, uploadLoginBg } from '../config/branding-multer.config';

const router = Router();

// Public endpoint - no authentication required for reading configuration
router.get('/', configurationController.getConfig);

router.put(
  '/',
  authenticate,
  authorize('Administrador'),
  configurationController.updateConfig
);

router.post(
  '/logo',
  authenticate,
  authorize('Administrador'),
  uploadLogo,
  configurationController.uploadLogo
);

router.post(
  '/favicon',
  authenticate,
  authorize('Administrador'),
  uploadFavicon,
  configurationController.uploadFavicon
);

router.post(
  '/stamp',
  authenticate,
  authorize('Administrador'),
  uploadStamp,
  configurationController.uploadStamp
);

router.post(
  '/login-background/:slot',
  authenticate,
  authorize('Administrador'),
  uploadLoginBg,
  configurationController.uploadLoginBackground
);

router.delete(
  '/logo',
  authenticate,
  authorize('Administrador'),
  configurationController.removeLogo
);

router.delete(
  '/favicon',
  authenticate,
  authorize('Administrador'),
  configurationController.removeFavicon
);

router.delete(
  '/stamp',
  authenticate,
  authorize('Administrador'),
  configurationController.removeStamp
);

router.delete(
  '/login-background/:slot',
  authenticate,
  authorize('Administrador'),
  configurationController.removeLoginBackground
);

export default router;
