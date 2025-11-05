"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOneTimeToken = exports.generateOneTimeToken = exports.decodeToken = exports.verifyToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var dotenv_1 = __importDefault(require("dotenv"));
var firma_peru_1 = require("../config/firma-peru");
dotenv_1.default.config();
var JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
var JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
var generateAccessToken = function (userId, roleId) {
    var payload = {
        userId: userId,
        roleId: roleId,
        type: 'access'
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
exports.generateAccessToken = generateAccessToken;
var generateRefreshToken = function (userId) {
    var payload = {
        userId: userId,
        type: 'refresh'
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};
exports.generateRefreshToken = generateRefreshToken;
var verifyToken = function (token) {
    try {
        var decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expirado');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Token inválido');
        }
        throw new Error('Error al verificar token');
    }
};
exports.verifyToken = verifyToken;
var decodeToken = function (token) {
    try {
        var decoded = jsonwebtoken_1.default.decode(token);
        return decoded;
    }
    catch (error) {
        return null;
    }
};
exports.decodeToken = decodeToken;
// ==================== FUNCIONES PARA TOKENS DE UN SOLO USO (FIRMA PERÚ) ====================
/**
 * Genera un token de un solo uso para las operaciones de firma con Firma Perú
 * @param payload Datos a incluir en el token
 * @param expiresIn Tiempo de expiración (por defecto 5 minutos)
 * @returns Token JWT firmado
 */
var generateOneTimeToken = function (payload, expiresIn) {
    if (expiresIn === void 0) { expiresIn = '5m'; }
    return jsonwebtoken_1.default.sign(payload, firma_peru_1.FIRMA_PERU_CONFIG.ONE_TIME_TOKEN_SECRET, { expiresIn: expiresIn });
};
exports.generateOneTimeToken = generateOneTimeToken;
/**
 * Verifica y decodifica un token de un solo uso
 * @param token Token a verificar
 * @returns Payload del token o null si es inválido/expirado
 */
var verifyOneTimeToken = function (token) {
    try {
        return jsonwebtoken_1.default.verify(token, firma_peru_1.FIRMA_PERU_CONFIG.ONE_TIME_TOKEN_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyOneTimeToken = verifyOneTimeToken;
