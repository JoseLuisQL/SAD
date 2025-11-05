import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.utils';
import * as auditService from './audit.service';
import { Request } from 'express';

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roleId: string;
    role: {
      id: string;
      name: string;
      permissions: Record<string, any>;
    };
  };
  accessToken: string;
  refreshToken: string;
}

export const register = async (userData: RegisterData) => {
  const { username, email, password, firstName, lastName, roleId } = userData;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username },
        { email }
      ]
    }
  });

  if (existingUser) {
    if (existingUser.username === username) {
      throw new Error('El nombre de usuario ya está en uso');
    }
    if (existingUser.email === email) {
      throw new Error('El correo electrónico ya está en uso');
    }
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw new Error('El rol especificado no existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      roleId,
      isActive: true
    },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      roleId: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          name: true,
          permissions: true
        }
      }
    }
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roleId: user.roleId,
    isActive: user.isActive,
    createdAt: user.createdAt,
    role: {
      id: user.roleId,
      name: user.role.name,
      permissions: user.role.permissions as Record<string, any>
    }
  };
};

export const login = async (username: string, password: string, req?: Request): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { username },
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
    if (req) {
      await auditService.log({
        userId: 'unknown',
        action: 'LOGIN',
        module: 'AUTH',
        entityType: 'User',
        entityId: username,
        newValue: { success: false, reason: 'user_not_found' },
        req
      });
    }
    throw new Error('Credenciales inválidas');
  }

  if (!user.isActive) {
    if (req) {
      await auditService.log({
        userId: user.id,
        action: 'LOGIN',
        module: 'AUTH',
        entityType: 'User',
        entityId: user.id,
        newValue: { success: false, reason: 'user_inactive' },
        req
      });
    }
    throw new Error('Usuario inactivo. Contacte al administrador');
  }

  // Check if account is locked
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const secondsRemaining = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000);
    const minutesRemaining = Math.ceil(secondsRemaining / 60);
    
    if (req) {
      await auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'AUTH',
        entityType: 'User',
        entityId: user.id,
        newValue: { success: false, reason: 'account_locked', secondsRemaining, minutesRemaining },
        req
      });
    }
    
    // Create a structured error with metadata
    const error: any = new Error('ACCOUNT_LOCKED');
    error.code = 'ACCOUNT_LOCKED';
    error.minutesRemaining = minutesRemaining;
    error.lockedUntil = user.lockedUntil.toISOString();
    error.message = `Su cuenta ha sido bloqueada temporalmente por seguridad debido a múltiples intentos fallidos de inicio de sesión. Por favor, intente nuevamente en ${minutesRemaining} minuto${minutesRemaining !== 1 ? 's' : ''}.`;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Increment failed attempts
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    // Reset counter if last failed attempt was more than 15 minutes ago
    const shouldResetCounter = !user.lastFailedAt || user.lastFailedAt < fifteenMinutesAgo;
    const newFailedAttempts = shouldResetCounter ? 1 : user.failedAttempts + 1;
    
    // Lock account if 5 failed attempts in 15 minutes
    const lockedUntil = newFailedAttempts >= 5 
      ? new Date(now.getTime() + 30 * 60 * 1000) // Lock for 30 minutes
      : null;
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: newFailedAttempts,
        lastFailedAt: now,
        lockedUntil
      }
    });
    
    if (req) {
      await auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        module: 'AUTH',
        entityType: 'User',
        entityId: user.id,
        newValue: { 
          success: false, 
          reason: 'invalid_password',
          failedAttempts: newFailedAttempts,
          locked: !!lockedUntil
        },
        req
      });
    }
    
    if (lockedUntil) {
      const error: any = new Error('ACCOUNT_LOCKED');
      error.code = 'ACCOUNT_LOCKED';
      error.minutesRemaining = 30;
      error.lockedUntil = lockedUntil.toISOString();
      error.failedAttempts = newFailedAttempts;
      error.message = 'Su cuenta ha sido bloqueada temporalmente por seguridad debido a múltiples intentos fallidos de inicio de sesión. Por favor, intente nuevamente en 30 minutos.';
      throw error;
    }
    
    // Provide helpful feedback about remaining attempts
    const remainingAttempts = 5 - newFailedAttempts;
    const error: any = new Error('INVALID_CREDENTIALS');
    error.code = 'INVALID_CREDENTIALS';
    error.failedAttempts = newFailedAttempts;
    error.remainingAttempts = remainingAttempts;
    error.message = remainingAttempts > 0
      ? `Usuario o contraseña incorrectos. Le quedan ${remainingAttempts} intento${remainingAttempts !== 1 ? 's' : ''} antes de que su cuenta sea bloqueada temporalmente.`
      : 'Usuario o contraseña incorrectos.';
    throw error;
  }

  // Reset failed attempts on successful login
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedAttempts: 0,
      lastFailedAt: null,
      lockedUntil: null
    }
  });

  // Log successful login
  if (req) {
    await auditService.log({
      userId: user.id,
      action: 'LOGIN',
      module: 'AUTH',
      entityType: 'User',
      entityId: user.id,
      newValue: { success: true },
      req
    });
  }

  const accessToken = generateAccessToken(user.id, user.roleId);
  const refreshToken = generateRefreshToken(user.id);

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roleId: user.roleId,
      role: {
        id: user.roleId,
        name: user.role.name,
        permissions: user.role.permissions as Record<string, any>
      }
    },
    accessToken,
    refreshToken
  };
};

export const refreshAccessToken = async (refreshToken: string): Promise<string> => {
  try {
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Token inválido');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        roleId: true,
        isActive: true
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new Error('Usuario inactivo');
    }

    const newAccessToken = generateAccessToken(user.id, user.roleId);
    return newAccessToken;
  } catch (error) {
    throw new Error('Token de actualización inválido o expirado');
  }
};

export const logout = async (userId: string, req?: Request): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (req) {
    await auditService.log({
      userId,
      action: 'LOGOUT',
      module: 'AUTH',
      entityType: 'User',
      entityId: userId,
      req
    });
  }
};

export const getAccountStatus = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      failedAttempts: true,
      lockedUntil: true
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return {
    failedAttempts: user.failedAttempts,
    lockedUntil: user.lockedUntil,
    isLocked: user.lockedUntil ? user.lockedUntil > new Date() : false
  };
};
