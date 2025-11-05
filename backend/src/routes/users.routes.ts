import { Router } from 'express';
import * as usersController from '../controllers/users.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

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
  authorize('Administrador'),
  usersController.getStats
);

router.get(
  '/export/csv',
  authenticate,
  authorize('Administrador'),
  usersController.exportCSV
);

router.get(
  '/export/excel',
  authenticate,
  authorize('Administrador'),
  usersController.exportExcel
);

router.get(
  '/',
  authenticate,
  authorize('Administrador'),
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
  authorize('Administrador'),
  usersController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('Administrador'),
  usersController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('Administrador'),
  usersController.deleteUser
);

export default router;
