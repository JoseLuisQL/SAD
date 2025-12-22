import { Router } from 'express';
import * as rolesController from '../controllers/roles.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('roles', 'view'),
  rolesController.getAll
);

router.get(
  '/analytics/summary',
  authenticate,
  requirePermission('roles', 'view'),
  rolesController.getAnalytics
);

router.get(
  '/:id',
  authenticate,
  requirePermission('roles', 'view'),
  rolesController.getById
);

router.get(
  '/:id/impact',
  authenticate,
  requirePermission('roles', 'view'),
  rolesController.getImpact
);

router.post(
  '/',
  authenticate,
  requirePermission('roles', 'create'),
  rolesController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('roles', 'update'),
  rolesController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('roles', 'delete'),
  rolesController.deleteRole
);

router.post(
  '/:id/duplicate',
  authenticate,
  requirePermission('roles', 'create'),
  rolesController.duplicate
);

export default router;
