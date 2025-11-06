import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './config/database';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import rolesRoutes from './routes/roles.routes';
import officesRoutes from './routes/offices.routes';
import documentTypesRoutes from './routes/document-types.routes';
import periodsRoutes from './routes/periods.routes';
import archivadoresRoutes from './routes/archivadores.routes';
import documentsRoutes from './routes/documents.routes';
import versionsRoutes from './routes/versions.routes';
import versionsDirectRoutes from './routes/versions-direct.routes';
import expedientesRoutes from './routes/expedientes.routes';
import auditRoutes from './routes/audit.routes';
import searchRoutes from './routes/search.routes';
import firmaRoutes from './routes/firma.routes';
import notificationsRoutes from './routes/notifications.routes';
import reportsRoutes from './routes/reports.routes';
import analyticsRoutes from './routes/analytics.routes';
import configurationRoutes from './routes/configuration.routes';
import securityRoutes from './routes/security.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();

// Middlewares de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'frame-ancestors': ["'self'", 'http://localhost:3000', 'http://localhost:5173'],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como aplicaciones locales, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:5173']
      : process.env.FRONTEND_URL?.split(',') || [];

    // Permitir orígenes configurados
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Permitir peticiones desde localhost en cualquier puerto (para desarrollo y componente de Firma Perú)
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    // Permitir dominios de Vercel en producción (*.vercel.app)
    if (process.env.NODE_ENV === 'production' && origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Por defecto, rechazar
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos para firma digital (logos, imágenes de estampado)
app.use('/api/firma/assets', express.static('uploads/firma-assets'));

// Servir archivos estáticos para configuración del sistema (logo, stamp)
app.use('/api/configuration/assets', express.static('uploads/system-config', {
  maxAge: '1m', // Cache for 1 minute to allow invalidation after changes
  etag: true,
  lastModified: true,
}));

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check route
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    // Verificar conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'OK',
      message: 'Sistema Integrado de Archivos Digitales - API funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'Connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Error de conexión a la base de datos',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: 'Disconnected'
    });
  }
});

// Database stats route
app.get('/api/health/db', async (_req: Request, res: Response) => {
  try {
    const [rolesCount, usersCount, officesCount, documentTypesCount, periodsCount, archivadoresCount, documentsCount, expedientesCount] = await Promise.all([
      prisma.role.count(),
      prisma.user.count(),
      prisma.office.count(),
      prisma.documentType.count(),
      prisma.period.count(),
      prisma.archivador.count(),
      prisma.document.count(),
      prisma.expediente.count()
    ]);

    res.status(200).json({
      status: 'OK',
      message: 'Estadísticas de base de datos',
      data: {
        roles: rolesCount,
        users: usersCount,
        offices: officesCount,
        documentTypes: documentTypesCount,
        periods: periodsCount,
        archivadores: archivadoresCount,
        documents: documentsCount,
        expedientes: expedientesCount
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Error al obtener estadísticas de base de datos'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/offices', officesRoutes);
app.use('/api/document-types', documentTypesRoutes);
app.use('/api/periods', periodsRoutes);
app.use('/api/archivadores', archivadoresRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/documents', versionsRoutes);
app.use('/api/versions', versionsDirectRoutes);
app.use('/api/expedientes', expedientesRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/firma', firmaRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/configuration', configurationRoutes);
app.use('/api/security', securityRoutes);

// Ruta base
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Bienvenido al API de Archivo Digital DISA CHINCHEROS',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Manejo de rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores global
app.use(errorHandler);

export default app;
