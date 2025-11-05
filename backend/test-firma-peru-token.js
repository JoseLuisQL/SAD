"use strict";
/**
 * Script para probar la obtención del token de Firma Perú
 * con las credenciales reales de fwAuthorization.json
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var firma_peru_1 = require("./src/config/firma-peru");
function testTokenGeneration() {
    return __awaiter(this, void 0, void 0, function () {
        var params, response, token, parts, payload, expiresIn, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🔐 Probando obtención de token de Firma Perú\n');
                    console.log('='.repeat(60));
                    console.log('\n📋 Configuración:');
                    console.log("   - Client ID: ".concat(firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_ID));
                    console.log("   - Client Secret: ".concat(firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_SECRET.substring(0, 20), "..."));
                    console.log("   - Token URL: ".concat(firma_peru_1.FIRMA_PERU_CONFIG.TOKEN_URL, "\n"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    console.log('🚀 Enviando solicitud de token...\n');
                    params = new URLSearchParams();
                    params.append('client_id', firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_ID);
                    params.append('client_secret', firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_SECRET);
                    console.log('Request Body (x-www-form-urlencoded):');
                    console.log("   client_id=".concat(firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_ID));
                    console.log("   client_secret=".concat(firma_peru_1.FIRMA_PERU_CONFIG.CLIENT_SECRET.substring(0, 20), "..."));
                    return [4 /*yield*/, axios_1.default.post(firma_peru_1.FIRMA_PERU_CONFIG.TOKEN_URL, params, {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            timeout: 15000,
                        })];
                case 2:
                    response = _a.sent();
                    console.log('\n✅ Token obtenido exitosamente!\n');
                    console.log('Response:');
                    console.log("   - Status: ".concat(response.status));
                    token = typeof response.data === 'string' ? response.data : response.data.access_token;
                    if (token) {
                        console.log("   - Token (JWT): ".concat(token.substring(0, 80), "..."));
                        console.log("   - Longitud: ".concat(token.length, " caracteres"));
                        // Intentar decodificar el JWT para ver su contenido (sin verificar)
                        try {
                            parts = token.split('.');
                            if (parts.length === 3) {
                                payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                                console.log("\n   Payload del token:");
                                console.log("   - Subject: ".concat(payload.sub || 'N/A'));
                                console.log("   - Issued At: ".concat(payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A'));
                                console.log("   - Expires: ".concat(payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'));
                                if (payload.exp) {
                                    expiresIn = payload.exp - Math.floor(Date.now() / 1000);
                                    console.log("   - Expira en: ".concat(expiresIn, " segundos (").concat(Math.floor(expiresIn / 60), " minutos)"));
                                }
                            }
                        }
                        catch (e) {
                            console.log('   (No se pudo decodificar el payload del JWT)');
                        }
                        console.log('');
                    }
                    else {
                        console.log('\n⚠️  No se pudo obtener el token del response.\n');
                    }
                    console.log('='.repeat(60));
                    console.log('🎉 ¡Credenciales de Firma Perú verificadas correctamente!');
                    console.log('='.repeat(60));
                    return [2 /*return*/, response.data];
                case 3:
                    error_1 = _a.sent();
                    console.error('\n❌ Error al obtener token:\n');
                    if (axios_1.default.isAxiosError(error_1)) {
                        if (error_1.response) {
                            console.error("Status: ".concat(error_1.response.status));
                            console.error('Response Data:', JSON.stringify(error_1.response.data, null, 2));
                            console.error('\n⚠️  Posibles causas:');
                            console.error('   - Credenciales incorrectas (client_id o client_secret)');
                            console.error('   - URL del token incorrecta');
                            console.error('   - Credenciales expiradas o revocadas');
                        }
                        else if (error_1.request) {
                            console.error('No se pudo conectar al servidor de Firma Perú');
                            console.error('\n⚠️  Posibles causas:');
                            console.error('   - Sin conexión a internet');
                            console.error('   - URL incorrecta');
                            console.error('   - Firewall bloqueando la conexión');
                        }
                    }
                    else {
                        console.error('Error:', error_1.message);
                    }
                    console.error('\n='.repeat(60));
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Ejecutar test
testTokenGeneration()
    .then(function () {
    console.log('\n✅ Test completado exitosamente');
    process.exit(0);
})
    .catch(function () {
    console.error('\n❌ Test falló');
    process.exit(1);
});
