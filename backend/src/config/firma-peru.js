"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIRMA_PERU_CONFIG = void 0;
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.FIRMA_PERU_CONFIG = {
    // Configuración del servicio de validación (API REST)
    API_URL: process.env.FIRMA_PERU_API_URL || 'http://localhost:8080/validador/api',
    CREDENTIAL: process.env.FIRMA_PERU_CREDENTIAL || 'default-credential',
    CLIENT_ID: process.env.FIRMA_PERU_CLIENT_ID || '',
    CLIENT_SECRET: process.env.FIRMA_PERU_CLIENT_SECRET || '',
    TOKEN_URL: process.env.FIRMA_PERU_TOKEN_URL || 'https://apps.firmaperu.gob.pe/admin/api/security/generate-token',
    // Configuración del componente web (cliente JavaScript)
    CLIENT_WEB_URL: process.env.FIRMA_PERU_CLIENT_WEB_URL || 'https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js',
    LOCAL_SERVER_PORT: parseInt(process.env.FIRMA_PERU_LOCAL_SERVER_PORT || '48596', 10),
    BACKEND_BASE_URL: process.env.FIRMA_PERU_BACKEND_BASE_URL || 'http://localhost:5000/api/firma',
    ONE_TIME_TOKEN_SECRET: process.env.FIRMA_PERU_ONE_TIME_TOKEN_SECRET || 'super-secret-one-time-token-key',
};
