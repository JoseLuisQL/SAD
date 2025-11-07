# Script de inicio para producción - SAD Frontend
# Sistema Integrado de Archivos Digitales

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SAD - Sistema de Archivos Digitales" -ForegroundColor Cyan
Write-Host "  Frontend en Modo Producción" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el build
if (-not (Test-Path ".next")) {
    Write-Host "❌ Error: No se encontró el build de producción" -ForegroundColor Red
    Write-Host "   Ejecuta primero: npm run build" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Verificar archivo .env.production
if (-not (Test-Path ".env.production")) {
    Write-Host "⚠️  Advertencia: No se encontró .env.production" -ForegroundColor Yellow
    Write-Host "   Usando variables de entorno del sistema" -ForegroundColor Yellow
    Write-Host ""
}

# Obtener IP de red local
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -notlike "127.*" -and 
    $_.IPAddress -notlike "169.254.*" -and 
    $_.IPAddress -notlike "192.168.56.*" -and
    $_.PrefixOrigin -ne "WellKnown"
} | Select-Object -First 1).IPAddress

if (-not $localIP) {
    $localIP = "No detectada"
}

# Obtener configuración
$apiUrl = $env:NEXT_PUBLIC_API_URL
if (-not $apiUrl) {
    $apiUrl = "No configurada"
}

$port = if ($env:PORT) { $env:PORT } else { "3000" }

Write-Host "📋 Configuración:" -ForegroundColor Green
Write-Host "   API URL: $apiUrl" -ForegroundColor White
Write-Host "   Puerto: $port" -ForegroundColor White
Write-Host "   Host: 0.0.0.0 (todas las interfaces)" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs de Acceso:" -ForegroundColor Cyan
Write-Host "   Local:      http://localhost:$port" -ForegroundColor White
Write-Host "   Red Local:  http://${localIP}:$port" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Accede desde tu celular usando:" -ForegroundColor Yellow
Write-Host "   http://${localIP}:$port" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Iniciando servidor de producción..." -ForegroundColor Green
Write-Host ""

# Configurar para escuchar en todas las interfaces
$env:HOSTNAME = "0.0.0.0"
if (-not $env:PORT) {
    $env:PORT = "3000"
}

# Iniciar el servidor
npm run start
