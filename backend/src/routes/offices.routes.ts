import { Router } from 'express';
import * as officesController from '../controllers/offices.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  requirePermission('offices', 'create'),
  officesController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  requirePermission('offices', 'create'),
  officesController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  requirePermission('offices', 'create'),
  officesController.bulk
);

router.get(
  '/search',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.search
);

router.get(
  '/',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.getAll
);

router.get(
  '/:id',
  authenticate,
  requirePermission('offices', 'view'),
  officesController.getById
);

router.post(
  '/',
  authenticate,
  requirePermission('offices', 'create'),
  officesController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('offices', 'update'),
  officesController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('offices', 'delete'),
  officesController.deleteOffice
);

export default router;
