# Script de prueba simple para endpoints de Firma Perú

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "TEST 1: Login" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$loginBody = '{"username":"admin","password":"admin123"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"

Write-Host "Token obtenido:" -ForegroundColor Green
$token = $loginResponse.data.accessToken
Write-Host $token.Substring(0, 50) -ForegroundColor Yellow

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "TEST 2: GET /api/firma/config" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$headers = @{
    Authorization = "Bearer $token"
}

$config = Invoke-RestMethod -Uri "http://localhost:5001/api/firma/config" -Method Get -Headers $headers
Write-Host "Config obtenida:" -ForegroundColor Green
Write-Host "Client Web URL: $($config.data.clientWebUrl)" -ForegroundColor Yellow
Write-Host "Local Server Port: $($config.data.localServerPort)" -ForegroundColor Yellow

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "Pruebas completadas exitosamente!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
