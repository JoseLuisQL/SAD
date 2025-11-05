import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import * as timelineController from '../controllers/timeline.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { rateLimit } from '../middlewares/rate-limit.middleware';

const router = Router();

router.get(
  '/dashboard',
  authenticate,
  rateLimit(30, 60 * 1000),
  analyticsController.getDashboardSnapshot
);

router.get(
  '/overview',
  authenticate,
  analyticsController.getGlobalOverview
);

router.get(
  '/documents/metrics',
  authenticate,
  analyticsController.getDocumentMetrics
);

router.get(
  '/archivadores/:id/metrics',
  authenticate,
  analyticsController.getArchivadorMetrics
);

router.get(
  '/expedientes/:id/metrics',
  authenticate,
  analyticsController.getExpedienteMetrics
);

router.get(
  '/archivadores/:id/timeline',
  authenticate,
  timelineController.getArchivadorTimeline
);

router.get(
  '/documents/:id/timeline',
  authenticate,
  timelineController.getDocumentTimeline
);

router.get(
  '/expedientes/:id/timeline',
  authenticate,
  timelineController.getExpedienteTimeline
);

router.get(
  '/users/:id/timeline',
  authenticate,
  timelineController.getUserTimeline
);

export default router;
