import { Router } from 'express';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import * as authController from '../controllers/auth.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { 
  validateRegister, 
  validateLogin, 
  validateRefreshToken 
} from '../middlewares/validation.middleware';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // Aumentado de 10 a 20 intentos
  skipSuccessfulRequests: true, // No contar intentos exitosos
  keyGenerator: (req) => {
    // Rate limit por IP + username para ser más granular
    const username = req.body.username || 'unknown';
    const ip = ipKeyGenerator(req.ip || 'unknown');
    return `${ip}-${username}`;
  },
  handler: (req, res) => {
    const username = req.body.username || 'desconocido';
    console.warn(`Rate limit exceeded for login attempt: IP=${req.ip}, username=${username}`);
    res.status(429).json({
      status: 'error',
      message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
      username: username
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});

const router = Router();

router.post(
  '/register',
  authenticate,
  authorize('Administrador'),
  validateRegister,
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateLogin,
  authController.login
);

router.post(
  '/refresh',
  validateRefreshToken,
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.get(
  '/me',
  authenticate,
  authController.me
);

router.get(
  '/status',
  authenticate,
  authController.getAccountStatus
);

export default router;
