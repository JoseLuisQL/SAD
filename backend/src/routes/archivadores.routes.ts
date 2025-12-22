import { Router } from 'express';
import * as archivadoresController from '../controllers/archivadores.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  requirePermission('archivadores', 'view'),
  archivadoresController.getAll
);

// Rutas específicas ANTES de rutas con parámetros
router.get(
  '/search',
  authenticate,
  requirePermission('archivadores', 'view'),
  archivadoresController.search
);

router.get(
  '/stats',
  authenticate,
  requirePermission('archivadores', 'view'),
  archivadoresController.getGeneralStats
);

// Rutas con parámetros DESPUÉS de rutas específicas
router.get(
  '/:id',
  authenticate,
  requirePermission('archivadores', 'view'),
  archivadoresController.getById
);

router.get(
  '/:id/stats',
  authenticate,
  requirePermission('archivadores', 'view'),
  archivadoresController.getStats
);

router.get(
  '/:id/analytics',
  authenticate,
  requirePermission('analytics', 'view'),
  archivadoresController.getAnalytics
);

router.post(
  '/',
  authenticate,
  requirePermission('archivadores', 'create'),
  archivadoresController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('archivadores', 'update'),
  archivadoresController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('archivadores', 'delete'),
  archivadoresController.deleteArchivador
);

export default router;
