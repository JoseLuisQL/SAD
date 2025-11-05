# Script para preparar la base de datos de producción
# Sistema SAD - DISA CHINCHEROS

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  PREPARACIÓN DE BASE DE DATOS PARA PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "  Sistema Integrado de Archivos Digitales" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Solicitar contraseña de MySQL
Write-Host "1. CONFIGURACIÓN" -ForegroundColor Yellow
Write-Host ""
$mysqlPassword = Read-Host "Ingresa la contraseña de MySQL root"

if ([string]::IsNullOrWhiteSpace($mysqlPassword)) {
    Write-Host "❌ Error: La contraseña no puede estar vacía" -ForegroundColor Red
    exit 1
}

# 2. Actualizar .env.temp
Write-Host ""
Write-Host "2. Actualizando archivo .env.temp..." -ForegroundColor Yellow
$envContent = "DATABASE_URL=mysql://root:$mysqlPassword@localhost:3306/sad_produccion_temp"
$envContent | Out-File -FilePath "backend\.env.temp" -Encoding UTF8 -NoNewline
Write-Host "✓ Archivo .env.temp actualizado" -ForegroundColor Green

# 3. Generar estructura de base de datos
Write-Host ""
Write-Host "3. Generando estructura de base de datos..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar 1-2 minutos)" -ForegroundColor Gray
Write-Host ""

Set-Location backend

# Cargar variables de entorno
$env:DATABASE_URL = "mysql://root:$mysqlPassword@localhost:3306/sad_produccion_temp"

# Ejecutar prisma db push
Write-Host "   Ejecutando: npx prisma db push --skip-generate" -ForegroundColor Gray
npx prisma db push --skip-generate

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Error al generar la base de datos" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUCIÓN MANUAL:" -ForegroundColor Yellow
    Write-Host "1. Abre MySQL Workbench" -ForegroundColor White
    Write-Host "2. Ejecuta estos comandos:" -ForegroundColor White
    Write-Host "   DROP DATABASE IF EXISTS sad_produccion_temp;" -ForegroundColor Cyan
    Write-Host "   CREATE DATABASE sad_produccion_temp;" -ForegroundColor Cyan
    Write-Host "   USE sad_produccion_temp;" -ForegroundColor Cyan
    Write-Host "3. Intenta de nuevo el script" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✓ Estructura de base de datos creada" -ForegroundColor Green

# 4. Crear usuario administrador
Write-Host ""
Write-Host "4. Creando usuario administrador..." -ForegroundColor Yellow
npx ts-node prisma/seed-admin-only.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al crear usuario administrador" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Usuario administrador creado" -ForegroundColor Green

# 5. Instrucciones finales
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  ✓ BASE DE DATOS PREPARADA EXITOSAMENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "SIGUIENTES PASOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abre MySQL Workbench" -ForegroundColor White
Write-Host ""
Write-Host "2. Exportar ESTRUCTURA (sin datos):" -ForegroundColor White
Write-Host "   - Server → Data Export" -ForegroundColor Gray
Write-Host "   - Selecciona: sad_produccion_temp" -ForegroundColor Gray
Write-Host "   - Export to Self-Contained File" -ForegroundColor Gray
Write-Host "   - Ruta: C:\Proyectos\SAD\schema-produccion.sql" -ForegroundColor Cyan
Write-Host "   - Marca: Dump Structure Only" -ForegroundColor Gray
Write-Host "   - Click: Start Export" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Exportar DATOS del admin:" -ForegroundColor White
Write-Host "   - Server → Data Export" -ForegroundColor Gray
Write-Host "   - Selecciona SOLO tablas: roles y users" -ForegroundColor Gray
Write-Host "   - Export to Self-Contained File" -ForegroundColor Gray
Write-Host "   - Ruta: C:\Proyectos\SAD\admin-data.sql" -ForegroundColor Cyan
Write-Host "   - Marca: Dump Data Only" -ForegroundColor Gray
Write-Host "   - Click: Start Export" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Continúa con la guía principal:" -ForegroundColor White
Write-Host "   PREPARACION-LOCAL-ANTES-DESPLIEGUE.md" -ForegroundColor Cyan
Write-Host "   Sección: Paso 5 - Organizar Archivos para Despliegue" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location ..
