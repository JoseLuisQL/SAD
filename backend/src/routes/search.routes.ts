import { Router } from 'express';
import * as searchController from '../controllers/search.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get(
  '/documents',
  authenticate,
  searchController.search
);

router.get(
  '/suggestions',
  authenticate,
  searchController.suggestions
);

export default router;
