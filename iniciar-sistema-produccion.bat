@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title Sistema SAD - Inicio de Produccion
color 0A

echo.
echo  ========================================================================
echo          SISTEMA DE ARCHIVOS DIGITALES (SAD) - PRODUCCION v2.3
echo  ========================================================================
echo.

:: Configuracion
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "BACKEND_PORT=5001"
set "FRONTEND_PORT=3000"
set "VALIDADOR_PORT=8080"

:: ============================================================================
:: PASO 1: Verificar estructura
:: ============================================================================
echo  [1/5] Verificando estructura del proyecto...

if not exist "%BACKEND_DIR%" (
    echo  [ERROR] No se encontro la carpeta backend
    goto :error_exit
)
if not exist "%FRONTEND_DIR%" (
    echo  [ERROR] No se encontro la carpeta frontend
    goto :error_exit
)
if not exist "%BACKEND_DIR%\.env" (
    echo  [ERROR] No se encontro backend\.env
    goto :error_exit
)

echo        [OK] Estructura verificada
echo.

:: ============================================================================
:: PASO 2: Detectar IP principal automaticamente
:: ============================================================================
echo  [2/5] Detectando IP principal de red...

set "SELECTED_IP="

:: Usar PowerShell para obtener la IP principal (la que tiene gateway, excluyendo virtuales)
for /f "delims=" %%i in ('powershell -Command "$ip = Get-NetIPConfiguration | Where-Object { $_.IPv4DefaultGateway -ne $null -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1 -ExpandProperty IPv4Address | Select-Object -ExpandProperty IPAddress; if ($ip) { $ip } else { (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.*' -and $_.IPAddress -notlike '192.168.56.*' -and $_.IPAddress -notlike '172.16.*' -and $_.IPAddress -notlike '172.17.*' } | Select-Object -First 1).IPAddress }"') do (
    set "SELECTED_IP=%%i"
)

:: Si PowerShell falla, usar metodo alternativo
if "!SELECTED_IP!"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set "IP_TEMP=%%a"
        set "IP_TEMP=!IP_TEMP: =!"
        :: Priorizar IPs 192.168.x.x (excepto 192.168.56.x de VirtualBox)
        echo !IP_TEMP! | findstr /b "192.168." >nul
        if !errorlevel! EQU 0 (
            echo !IP_TEMP! | findstr /b "192.168.56." >nul
            if !errorlevel! NEQ 0 (
                if "!SELECTED_IP!"=="" set "SELECTED_IP=!IP_TEMP!"
            )
        )
    )
)

:: Si aun no hay IP, tomar la primera disponible (no localhost)
if "!SELECTED_IP!"=="" (
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set "IP_TEMP=%%a"
        set "IP_TEMP=!IP_TEMP: =!"
        if not "!IP_TEMP!"=="127.0.0.1" (
            if "!SELECTED_IP!"=="" set "SELECTED_IP=!IP_TEMP!"
        )
    )
)

if "!SELECTED_IP!"=="" (
    echo  [ERROR] No se pudo detectar la IP de red
    goto :error_exit
)

echo        [OK] IP principal detectada: !SELECTED_IP!
echo.

:: ============================================================================
:: PASO 3: Actualizar archivos .env con PowerShell
:: ============================================================================
echo  [3/5] Actualizando configuracion...

:: Actualizar backend\.env
powershell -Command "$content = Get-Content '%BACKEND_DIR%\.env' -Raw; $content = $content -replace 'BACKEND_URL=http://[^/\r\n]+', 'BACKEND_URL=http://%SELECTED_IP%:%BACKEND_PORT%'; $content = $content -replace 'FIRMA_PERU_API_URL=http://[^/\r\n]+/validador/api', 'FIRMA_PERU_API_URL=http://%SELECTED_IP%:%VALIDADOR_PORT%/validador/api'; $content = $content -replace 'FIRMA_PERU_BACKEND_BASE_URL=http://[^/\r\n]+/api/firma', 'FIRMA_PERU_BACKEND_BASE_URL=http://%SELECTED_IP%:%BACKEND_PORT%/api/firma'; Set-Content '%BACKEND_DIR%\.env' $content -NoNewline"
if !errorlevel! EQU 0 (
    echo        [OK] backend\.env
) else (
    echo        [WARN] backend\.env
)

