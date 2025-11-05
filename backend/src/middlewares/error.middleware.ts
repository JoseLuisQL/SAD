import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        const target = (err.meta?.target as string[]) || [];
        res.status(409).json({
          status: 'error',
          message: `El valor del campo ${target.join(', ')} ya existe`,
          code: 'DUPLICATE_ENTRY'
        });
        return;

      case 'P2025':
        res.status(404).json({
          status: 'error',
          message: 'Registro no encontrado',
          code: 'NOT_FOUND'
        });
        return;

      case 'P2003':
        res.status(400).json({
          status: 'error',
          message: 'Violación de clave foránea. El registro relacionado no existe',
          code: 'FOREIGN_KEY_VIOLATION'
        });
        return;

      case 'P2014':
        res.status(400).json({
          status: 'error',
          message: 'Violación de relación. No se puede eliminar debido a registros relacionados',
          code: 'RELATION_VIOLATION'
        });
        return;

      default:
        res.status(500).json({
          status: 'error',
          message: 'Error de base de datos',
          code: err.code
        });
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({
      status: 'error',
      message: 'Error de validación en la base de datos',
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    res.status(503).json({
      status: 'error',
      message: 'Error al conectar con la base de datos',
      code: 'DATABASE_CONNECTION_ERROR'
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: err.message,
      code: 'VALIDATION_ERROR'
    });
    return;
  }

  if (err.name === 'UnauthorizedError' || err.message.includes('token')) {
    res.status(401).json({
      status: 'error',
      message: 'No autorizado',
      code: 'UNAUTHORIZED'
    });
    return;
  }

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err 
    })
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    status: 'error',
    message: `Ruta no encontrada: ${req.method} ${req.path}`,
    code: 'NOT_FOUND'
  });
};
