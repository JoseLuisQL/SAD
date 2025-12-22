import { Router } from 'express';
import * as documentTypesController from '../controllers/document-types.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/stats',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.exportExcel
);

router.post(
  '/import/csv',
  authenticate,
  requirePermission('documentTypes', 'create'),
  documentTypesController.importCSV
);

router.post(
  '/import/excel',
  authenticate,
  requirePermission('documentTypes', 'create'),
  documentTypesController.importExcel
);

router.post(
  '/bulk',
  authenticate,
  requirePermission('documentTypes', 'create'),
  documentTypesController.bulk
);

router.get(
  '/search',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.search
);

router.get(
  '/',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.getAll
);

router.get(
  '/:id',
  authenticate,
  requirePermission('documentTypes', 'view'),
  documentTypesController.getById
);

router.post(
  '/',
  authenticate,
  requirePermission('documentTypes', 'create'),
  documentTypesController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('documentTypes', 'update'),
  documentTypesController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('documentTypes', 'delete'),
  documentTypesController.deleteDocumentType
);

export default router;
