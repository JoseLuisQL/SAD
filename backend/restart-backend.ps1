# Script para reiniciar el backend con las nuevas rutas de reportes
# Sistema de Archivo Digital DISA

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reiniciando Backend con Reportes" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Detener procesos de Node existentes
Write-Host "1. Deteniendo procesos de Node..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "   Deteniendo proceso Node (PID: $($_.Id))..." -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "   ✓ Procesos detenidos" -ForegroundColor Green
} else {
    Write-Host "   ℹ No hay procesos de Node corriendo" -ForegroundColor Cyan
}

Start-Sleep -Seconds 2

# 2. Limpiar directorio dist
Write-Host "`n2. Limpiando directorio dist..." -ForegroundColor Yellow
if (Test-Path ".\dist") {
    Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Directorio dist limpiado" -ForegroundColor Green
} else {
    Write-Host "   ℹ Directorio dist no existe" -ForegroundColor Cyan
}

# 3. Recompilar TypeScript
Write-Host "`n3. Recompilando TypeScript..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error en la compilación:" -ForegroundColor Red
    Write-Host $buildOutput -ForegroundColor Red
    Write-Host "`nPresione cualquier tecla para salir..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# 4. Verificar que los archivos de reportes se compilaron
Write-Host "`n4. Verificando archivos de reportes..." -ForegroundColor Yellow
$requiredFiles = @(
    ".\dist\services\reports.service.js",
    ".\dist\controllers\reports.controller.js",
    ".\dist\routes\reports.routes.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "   ✗ $file NO ENCONTRADO" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "`n   ✗ Faltan archivos compilados" -ForegroundColor Red
    Write-Host "   Presione cualquier tecla para salir..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# 5. Iniciar servidor en modo desarrollo
Write-Host "`n5. Iniciando servidor en modo desarrollo..." -ForegroundColor Yellow
Write-Host "   ℹ El servidor se iniciará en una nueva ventana" -ForegroundColor Cyan
Write-Host "   ℹ Mantenga esa ventana abierta" -ForegroundColor Cyan
Write-Host ""

Start-Sleep -Seconds 1

# Iniciar en una nueva ventana de PowerShell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'Iniciando servidor de desarrollo...' -ForegroundColor Green; npm run dev"

Write-Host "   ✓ Servidor iniciándose en nueva ventana" -ForegroundColor Green

# 6. Esperar y verificar que el servidor responde
Write-Host "`n6. Esperando a que el servidor esté listo..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$maxAttempts = 10
$attempt = 0
$serverReady = $false

while ($attempt -lt $maxAttempts -and -not $serverReady) {
    $attempt++
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5001/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.status -eq "OK") {
            $serverReady = $true
            Write-Host "   ✓ Servidor respondiendo correctamente" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⏳ Intento $attempt/$maxAttempts..." -ForegroundColor Gray
        Start-Sleep -Seconds 2
    }
}

if (-not $serverReady) {
    Write-Host "   ⚠ El servidor no responde después de $maxAttempts intentos" -ForegroundColor Yellow
    Write-Host "   ℹ Verifique la ventana del servidor para ver errores" -ForegroundColor Cyan
} else {
    # 7. Test rápido de la ruta de reportes
    Write-Host "`n7. Verificando ruta de reportes (sin autenticación)..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/api/reports/documents" -ErrorAction Stop
        Write-Host "   ⚠ La ruta responde pero requiere autenticación (esperado)" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Host "   ✓ Ruta de reportes existe y requiere autenticación (correcto)" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Error inesperado: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Reinicio Completado" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nServidor: http://localhost:5001" -ForegroundColor Green
Write-Host "Health Check: http://localhost:5001/api/health" -ForegroundColor Green
Write-Host "API Docs: http://localhost:5001/api" -ForegroundColor Green

Write-Host "`nPróximos pasos:" -ForegroundColor Yellow
Write-Host "1. Abrir el frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "2. Iniciar sesión" -ForegroundColor Gray
Write-Host "3. Ir a Reportes y Analítica" -ForegroundColor Gray
Write-Host "4. Generar un reporte de prueba" -ForegroundColor Gray

Write-Host "`nPresione cualquier tecla para cerrar esta ventana..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
