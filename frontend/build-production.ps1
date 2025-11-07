# Script de build para producción - SAD Frontend
# Sistema Integrado de Archivos Digitales

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  SAD - Build de Producción" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "🔍 Verificando entorno..." -ForegroundColor Yellow
$nodeVersion = node --version
Write-Host "   Node.js: $nodeVersion" -ForegroundColor White

# Verificar archivo .env.production
if (Test-Path ".env.production") {
    Write-Host "✓ Archivo .env.production encontrado" -ForegroundColor Green
    
    # Leer y mostrar configuración (sin mostrar valores sensibles completos)
    $envContent = Get-Content ".env.production" | Where-Object { $_ -match "NEXT_PUBLIC_API_URL=" }
    if ($envContent) {
        Write-Host "✓ Variable NEXT_PUBLIC_API_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Variable NEXT_PUBLIC_API_URL no encontrada en .env.production" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Advertencia: No existe .env.production" -ForegroundColor Yellow
    Write-Host "   Se usará .env.production.example como referencia" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔨 Iniciando build..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar build
$env:NODE_ENV = "production"
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  ✓ Build completado exitosamente" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Archivos generados en: .next/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para iniciar el servidor de producción:" -ForegroundColor Yellow
    Write-Host "   npm run start" -ForegroundColor White
    Write-Host "o ejecuta:" -ForegroundColor Yellow
    Write-Host "   .\start-production.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host "  ❌ Error en el build" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revisa los errores arriba y corrige antes de continuar" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
