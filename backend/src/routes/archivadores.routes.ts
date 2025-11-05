import { Router } from 'express';
import * as archivadoresController from '../controllers/archivadores.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  archivadoresController.getAll
);

// Rutas específicas ANTES de rutas con parámetros
router.get(
  '/search',
  authenticate,
  archivadoresController.search
);

router.get(
  '/stats',
  authenticate,
  archivadoresController.getGeneralStats
);

// Rutas con parámetros DESPUÉS de rutas específicas
router.get(
  '/:id',
  authenticate,
  archivadoresController.getById
);

router.get(
  '/:id/stats',
  authenticate,
  archivadoresController.getStats
);

router.get(
  '/:id/analytics',
  authenticate,
  archivadoresController.getAnalytics
);

router.post(
  '/',
  authenticate,
  authorize('Administrador', 'Operador'),
  archivadoresController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador', 'Operador'),
  archivadoresController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  archivadoresController.deleteArchivador
);

export default router;
