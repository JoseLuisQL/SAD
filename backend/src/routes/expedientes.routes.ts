import { Router } from 'express';
import * as expedientesController from '../controllers/expedientes.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('expedientes', 'view'),
  expedientesController.getAll
);

router.get(
  '/stats',
  authenticate,
  requirePermission('expedientes', 'view'),
  expedientesController.getStats
);

router.get(
  '/search',
  authenticate,
  requirePermission('expedientes', 'view'),
  expedientesController.search
);

router.get(
  '/:id',
  authenticate,
  requirePermission('expedientes', 'view'),
  expedientesController.getById
);

router.get(
  '/:id/analytics',
  authenticate,
  requirePermission('analytics', 'view'),
  expedientesController.getAnalytics
);

router.get(
  '/:id/activity',
  authenticate,
  requirePermission('expedientes', 'view'),
  expedientesController.getActivity
);

router.post(
  '/',
  authenticate,
  requirePermission('expedientes', 'create'),
  expedientesController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('expedientes', 'update'),
  expedientesController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('expedientes', 'delete'),
  expedientesController.deleteExpediente
);

router.post(
  '/:id/documents',
  authenticate,
  requirePermission('expedientes', 'update'),
  expedientesController.addDocuments
);

router.delete(
  '/:id/documents',
  authenticate,
  requirePermission('expedientes', 'update'),
  expedientesController.removeDocuments
);

export default router;
