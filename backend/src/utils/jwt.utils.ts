import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { FIRMA_PERU_CONFIG } from '../config/firma-peru';

dotenv.config();

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

interface TokenPayload {
  userId: string;
  roleId: string;
  type: 'access' | 'refresh';
}

export const generateAccessToken = (userId: string, roleId: string): string => {
  const payload = {
    userId,
    roleId,
    type: 'access' as const
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
};

export const generateRefreshToken = (userId: string): string => {
  const payload = {
    userId,
    type: 'refresh' as const
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Error al verificar token');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.decode(token) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

// ==================== FUNCIONES PARA TOKENS DE UN SOLO USO (FIRMA PERÚ) ====================

interface OneTimeTokenPayload {
  documentId: string;
  userId: string;
  signatureReason?: string;
  imageToStamp?: string;
  flowId?: string;
}

/**
 * Genera un token de un solo uso para las operaciones de firma con Firma Perú
 * @param payload Datos a incluir en el token
 * @param expiresIn Tiempo de expiración (por defecto 5 minutos)
 * @returns Token JWT firmado
 */
export const generateOneTimeToken = (payload: OneTimeTokenPayload, expiresIn: string = '5m'): string => {
  return jwt.sign(payload, FIRMA_PERU_CONFIG.ONE_TIME_TOKEN_SECRET, { expiresIn } as any);
};

/**
 * Verifica y decodifica un token de un solo uso
 * @param token Token a verificar
 * @returns Payload del token o null si es inválido/expirado
 */
export const verifyOneTimeToken = (token: string): OneTimeTokenPayload | null => {
  try {
    return jwt.verify(token, FIRMA_PERU_CONFIG.ONE_TIME_TOKEN_SECRET) as OneTimeTokenPayload;
  } catch (error) {
    return null;
  }
};