:: Actualizar backend\.env.production si existe
if exist "%BACKEND_DIR%\.env.production" (
    powershell -Command "$content = Get-Content '%BACKEND_DIR%\.env.production' -Raw; $content = $content -replace 'FIRMA_PERU_API_URL=http://[^/\r\n]+/validador/api', 'FIRMA_PERU_API_URL=http://%SELECTED_IP%:%VALIDADOR_PORT%/validador/api'; $content = $content -replace 'FIRMA_PERU_BACKEND_BASE_URL=http[s]?://[^/\r\n]+/api/firma', 'FIRMA_PERU_BACKEND_BASE_URL=http://%SELECTED_IP%:%BACKEND_PORT%/api/firma'; $content = $content -replace 'FRONTEND_URL=http[s]?://[^\r\n]+', 'FRONTEND_URL=http://localhost:%FRONTEND_PORT%,http://%SELECTED_IP%:%FRONTEND_PORT%'; Set-Content '%BACKEND_DIR%\.env.production' $content -NoNewline"
    if !errorlevel! EQU 0 (
        echo        [OK] backend\.env.production
    ) else (
        echo        [WARN] backend\.env.production
    )
)

:: Actualizar frontend\.env.production si existe
if exist "%FRONTEND_DIR%\.env.production" (
    powershell -Command "$content = Get-Content '%FRONTEND_DIR%\.env.production' -Raw; $content = $content -replace 'NEXT_PUBLIC_API_URL=http://[^/\r\n]+/api', 'NEXT_PUBLIC_API_URL=http://%SELECTED_IP%:%BACKEND_PORT%/api'; Set-Content '%FRONTEND_DIR%\.env.production' $content -NoNewline"
    if !errorlevel! EQU 0 (
        echo        [OK] frontend\.env.production
    ) else (
        echo        [WARN] frontend\.env.production
    )
)

echo.
echo        URLs configuradas:
echo        - Backend:  http://!SELECTED_IP!:!BACKEND_PORT!
echo        - Frontend: http://!SELECTED_IP!:!FRONTEND_PORT!
echo        - Firma:    http://!SELECTED_IP!:!VALIDADOR_PORT!/validador/api
echo.

:: ============================================================================
:: PASO 4: Verificar dependencias
:: ============================================================================
echo  [4/5] Verificando dependencias...

if not exist "%BACKEND_DIR%\node_modules" (
    echo        Instalando backend...
    cd /d "%BACKEND_DIR%" && call npm install
    cd /d "%ROOT_DIR%"
)
if not exist "%FRONTEND_DIR%\node_modules" (
    echo        Instalando frontend...
    cd /d "%FRONTEND_DIR%" && call npm install
    cd /d "%ROOT_DIR%"
)

echo        [OK] Dependencias listas
echo.

:: ============================================================================
:: PASO 5: Iniciar servicios
:: ============================================================================
echo  [5/5] Iniciando servicios...

:: Liberar puertos
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%BACKEND_PORT% " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":%FRONTEND_PORT% " ^| findstr "LISTENING"') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Iniciar Backend
start "SAD-Backend" cmd /k "cd /d %BACKEND_DIR% && color 0B && title Backend %SELECTED_IP%:%BACKEND_PORT% && npm run start"
echo        [OK] Backend iniciando en puerto %BACKEND_PORT%
timeout /t 4 /nobreak >nul

:: Iniciar Frontend  
start "SAD-Frontend" cmd /k "cd /d %FRONTEND_DIR% && color 0E && title Frontend %SELECTED_IP%:%FRONTEND_PORT% && npm run start"
echo        [OK] Frontend iniciando en puerto %FRONTEND_PORT%

echo.
echo  ========================================================================
echo                       SISTEMA INICIADO
echo  ========================================================================
echo.
echo   Backend:   http://!SELECTED_IP!:!BACKEND_PORT!/api
echo   Frontend:  http://!SELECTED_IP!:!FRONTEND_PORT!
echo   Firma:     http://!SELECTED_IP!:!VALIDADOR_PORT!/validador/api
echo.
echo   [TIP] Cierra las ventanas Backend/Frontend para detener
echo   [TIP] Si cambia la IP, ejecuta este script de nuevo
echo.
echo  ========================================================================
echo.
pause
goto :eof

:error_exit
echo.
echo  [ERROR] El sistema no pudo iniciarse
echo.
pause
exit /b 1
