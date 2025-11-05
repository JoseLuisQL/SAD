import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  authorize('Administrador'),
  auditController.getStats
);

router.get(
  '/analytics/advanced',
  authenticate,
  authorize('Administrador'),
  auditController.getAdvancedAnalytics
);

router.get(
  '/analytics/anomalies',
  authenticate,
  authorize('Administrador'),
  auditController.getAnomalies
);

router.get(
  '/analytics/user/:id/pattern',
  authenticate,
  authorize('Administrador'),
  auditController.getUserPattern
);

router.get(
  '/security/alerts',
  authenticate,
  authorize('Administrador'),
  auditController.getSecurityAlerts
);

router.post(
  '/reports/custom',
  authenticate,
  authorize('Administrador'),
  auditController.generateCustomReport
);

router.get(
  '/',
  authenticate,
  authorize('Administrador'),
  auditController.getAll
);

router.get(
  '/:id',
  authenticate,
  authorize('Administrador'),
  auditController.getById
);

export default router;
