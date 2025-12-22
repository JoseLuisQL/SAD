import { Router } from 'express';
import * as reportsController from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/documents',
  authenticate,
  requirePermission('reports', 'view'),
  reportsController.getDocumentReport
);

router.get(
  '/activity',
  authenticate,
  requirePermission('reports', 'view'),
  reportsController.getUserActivityReport
);

router.get(
  '/signatures',
  authenticate,
  requirePermission('reports', 'view'),
  reportsController.getSignatureReport
);

router.get(
  '/documents/export',
  authenticate,
  requirePermission('reports', 'export'),
  reportsController.exportDocumentReport
);

router.get(
  '/activity/export',
  authenticate,
  requirePermission('reports', 'export'),
  reportsController.exportUserActivityReport
);

router.get(
  '/signatures/export',
  authenticate,
  requirePermission('reports', 'export'),
  reportsController.exportSignatureReport
);

export default router;
