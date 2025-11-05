# Script de testing para endpoints de Firma Perú

$baseUrl = "http://localhost:5001"
$documentId = "14aa054c-1af6-439a-97a3-634100ead40e"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST 1: Login - Obtener Token JWT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.accessToken
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0,50))..." -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST 2: GET /api/firma/config" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $configResponse = Invoke-RestMethod -Uri "$baseUrl/api/firma/config" -Method Get -Headers $headers
    Write-Host "✅ Configuración obtenida exitosamente" -ForegroundColor Green
    Write-Host "Client Web URL: $($configResponse.data.clientWebUrl)" -ForegroundColor Gray
    Write-Host "Local Server Port: $($configResponse.data.localServerPort)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener configuración: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
}

Start-Sleep -Seconds 1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST 3: POST /api/firma/params" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Crear un param_token simulado (en producción, esto vendría del proceso de firma)
$paramTokenPayload = @{
    documentId = $documentId
    userId = "e076d696-7caf-4180-b841-17f1c83b89d2"
    signatureReason = "Aprobación del documento"
    imageToStamp = ""
}

# Necesitamos crear el param_token usando JWT
# Por ahora, vamos a simular la llamada directa sin param_token para ver el error
Write-Host "ℹ️ Nota: Este endpoint requiere un param_token válido generado con ONE_TIME_TOKEN_SECRET" -ForegroundColor Yellow
Write-Host "   En producción, el frontend genera este token antes de llamar al endpoint" -ForegroundColor Yellow
Write-Host "   Saltaremos esta prueba por ahora..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 1

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST 4: Verificar documento en base de datos" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

try {
    $docResponse = Invoke-RestMethod -Uri "$baseUrl/api/documents/$documentId" -Method Get -Headers $headers
    Write-Host "✅ Documento encontrado" -ForegroundColor Green
    Write-Host "Número: $($docResponse.data.documentNumber)" -ForegroundColor Gray
    Write-Host "Archivo: $($docResponse.data.fileName)" -ForegroundColor Gray
    Write-Host "Versión actual: $($docResponse.data.currentVersion)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Error al obtener documento: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "✅ Tests básicos completados" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Notas importantes:" -ForegroundColor Yellow
Write-Host "   - Los endpoints de download y upload requieren tokens de un solo uso" -ForegroundColor Yellow
Write-Host "   - Estos tokens son generados por generateOneTimeToken() en el backend" -ForegroundColor Yellow
Write-Host "   - Para probar el flujo completo, se necesita integrar con el frontend" -ForegroundColor Yellow
Write-Host "   - O crear un script que genere los tokens de un solo uso" -ForegroundColor Yellow
