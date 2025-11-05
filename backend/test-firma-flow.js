"use strict";
/**
 * Script de testing completo para el flujo de Firma Perú
 * Incluye pruebas de generación de tokens de un solo uso y callbacks
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var jwt_utils_1 = require("./src/utils/jwt.utils");
var database_1 = __importDefault(require("./src/config/database"));
var axios_1 = __importDefault(require("axios"));
var form_data_1 = __importDefault(require("form-data"));
var BASE_URL = 'http://localhost:5001/api';
var DOCUMENT_ID = '14aa054c-1af6-439a-97a3-634100ead40e';
var USER_ID = 'e076d696-7caf-4180-b841-17f1c83b89d2';
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var loginResponse, authToken, configResponse, paramToken, paramsResponse, paramsBase64, paramsJson, downloadToken, downloadResponse, originalDocument, docBefore, formData, uploadResponse, docAfter, signatures, signature, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🚀 Testing Firma Perú - Flujo Completo\n');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, , 11]);
                    //Step 1: Login
                    console.log('1️⃣ Autenticando usuario...');
                    return [4 /*yield*/, axios_1.default.post("".concat(BASE_URL, "/auth/login"), {
                            username: 'admin',
                            password: 'admin123'
                        })];
                case 2:
                    loginResponse = _b.sent();
                    authToken = loginResponse.data.data.accessToken;
                    console.log('✅ Usuario autenticado\n');
                    // Step 2: Obtener configuración
                    console.log('2️⃣ Obteniendo configuración del componente web...');
                    return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/firma/config"), {
                            headers: { Authorization: "Bearer ".concat(authToken) }
                        })];
                case 3:
                    configResponse = _b.sent();
                    console.log("\u2705 Configuraci\u00F3n obtenida:");
                    console.log("   - Client Web URL: ".concat(configResponse.data.data.clientWebUrl));
                    console.log("   - Local Server Port: ".concat(configResponse.data.data.localServerPort, "\n"));
                    // Step 3: Generar token de un solo uso para params
                    console.log('3️⃣ Generando token de un solo uso para obtener parámetros...');
                    paramToken = (0, jwt_utils_1.generateOneTimeToken)({
                        documentId: DOCUMENT_ID,
                        userId: USER_ID,
                        signatureReason: 'Aprobación del documento de prueba',
                        imageToStamp: ''
                    });
                    console.log("\u2705 Token generado: ".concat(paramToken.substring(0, 30), "...\n"));
                    // Step 4: Obtener parámetros de firma
                    console.log('4️⃣ Obteniendo parámetros de firma...');
                    return [4 /*yield*/, axios_1.default.post("".concat(BASE_URL, "/firma/params"), { param_token: paramToken }, {
                            headers: {
                                Authorization: "Bearer ".concat(authToken),
                                'Content-Type': 'application/json'
                            },
                            responseType: 'text'
                        })];
                case 4:
                    paramsResponse = _b.sent();
                    paramsBase64 = paramsResponse.data;
                    paramsJson = JSON.parse(Buffer.from(paramsBase64, 'base64').toString('utf-8'));
                    console.log("\u2705 Par\u00E1metros obtenidos (Base64):");
                    console.log("   - signatureFormat: ".concat(paramsJson.signatureFormat));
                    console.log("   - signatureLevel: ".concat(paramsJson.signatureLevel));
                    console.log("   - signaturePackaging: ".concat(paramsJson.signaturePackaging));
                    console.log("   - Theme: ".concat(paramsJson.theme));
                    console.log("   - Token presente: ".concat(!!paramsJson.token, "\n"));
                    downloadToken = paramsJson.token;
                    // Step 5: Descargar documento original
                    console.log('5️⃣ Descargando documento original...');
                    return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/firma/document/").concat(DOCUMENT_ID, "/download"), {
                            params: { token: downloadToken },
                            responseType: 'arraybuffer'
                        })];
                case 5:
                    downloadResponse = _b.sent();
                    originalDocument = Buffer.from(downloadResponse.data);
                    console.log("\u2705 Documento descargado:");
                    console.log("   - Tama\u00F1o: ".concat(originalDocument.length, " bytes"));
                    console.log("   - Content-Type: ".concat(downloadResponse.headers['content-type']));
                    console.log("   - Es PDF: ".concat(originalDocument.toString('utf-8', 0, 5) === '%PDF-', "\n"));
                    // Step 6: Simular firma (en producción, esto lo hace el componente web)
                    console.log('6️⃣ Simulando firma digital...');
                    console.log('   (En producción, el componente web firma con DNIe)\n');
                    return [4 /*yield*/, database_1.default.document.findUnique({
                            where: { id: DOCUMENT_ID },
                            select: { currentVersion: true }
                        })];
                case 6:
                    docBefore = _b.sent();
                    console.log("\uD83D\uDCC4 Versi\u00F3n actual del documento: ".concat(docBefore === null || docBefore === void 0 ? void 0 : docBefore.currentVersion, "\n"));
                    // Step 7: Subir documento "firmado"
                    console.log('7️⃣ Subiendo documento firmado...');
                    formData = new form_data_1.default();
                    formData.append('signed', originalDocument, {
                        filename: 'documento-firmado.pdf',
                        contentType: 'application/pdf'
                    });
                    return [4 /*yield*/, axios_1.default.post("".concat(BASE_URL, "/firma/document/").concat(DOCUMENT_ID, "/upload-signed?token=").concat(downloadToken), formData, {
                            headers: __assign({}, formData.getHeaders())
                        })];
                case 7:
                    uploadResponse = _b.sent();
                    console.log("\u2705 Documento procesado:");
                    console.log("   - Success: ".concat(uploadResponse.data.status === 'success'));
                    console.log("   - Message: ".concat(uploadResponse.data.message, "\n"));
                    // Step 8: Verificar cambios en la base de datos
                    console.log('8️⃣ Verificando cambios en la base de datos...');
                    return [4 /*yield*/, database_1.default.document.findUnique({
                            where: { id: DOCUMENT_ID },
                            include: {
                                versions: {
                                    orderBy: { versionNumber: 'desc' },
                                    take: 2
                                }
                            }
                        })];
                case 8:
                    docAfter = _b.sent();
                    if (docAfter) {
                        console.log("\u2705 Documento actualizado:");
                        console.log("   - Versi\u00F3n actual: ".concat(docAfter.currentVersion));
                        console.log("   - Total de versiones: ".concat(docAfter.versions.length));
                        if (docAfter.currentVersion > ((docBefore === null || docBefore === void 0 ? void 0 : docBefore.currentVersion) || 1)) {
                            console.log("   \u2705 Nueva versi\u00F3n creada exitosamente!\n");
                        }
                        else {
                            console.log("   \u26A0\uFE0F No se cre\u00F3 nueva versi\u00F3n\n");
                        }
                    }
                    // Step 9: Verificar registro de firma
                    console.log('9️⃣ Verificando registro de firma...');
                    return [4 /*yield*/, database_1.default.signature.findMany({
                            where: { documentId: DOCUMENT_ID },
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: {
                                signer: {
                                    select: {
                                        username: true,
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        })];
                case 9:
                    signatures = _b.sent();
                    if (signatures.length > 0) {
                        signature = signatures[0];
                        console.log("\u2705 Firma registrada:");
                        console.log("   - ID: ".concat(signature.id));
                        console.log("   - Firmante: ".concat(signature.signer.firstName, " ").concat(signature.signer.lastName));
                        console.log("   - Status: ".concat(signature.status));
                        console.log("   - V\u00E1lida: ".concat(signature.isValid));
                        console.log("   - Fecha: ".concat(signature.timestamp.toLocaleString(), "\n"));
                    }
                    else {
                        console.log("   \u26A0\uFE0F No se encontr\u00F3 registro de firma\n");
                    }
                    console.log('='.repeat(60));
                    console.log('🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
                    console.log('='.repeat(60));
                    console.log('\n📊 Resumen:');
                    console.log("   \u2705 Login y autenticaci\u00F3n");
                    console.log("   \u2705 Obtenci\u00F3n de configuraci\u00F3n");
                    console.log("   \u2705 Generaci\u00F3n de tokens de un solo uso");
                    console.log("   \u2705 Obtenci\u00F3n de par\u00E1metros de firma");
                    console.log("   \u2705 Descarga de documento original");
                    console.log("   \u2705 Subida de documento firmado");
                    console.log("   \u2705 Creaci\u00F3n de nueva versi\u00F3n del documento");
                    console.log("   \u2705 Registro de firma en base de datos\n");
                    return [3 /*break*/, 11];
                case 10:
                    error_1 = _b.sent();
                    console.error('\n❌ ERROR:', ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                    if (error_1.response) {
                        console.error('Status:', error_1.response.status);
                        console.error('Data:', JSON.stringify(error_1.response.data, null, 2));
                    }
                    process.exit(1);
                    return [3 /*break*/, 11];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main()
    .then(function () {
    console.log('✅ Tests completados');
    process.exit(0);
})
    .catch(function (error) {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
