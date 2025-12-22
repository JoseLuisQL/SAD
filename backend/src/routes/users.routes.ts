import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/permissions.middleware';

const router = Router();

router.get(
  '/profile',
  authenticate,
  usersController.getProfile
);

router.put(
  '/profile',
  authenticate,
  usersController.updateProfile
);

router.post(
  '/profile/change-password',
  authenticate,
  usersController.changePassword
);

router.get(
  '/search',
  authenticate,
  usersController.search
);

router.get(
  '/stats',
  authenticate,
  requirePermission('users', 'view'),
  usersController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  requirePermission('users', 'view'),
  usersController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  requirePermission('users', 'view'),
  usersController.exportExcel
);

router.get(
  '/',
  authenticate,
  requirePermission('users', 'view'),
  usersController.getAll
);

router.get(
  '/:id',
  authenticate,
  usersController.getById
);

router.post(
  '/onboarding',
  authenticate,
  usersController.updateOnboarding
);

router.get(
  '/onboarding/status',
  authenticate,
  usersController.getOnboardingStatus
);

router.post(
  '/',
  authenticate,
  requirePermission('users', 'create'),
  usersController.create
);

router.put(
  '/:id',
  authenticate,
  requirePermission('users', 'update'),
  usersController.update
);

router.delete(
  '/:id',
  authenticate,
  requirePermission('users', 'delete'),
  usersController.deleteUser
);

export default router;
