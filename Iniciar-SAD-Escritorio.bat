@echo off
title Sistema Integrado de Archivos Digitales - DISA Chincheros
color 0B
chcp 65001 >nul

echo =======================================================================
echo          SISTEMA INTEGRADO DE ARCHIVOS DIGITALES (SAD)
echo                 DIRECCIÓN DE SALUD CHINCHEROS
echo          Estación Local de Custodia y Archivo Digital
echo =======================================================================
echo.

:: 1. Verificar si el servicio de MySQL o MariaDB está iniciado
echo [1/3] Verificando estado de la Base de Datos Local...
netstat -ano | findstr /R ":3306 " >nul
if %errorlevel% neq 0 (
    echo [INFO] El puerto 3306 no esta activo. Intentando iniciar servicio MySQL/MariaDB...
    sc start wampmysqld64 >nul 2>&1
    sc start wampmariadb64 >nul 2>&1
    sc start MySQL80 >nul 2>&1
    sc start mysql >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] Base de datos local activa en puerto 3306.
)

:: 2. Iniciar la aplicación de escritorio
echo [2/3] Iniciando Entorno de Escritorio SAD...
cd /d "%~dp0\desktop"

if not exist "node_modules" (
    echo [INFO] Primera ejecucion detectada. Instalando librerias de escritorio...
    call npm install
)

echo [3/3] Lanzando ventana de aplicacion...
start "" npx electron .

exit
