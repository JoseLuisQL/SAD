import { Router } from 'express';
import * as auditController from '../controllers/audit.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getStats
);

router.get(
  '/analytics/advanced',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getAdvancedAnalytics
);

router.get(
  '/analytics/anomalies',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getAnomalies
);

router.get(
  '/analytics/user/:id/pattern',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getUserPattern
);

router.get(
  '/security/alerts',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getSecurityAlerts
);

router.post(
  '/reports/custom',
  authenticate,
  requirePermission('audit', 'export'),
  auditController.generateCustomReport
);

router.get(
  '/',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getAll
);

router.get(
  '/:id',
  authenticate,
  requirePermission('audit', 'view'),
  auditController.getById
);

export default router;
