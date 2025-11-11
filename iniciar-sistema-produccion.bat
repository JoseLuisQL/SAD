@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Sistema SAD - Inicio de Produccion
color 0A

echo ================================================================================
echo                     Sistema de Archivos Digitales (SAD)
echo                          Iniciar Sistema en Produccion
echo ================================================================================
echo.

:: Verificar que estamos en el directorio correcto
if not exist "backend" (
    echo [ERROR] No se encontro la carpeta backend
    echo Ejecuta este script desde el directorio raiz del proyecto SAD
    pause
    exit /b 1
)

if not exist "frontend" (
    echo [ERROR] No se encontro la carpeta frontend
    echo Ejecuta este script desde el directorio raiz del proyecto SAD
    pause
    exit /b 1
)

:: Obtener la IP de la red local
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP_TEMP=%%a
    goto :got_ip
)
:got_ip
set IP=!IP_TEMP: =!

echo [INFO] Iniciando sistema de produccion...
echo [INFO] IP de red local detectada: !IP!
echo.

:: Iniciar Backend en una nueva ventana
echo [1/2] Iniciando Backend (Puerto 5001)...
start "SAD Backend - Puerto 5001" cmd /k "cd /d "%~dp0backend" && npm run start"
timeout /t 3 /nobreak >nul

:: Iniciar Frontend en una nueva ventana
echo [2/2] Iniciando Frontend (Puerto 3000)...
start "SAD Frontend - Puerto 3000" cmd /k "cd /d "%~dp0frontend" && set NODE_ENV=production && npm run start"
timeout /t 5 /nobreak >nul

echo.
echo ================================================================================
echo                            Sistema Iniciado
echo ================================================================================
echo.
echo [OK] Backend iniciado en nueva ventana
echo      - URL Local:  http://localhost:5001/api
echo      - URL Red:    http://!IP!:5001/api
echo.
echo [OK] Frontend iniciado en nueva ventana
echo      - URL Local:  http://localhost:3000
echo      - URL Red:    http://!IP!:3000
echo.
echo [INFO] Accede a la aplicacion desde tu navegador
echo [INFO] Para detener el sistema, cierra las ventanas de Backend y Frontend
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul
