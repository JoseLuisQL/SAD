import { Request, Response } from 'express';
import * as authService from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName, roleId } = req.body;

    const user = await authService.register({
      username,
      email,
      password,
      firstName,
      lastName,
      roleId
    });

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: { user }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error al registrar usuario'
      });
    }
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password, req);

    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: result
    });
  } catch (error: any) {
    // Handle structured errors with additional metadata
    if (error?.code === 'ACCOUNT_LOCKED') {
      res.status(423).json({
        status: 'error',
        code: 'ACCOUNT_LOCKED',
        message: error.message,
        data: {
          minutesRemaining: error.minutesRemaining,
          lockedUntil: error.lockedUntil,
          failedAttempts: error.failedAttempts
        }
      });
      return;
    }

    if (error?.code === 'INVALID_CREDENTIALS') {
      res.status(401).json({
        status: 'error',
        code: 'INVALID_CREDENTIALS',
        message: error.message,
        data: {
          failedAttempts: error.failedAttempts,
          remainingAttempts: error.remainingAttempts
        }
      });
      return;
    }

    // Generic error handling
    if (error instanceof Error) {
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error al iniciar sesión'
      });
    }
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const newAccessToken = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'Token renovado exitosamente',
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error al renovar token'
      });
    }
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    await authService.logout(req.user.id, req);

    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error al cerrar sesión'
      });
    }
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    // Transformar req.user para que coincida con la estructura esperada en el frontend
    const userResponse = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      roleId: req.user.roleId,
      role: {
        id: req.user.roleId,
        name: req.user.roleName,
        permissions: req.user.permissions
      }
    };

    res.status(200).json({
      status: 'success',
      message: 'Usuario autenticado',
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener información del usuario'
    });
  }
};

export const getAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        status: 'error',
        message: 'Usuario no autenticado'
      });
      return;
    }

    const status = await authService.getAccountStatus(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Estado de cuenta obtenido exitosamente',
      data: status
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener estado de cuenta'
      });
    }
  }
};
