import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { verifyToken } from '../utils/jwt.utils';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        status: 'error',
        message: 'Token de autenticación no proporcionado'
      });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);

      if (decoded.type !== 'access') {
        res.status(401).json({
          status: 'error',
          message: 'Tipo de token inválido'
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          role: {
            select: {
              name: true,
              permissions: true
            }
          }
        }
      });

      if (!user) {
        res.status(401).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
        return;
      }

      if (!user.isActive) {
        res.status(403).json({
          status: 'error',
          message: 'Usuario inactivo'
        });
        return;
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        permissions: user.role.permissions as Record<string, any>
      };

      next();
    } catch (error) {
      if (error instanceof Error) {
        res.status(401).json({
          status: 'error',
          message: error.message
        });
      } else {
        res.status(401).json({
          status: 'error',
          message: 'Error al verificar token'
        });
      }
      return;
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
    return;
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const userRole = req.user.roleName;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({
        status: 'error',
        message: 'No tiene permisos para acceder a este recurso'
      });
      return;
    }

    next();
  };
};
