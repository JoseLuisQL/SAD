import { Router } from 'express';
import * as expedientesController from '../controllers/expedientes.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/',
  authenticate,
  expedientesController.getAll
);

router.get(
  '/stats',
  authenticate,
  expedientesController.getStats
);

router.get(
  '/search',
  authenticate,
  expedientesController.search
);

router.get(
  '/:id',
  authenticate,
  expedientesController.getById
);

router.get(
  '/:id/analytics',
  authenticate,
  expedientesController.getAnalytics
);

router.get(
  '/:id/activity',
  authenticate,
  expedientesController.getActivity
);

router.post(
  '/',
  authenticate,
  authorize('Administrador', 'Operador'),
  expedientesController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador', 'Operador'),
  expedientesController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  expedientesController.deleteExpediente
);

router.post(
  '/:id/documents',
  authenticate,
  authorize('Administrador', 'Operador'),
  expedientesController.addDocuments
);

router.delete(
  '/:id/documents',
  authenticate,
  authorize('Administrador', 'Operador'),
  expedientesController.removeDocuments
);

export default router;
