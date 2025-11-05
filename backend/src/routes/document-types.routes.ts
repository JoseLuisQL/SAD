import { Router } from 'express';
import * as documentTypesController from '../controllers/document-types.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  documentTypesController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  documentTypesController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  documentTypesController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  authorize('Administrador'),
  documentTypesController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  authorize('Administrador'),
  documentTypesController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  authorize('Administrador'),
  documentTypesController.bulk
);

router.get(
  '/search',
  authenticate,
  documentTypesController.search
);

router.get(
  '/',
  authenticate,
  documentTypesController.getAll
);

router.get(
  '/:id',
  authenticate,
  documentTypesController.getById
);

router.post(
  '/',
  authenticate,
  authorize('Administrador'),
  documentTypesController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  documentTypesController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  documentTypesController.deleteDocumentType
);

export default router;
