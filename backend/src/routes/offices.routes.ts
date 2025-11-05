import { Router } from 'express';
import * as officesController from '../controllers/offices.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  officesController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  officesController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  officesController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  authorize('Administrador'),
  officesController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  authorize('Administrador'),
  officesController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  authorize('Administrador'),
  officesController.bulk
);

router.get(
  '/search',
  authenticate,
  officesController.search
);

router.get(
  '/',
  authenticate,
  officesController.getAll
);

router.get(
  '/:id',
  authenticate,
  officesController.getById
);

router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  officesController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  officesController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  officesController.deleteOffice
);

export default router;
