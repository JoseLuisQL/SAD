#!/bin/bash
#
# Script de Configuración Inicial para cPanel
# Ejecutar via SSH: bash setup-cpanel.sh
#
# IMPORTANTE: Actualizar las variables al inicio del script antes de ejecutar
#

set -e

# ============================================
# CONFIGURACIÓN - ACTUALIZAR ESTOS VALORES
# ============================================

# Rutas
USUARIO="CAMBIAR_USUARIO_CPANEL"
BASE_PATH="/home/$USUARIO/apps/sad"
BACKEND_PATH="$BASE_PATH/backend"
FRONTEND_PATH="$BASE_PATH/frontend"
LOGS_PATH="$BASE_PATH/logs"

# Puertos (actualizar con los asignados por cPanel)
BACKEND_PORT="49152"
FRONTEND_PORT="49153"

# Base de datos
DB_NAME="archivo_digital_disa"
DB_USER="sad_user"
# DB_PASSWORD se configurará manualmente en cPanel

# ============================================
# SCRIPT - NO MODIFICAR DEBAJO DE ESTA LÍNEA
# ============================================

echo "========================================"
echo "Configuración Inicial de SAD en cPanel"
echo "========================================"
echo ""

# 1. Verificar que estamos en el directorio correcto
if [ ! -d "$BASE_PATH" ]; then
    echo "❌ Error: Directorio $BASE_PATH no existe"
    echo "   Primero clonar el repositorio en esta ubicación"
    exit 1
fi

cd "$BASE_PATH"

# 2. Crear estructura de directorios
echo "📁 Creando estructura de directorios..."
mkdir -p logs/backend logs/frontend
mkdir -p backend/uploads/documents
mkdir -p backend/temp
mkdir -p backend/backups

# 3. Configurar permisos
echo "🔐 Configurando permisos..."
chmod 755 logs logs/backend logs/frontend
chmod 755 backend/uploads backend/uploads/documents
chmod 755 backend/temp backend/backups

# 4. Verificar Node.js
echo "🔍 Verificando Node.js..."
node --version || { echo "❌ Node.js no instalado"; exit 1; }
npm --version || { echo "❌ npm no instalado"; exit 1; }

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  Advertencia: Node.js v$NODE_VERSION < 18. Se recomienda actualizar."
else
    echo "✅ Node.js v$NODE_VERSION OK"
fi

# 5. Backend - Instalar dependencias
echo ""
echo "📦 Instalando dependencias de backend..."
cd "$BACKEND_PATH"
npm ci --production=false

# 6. Backend - Generar cliente Prisma
echo "🔨 Generando cliente Prisma..."
npx prisma generate

# 7. Backend - Compilar TypeScript
echo "🔨 Compilando backend..."
npm run build

# 8. Verificar build de backend
if [ ! -f "dist/server.js" ]; then
    echo "❌ Error: Backend no se compiló correctamente"
    exit 1
fi
echo "✅ Backend compilado"

# 9. Frontend - Instalar dependencias
echo ""
echo "📦 Instalando dependencias de frontend..."
cd "$FRONTEND_PATH"
npm ci --production=false

# 10. Frontend - Compilar
echo "🔨 Compilando frontend..."
npm run build:prod

# 11. Verificar build de frontend
if [ ! -d ".next/standalone" ]; then
    echo "❌ Error: Frontend no se compiló correctamente"
    exit 1
fi
echo "✅ Frontend compilado"

# 12. Copiar archivos de configuración
echo ""
echo "📝 Configurando archivos..."

# Copiar ecosystem.config.js si existe
if [ -f "$BASE_PATH/cpanel-configs/ecosystem.config.js" ]; then
    cp "$BASE_PATH/cpanel-configs/ecosystem.config.js" "$BASE_PATH/"
    # Actualizar rutas en el archivo
    sed -i "s|/home/USUARIO|/home/$USUARIO|g" "$BASE_PATH/ecosystem.config.js"
    sed -i "s|49152|$BACKEND_PORT|g" "$BASE_PATH/ecosystem.config.js"
    sed -i "s|49153|$FRONTEND_PORT|g" "$BASE_PATH/ecosystem.config.js"
    echo "✅ ecosystem.config.js configurado"
fi

# 13. Crear archivo de puertos
echo ""
echo "📋 Documentando configuración..."
cat > "$BASE_PATH/PUERTOS.txt" <<EOF
Configuración de Puertos SAD
============================

Backend Port: $BACKEND_PORT
Frontend Port: $FRONTEND_PORT

Backend URL (local): http://localhost:$BACKEND_PORT
Frontend URL (local): http://localhost:$FRONTEND_PORT

Backend URL (público): https://api.archivos.risvirgendecocharcas.gob.pe
Frontend URL (público): https://archivos.risvirgendecocharcas.gob.pe

Database: $DB_NAME
DB User: $DB_USER

Logs:
  Backend: $LOGS_PATH/backend/
  Frontend: $LOGS_PATH/frontend/
EOF

# 14. Mostrar siguiente pasos
echo ""
echo "========================================"
echo "✅ Configuración inicial completada"
echo "========================================"
echo ""
echo "📋 SIGUIENTES PASOS:"
echo ""
echo "1. Configurar variables de entorno en cPanel:"
echo "   - Ir a: Setup Node.js App > sad-backend > Environment Variables"
echo "   - Configurar: DATABASE_URL, JWT_SECRET, FIRMA_PERU_*, etc."
echo ""
echo "2. Ejecutar migraciones de base de datos:"
echo "   cd $BACKEND_PATH"
echo "   npx prisma migrate deploy"
echo ""
echo "3. (Opcional) Crear datos iniciales:"
echo "   npm run prisma:seed"
echo ""
echo "4. Iniciar aplicaciones:"
echo "   Opción A - PM2:"
echo "     pm2 start $BASE_PATH/ecosystem.config.js"
echo "     pm2 save"
echo "     pm2 startup"
echo ""
echo "   Opción B - cPanel Node.js App Manager:"
echo "     Ir a cPanel > Setup Node.js App"
echo "     Click 'Restart' en cada aplicación"
echo ""
echo "5. Verificar servicios:"
echo "   curl http://localhost:$BACKEND_PORT/api/health"
echo "   curl http://localhost:$FRONTEND_PORT/"
echo ""
echo "6. Configurar .htaccess para proxy público"
echo "   Ver: $BASE_PATH/cpanel-configs/htaccess-*.txt"
echo ""
echo "📄 Documentación completa: $BASE_PATH/GUIA-CONFIGURACION-CPANEL.md"
echo ""
