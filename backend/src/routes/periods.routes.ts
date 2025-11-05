import { Router } from 'express';
import * as periodsController from '../controllers/periods.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  periodsController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  periodsController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  periodsController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  authorize('Administrador'),
  periodsController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  authorize('Administrador'),
  periodsController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  authorize('Administrador'),
  periodsController.bulk
);

router.get(
  '/',
  authenticate,
  periodsController.getAll
);

router.get(
  '/:id',
  authenticate,
  periodsController.getById
);

router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  periodsController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  periodsController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  periodsController.deletePeriod
);

export default router;
