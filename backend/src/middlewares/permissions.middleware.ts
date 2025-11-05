import { Request, Response, NextFunction } from 'express';

export const requirePermission = (module: string, permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const userPermissions = req.user.permissions;

    if (!userPermissions || typeof userPermissions !== 'object') {
      res.status(403).json({
        status: 'error',
        message: 'Usuario sin permisos configurados'
      });
      return;
    }

    const modulePermissions = userPermissions[module];
    
    if (!modulePermissions || !modulePermissions[permission]) {
      res.status(403).json({
        status: 'error',
        message: `No tiene permiso para ${permission} en el módulo ${module}`
      });
      return;
    }

    next();
  };
};

export const requireAnyPermission = (permissions: Array<{ module: string; permission: string }>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const userPermissions = req.user.permissions;

    if (!userPermissions || typeof userPermissions !== 'object') {
      res.status(403).json({
        status: 'error',
        message: 'Usuario sin permisos configurados'
      });
      return;
    }

    const hasPermission = permissions.some(({ module, permission }) => {
      const modulePermissions = userPermissions[module];
      return modulePermissions && modulePermissions[permission];
    });

    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'No tiene los permisos necesarios para esta operación'
      });
      return;
    }

    next();
  };
};

export const requireAllPermissions = (permissions: Array<{ module: string; permission: string }>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const userPermissions = req.user.permissions;

    if (!userPermissions || typeof userPermissions !== 'object') {
      res.status(403).json({
        status: 'error',
        message: 'Usuario sin permisos configurados'
      });
      return;
    }

    const hasAllPermissions = permissions.every(({ module, permission }) => {
      const modulePermissions = userPermissions[module];
      return modulePermissions && modulePermissions[permission];
    });

    if (!hasAllPermissions) {
      res.status(403).json({
        status: 'error',
        message: 'No tiene todos los permisos necesarios para esta operación'
      });
      return;
    }

    next();
  };
};

export const requireExportPermission = requirePermission('documents', 'export');
export const requireReportsPermission = requirePermission('reports', 'view');
export const requireAnalyticsPermission = requirePermission('analytics', 'view');
