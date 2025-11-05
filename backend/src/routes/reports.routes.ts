import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/documents',
  authenticate,
  authorize('Administrador', 'Operador'),
  reportsController.getDocumentReport
);

router.get(
  '/activity',
  authenticate,
  authorize('Administrador'),
  reportsController.getUserActivityReport
);

router.get(
  '/signatures',
  authenticate,
  authorize('Administrador', 'Operador'),
  reportsController.getSignatureReport
);

router.get(
  '/documents/export',
  authenticate,
  authorize('Administrador', 'Operador'),
  reportsController.exportDocumentReport
);

router.get(
  '/activity/export',
  authenticate,
  authorize('Administrador'),
  reportsController.exportUserActivityReport
);

router.get(
  '/signatures/export',
  authenticate,
  authorize('Administrador', 'Operador'),
  reportsController.exportSignatureReport
);

export default router;
