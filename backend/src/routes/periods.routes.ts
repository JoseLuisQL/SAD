import { Router } from 'express';
import * as periodsController from '../controllers/periods.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requirePermission('periods', 'view'),
  periodsController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  requirePermission('periods', 'view'),
  periodsController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  requirePermission('periods', 'view'),
  periodsController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  requirePermission('periods', 'create'),
  periodsController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  requirePermission('periods', 'create'),
  periodsController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  requirePermission('periods', 'create'),
  periodsController.bulk
);

router.get(
  '/',
  authenticate,
  requirePermission('periods', 'view'),
  periodsController.getAll
);

router.get(
  '/:id',
  authenticate,
  requirePermission('periods', 'view'),
  periodsController.getById
);

router.post(
  '/',
  authenticate,
  requirePermission('periods', 'create'),
  periodsController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('periods', 'update'),
  periodsController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('periods', 'delete'),
  periodsController.deletePeriod
);

export default router;
