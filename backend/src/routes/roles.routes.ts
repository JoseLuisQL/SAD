import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  rolesController.getAll
);

router.get(
  '/analytics/summary',
  authenticate,
  rolesController.getAnalytics
);

router.get(
  '/:id',
  authenticate,
  rolesController.getById
);

router.get(
  '/:id/impact',
  authenticate,
  rolesController.getImpact
);

router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  rolesController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  rolesController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  rolesController.deleteRole
);

router.post(
  '/:id/duplicate',
  authenticate,
  authorize('Administrador'),
  rolesController.duplicate
);

export default router;
