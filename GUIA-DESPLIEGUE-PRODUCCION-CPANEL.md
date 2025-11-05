# Guía Completa de Despliegue en Producción - Sistema SAD
## Despliegue Profesional con cPanel 130.0.1 y Git Version Control

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Configuración Inicial de cPanel](#2-configuración-inicial-de-cpanel)
3. [Configuración de Git Version Control](#3-configuración-de-git-version-control)
4. [Configuración de Base de Datos MySQL](#4-configuración-de-base-de-datos-mysql)
5. [Despliegue del Backend (API)](#5-despliegue-del-backend-api)
6. [Despliegue del Frontend](#6-despliegue-del-frontend)
7. [Configuración de Proxy con .htaccess](#7-configuración-de-proxy-con-htaccess)
8. [Iniciar Aplicaciones en Producción](#8-iniciar-aplicaciones-en-producción)
9. [Verificación del Sistema](#9-verificación-del-sistema)
10. [Actualización y Mantenimiento](#10-actualización-y-mantenimiento)
11. [Troubleshooting](#11-troubleshooting)
12. [Checklist de Verificación](#12-checklist-de-verificación)

---

## 1. Requisitos Previos

### 1.1 Información del Sistema
- **Dominio Frontend**: `archivos.risvirgendecocharcas.gob.pe`
- **Subdominio API**: `api.archivos.risvirgendecocharcas.gob.pe` (a crear)
- **cPanel Versión**: 130.0.1
- **Node.js Requerido**: >= 18.0.0
- **MySQL**: 8.0 o superior
- **Sistema Operativo**: Linux (alojamiento compartido)

### 1.2 Accesos Necesarios
✅ Acceso a cPanel (usuario y contraseña)  
✅ Acceso SSH (solicitar al proveedor si no está habilitado)  
✅ Acceso al repositorio Git del proyecto  
✅ Credenciales de Firma Perú (producción)  
✅ Certificado SSL activo (Let's Encrypt o comercial)

### 1.3 Verificar Disponibilidad de Herramientas

**Conectar por SSH y verificar:**

```bash
# Verificar versión de Node.js
node --version
# Debe ser >= 18.0.0

# Verificar npm
npm --version
# Debe ser >= 9.0.0

# Verificar Git
git --version

# Verificar MySQL
mysql --version
```

---

## 2. Configuración Inicial de cPanel

### 2.1 Crear Subdominio para el API

1. **Acceder a cPanel**
   - Ir a `https://tudominio.com:2083`
   - Iniciar sesión con credenciales

2. **Crear Subdominio**
   - Navegar a: **Dominios** → **Subdominios**
   - Click en **Crear un Subdominio**
   - **Subdominio**: `api`
   - **Dominio**: `archivos.risvirgendecocharcas.gob.pe`
   - **Document Root**: `/home/USUARIO/public_html/api` (cPanel lo sugiere automáticamente)
   - Click en **Crear**

3. **Verificar DNS**
   - El DNS se configura automáticamente
   - Esperar 5-10 minutos para propagación
   - Verificar: `ping api.archivos.risvirgendecocharcas.gob.pe`

### 2.2 Habilitar SSL para Subdominio

1. **Acceder a SSL/TLS Status**
   - Ir a **Seguridad** → **SSL/TLS Status**
   - Buscar `api.archivos.risvirgendecocharcas.gob.pe`
   - Si no tiene certificado, click en **Run AutoSSL**
   - Esperar 2-5 minutos hasta que aparezca el candado verde

### 2.3 Crear Aplicaciones Node.js

#### 2.3.1 Aplicación Backend (sad-backend)

1. Navegar a: **Software** → **Setup Node.js App**
2. Click en **Create Application**
3. Configurar:
   - **Node.js version**: `18.x` (seleccionar la más reciente disponible)
   - **Application mode**: `Production`
   - **Application root**: `apps/sad/backend`
   - **Application URL**: Seleccionar `api.archivos.risvirgendecocharcas.gob.pe`
   - **Application startup file**: `dist/server.js`
   - **Passenger log file**: dejar vacío (por defecto)
4. Click en **Create**
5. **¡IMPORTANTE!** Anotar el **puerto asignado** (ej: 49152)

#### 2.3.2 Aplicación Frontend (sad-frontend)

1. En **Setup Node.js App**, click en **Create Application**
2. Configurar:
   - **Node.js version**: `18.x` (misma versión que backend)
   - **Application mode**: `Production`
   - **Application root**: `apps/sad/frontend`
   - **Application URL**: Seleccionar `archivos.risvirgendecocharcas.gob.pe`
   - **Application startup file**: `.next/standalone/server.js`
   - **Passenger log file**: dejar vacío
3. Click en **Create**
4. **¡IMPORTANTE!** Anotar el **puerto asignado** (ej: 49153)

**Documentar los puertos asignados:**

```
Backend Port: _______ (ej: 49152)
Frontend Port: _______ (ej: 49153)
```

> **Nota**: Estos puertos son necesarios para configurar los archivos .htaccess más adelante.

---

## 3. Configuración de Git Version Control

### 3.1 Preparar Repositorio Git

#### Opción A: Repositorio Remoto (GitHub, GitLab, Bitbucket)

1. **Crear repositorio remoto** (si no existe)
   - Ir a GitHub/GitLab/Bitbucket
   - Crear nuevo repositorio: `sad-sistema`
   - No inicializar con README (ya tienes código)

2. **Configurar repositorio local** (en tu máquina Windows)

```powershell
cd C:\Proyectos\SAD

# Inicializar Git (si no está inicializado)
git init

# Agregar archivos al staging
git add .

# Crear commit inicial
git commit -m "Configuración inicial del sistema SAD para producción"

# Agregar remote
git remote add origin https://github.com/TU_USUARIO/sad-sistema.git

# Subir código
git push -u origin main
```

3. **Crear archivo .gitignore** (si no existe)

```powershell
# Crear .gitignore en la raíz del proyecto
New-Item -ItemType File -Path .gitignore -Force
```

Contenido recomendado para `.gitignore`:

```gitignore
# Node modules
node_modules/
**/node_modules/

# Logs
logs
*.log
npm-debug.log*
*.log.*
backend/logs/
frontend/logs/

# Environment variables
.env
.env.local
.env.development
.env.production.local

# Build outputs
backend/dist/
frontend/.next/
frontend/out/

# Prisma
backend/prisma/migrations/*/applied_

# Uploads (archivos grandes)
backend/uploads/
backend/temp/
backend/backups/

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
```

4. **Commit y push del .gitignore**

```powershell
git add .gitignore
git commit -m "Agregar .gitignore para archivos sensibles"
git push origin main
```

#### Opción B: Repositorio Privado del Servidor

Si prefieres mantener el repositorio únicamente en el servidor:

```bash
# Conectar por SSH al servidor
ssh usuario@tudominio.com

# Crear directorio para repositorio bare
mkdir -p ~/git/sad.git
cd ~/git/sad.git
git init --bare

# Desde tu máquina local (Windows)
cd C:\Proyectos\SAD
git remote add production ssh://usuario@tudominio.com/~/git/sad.git
git push production main
```

### 3.2 Configurar Git en el Servidor (vía SSH)

1. **Conectar por SSH**

```bash
ssh usuario@archivos.risvirgendecocharcas.gob.pe
# O según te proporcione tu proveedor:
ssh usuario@tudominio.com -p 2222
```

2. **Configurar Git globalmente**

```bash
# Configurar nombre y email
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@dominio.com"

# Verificar configuración
git config --list
```

3. **Configurar Credenciales (si usas repositorio remoto privado)**

**Opción A: HTTPS con Personal Access Token (GitHub)**

```bash
# Configurar credential helper
git config --global credential.helper store

# En el primer git clone, ingresará usuario y token
# Ejemplo:
# Username: tu-usuario
# Password: ghp_XXXXXXXXXXXXXXXXXXX (Personal Access Token)
```

**Opción B: SSH Keys (Recomendado para repositorios privados)**

```bash
# Generar clave SSH
ssh-keygen -t ed25519 -C "tu-email@dominio.com"
# Presionar Enter 3 veces (sin passphrase para automatización)

# Mostrar clave pública
cat ~/.ssh/id_ed25519.pub

# Copiar la salida y agregarla en:
# GitHub: Settings → SSH and GPG keys → New SSH key
# GitLab: Settings → SSH Keys
# Bitbucket: Settings → SSH keys
```

### 3.3 Clonar Repositorio en el Servidor

```bash
# Navegar al directorio de aplicaciones
cd ~
mkdir -p apps/sad
cd apps/sad

# Clonar repositorio
# Opción A: HTTPS
git clone https://github.com/TU_USUARIO/sad-sistema.git .

# Opción B: SSH
git clone git@github.com:TU_USUARIO/sad-sistema.git .

# Verificar que se clonó correctamente
ls -la
# Deberías ver: backend/ frontend/ docs/ cpanel-configs/ etc.
```

### 3.4 Crear Script de Actualización Automática con Git

Crear un script para facilitar futuras actualizaciones:

```bash
# Crear script de actualización
nano ~/apps/sad/update-production.sh
```

Contenido del script:

```bash
#!/bin/bash

# Script de Actualización de Producción - Sistema SAD
# Autor: DISA CHINCHEROS
# Fecha: 2025-11-05

echo "=========================================="
echo "  ACTUALIZACIÓN DE PRODUCCIÓN - SAD"
echo "=========================================="
echo ""

# Definir directorios
APP_DIR=~/apps/sad
BACKEND_DIR=$APP_DIR/backend
FRONTEND_DIR=$APP_DIR/frontend

# Función para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para manejar errores
handle_error() {
    log "ERROR: $1"
    exit 1
}

# Cambiar al directorio de la aplicación
cd $APP_DIR || handle_error "No se pudo acceder a $APP_DIR"

log "Iniciando actualización..."

# 1. Hacer backup de la configuración actual
log "Creando backup de configuración..."
cp $BACKEND_DIR/.env $BACKEND_DIR/.env.backup.$(date +%Y%m%d_%H%M%S) || true
cp $FRONTEND_DIR/.env.production $FRONTEND_DIR/.env.production.backup.$(date +%Y%m%d_%H%M%S) || true

# 2. Detener aplicaciones
log "Deteniendo aplicaciones..."
cd $BACKEND_DIR && npm stop || true
cd $FRONTEND_DIR && npm stop || true

# 3. Obtener última versión del código
log "Obteniendo última versión desde Git..."
git fetch origin
git reset --hard origin/main || handle_error "Error al actualizar desde Git"

# 4. Actualizar Backend
log "Actualizando Backend..."
cd $BACKEND_DIR || handle_error "No se pudo acceder a $BACKEND_DIR"

log "Instalando dependencias del backend..."
npm ci || handle_error "Error al instalar dependencias del backend"

log "Generando Prisma Client..."
npx prisma generate || handle_error "Error al generar Prisma Client"

log "Compilando backend..."
npm run build || handle_error "Error al compilar backend"

log "Aplicando migraciones de base de datos..."
npx prisma migrate deploy || handle_error "Error al aplicar migraciones"

# 5. Actualizar Frontend
log "Actualizando Frontend..."
cd $FRONTEND_DIR || handle_error "No se pudo acceder a $FRONTEND_DIR"

log "Instalando dependencias del frontend..."
npm ci || handle_error "Error al instalar dependencias del frontend"

log "Compilando frontend..."
npm run build || handle_error "Error al compilar frontend"

# 6. Reiniciar aplicaciones vía cPanel
log "Reiniciando aplicaciones..."
log "Por favor, reiniciar manualmente en cPanel → Setup Node.js App"
log "O configurar PM2 para reinicio automático"

# 7. Limpiar archivos temporales
log "Limpiando archivos temporales..."
cd $APP_DIR
find $BACKEND_DIR/temp -type f -mtime +7 -delete 2>/dev/null || true
find $BACKEND_DIR/logs -name "*.log" -type f -mtime +30 -delete 2>/dev/null || true

log "=========================================="
log "Actualización completada exitosamente"
log "=========================================="
log ""
log "SIGUIENTE PASO:"
log "1. Ir a cPanel → Setup Node.js App"
log "2. Reiniciar 'sad-backend'"
log "3. Reiniciar 'sad-frontend'"
log "4. Verificar: https://archivos.risvirgendecocharcas.gob.pe"
log ""
```

Dar permisos de ejecución:

```bash
chmod +x ~/apps/sad/update-production.sh
```

---

## 4. Configuración de Base de Datos MySQL

### 4.1 Crear Base de Datos y Usuario

1. **Acceder a cPanel → Bases de datos MySQL**

2. **Crear Nueva Base de Datos**
   - **Nombre de la base de datos**: `archivo_digital_disa`
   - Click en **Crear base de datos**
   - cPanel agregará un prefijo automáticamente (ej: `usuario_archivo_digital_disa`)
   - **Anotar el nombre completo de la base de datos**

3. **Crear Usuario de MySQL**
   - Desplazarse a **Usuarios de MySQL**
   - **Nombre de usuario**: `sad_user`
   - **Contraseña**: Usar **Generador de contraseñas** (generar contraseña fuerte)
   - **¡IMPORTANTE!** Copiar y guardar la contraseña generada de forma segura
   - Click en **Crear usuario**
   - **Anotar el nombre completo del usuario** (ej: `usuario_sad_user`)

4. **Asignar Privilegios**
   - Desplazarse a **Agregar usuario a la base de datos**
   - **Usuario**: Seleccionar `usuario_sad_user`
   - **Base de datos**: Seleccionar `usuario_archivo_digital_disa`
   - Click en **Agregar**
   - En la página de privilegios, seleccionar **TODOS LOS PRIVILEGIOS**
   - Click en **Realizar cambios**

### 4.2 Construir URL de Conexión

El formato de la URL de conexión es:

```
mysql://USUARIO_COMPLETO:CONTRASEÑA@localhost:3306/NOMBRE_BD_COMPLETO
```

**Ejemplo:**

```
mysql://usuario_sad_user:P4ssw0rd_S3gur4!@localhost:3306/usuario_archivo_digital_disa
```

**¡IMPORTANTE!** Guardar esta URL, se necesitará para configurar las variables de entorno.

### 4.3 Verificar Conexión

```bash
# Conectar vía SSH
ssh usuario@archivos.risvirgendecocharcas.gob.pe

# Probar conexión a MySQL
mysql -u usuario_sad_user -p
# Ingresar contraseña cuando se solicite

# Una vez conectado:
USE usuario_archivo_digital_disa;
SHOW TABLES;
# Debería estar vacío (sin tablas aún)

# Salir
EXIT;
```

---

## 5. Despliegue del Backend (API)

### 5.1 Instalar Dependencias del Backend

```bash
# Conectar por SSH
ssh usuario@archivos.risvirgendecocharcas.gob.pe

# Navegar al backend
cd ~/apps/sad/backend

# Instalar dependencias (usar npm ci para producción)
npm ci

# Verificar que se instaló correctamente
ls -la node_modules/
```

### 5.2 Configurar Variables de Entorno

```bash
# Crear archivo .env de producción
nano ~/apps/sad/backend/.env
```

Contenido del archivo `.env` (ajustar con tus valores reales):

```bash
# Configuración de Producción - Backend
NODE_ENV=production
PORT=49152

# ====================================
# BASE DE DATOS MySQL
# ====================================
# Formato: mysql://USUARIO:CONTRASEÑA@localhost:3306/NOMBRE_BD
DATABASE_URL=mysql://usuario_sad_user:TU_CONTRASEÑA_REAL@localhost:3306/usuario_archivo_digital_disa

# ====================================
# JWT Configuration
# ====================================
# GENERAR SECRETOS FUERTES con: openssl rand -base64 64
JWT_SECRET=GENERAR_SECRETO_ALEATORIO_64_CARACTERES_BASE64
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ====================================
# Firma Perú - Servicio de Validación
# ====================================
FIRMA_PERU_API_URL=http://130.0.15.X:8080/validador/api
FIRMA_PERU_CREDENTIAL=TU_CREDENTIAL_FIRMA_PERU_PRODUCCION

# ====================================
# Firma Perú - OAuth Credentials
# ====================================
FIRMA_PERU_CLIENT_ID=TU_CLIENT_ID_PRODUCCION
FIRMA_PERU_CLIENT_SECRET=TU_CLIENT_SECRET_PRODUCCION
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token

# ====================================
# Firma Perú - Componente Web
# ====================================
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596

# ====================================
# URL Base del Backend (Dominio Público)
# ====================================
FIRMA_PERU_BACKEND_BASE_URL=https://archivos.risvirgendecocharcas.gob.pe/api/firma

# ====================================
# Token de Un Solo Uso
# ====================================
# GENERAR SECRETO FUERTE con: openssl rand -base64 64
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=GENERAR_OTRO_SECRETO_ALEATORIO_64_CARACTERES

# ====================================
# Optimización de Memoria (Opcional)
# ====================================
NODE_OPTIONS=--max_old_space_size=512
```

**Generar secretos fuertes:**

```bash
# Generar JWT_SECRET
openssl rand -base64 64

# Generar FIRMA_PERU_ONE_TIME_TOKEN_SECRET
openssl rand -base64 64
```

Copiar los valores generados y reemplazar en el archivo `.env`.

**Guardar el archivo**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 5.3 Generar Prisma Client

```bash
cd ~/apps/sad/backend
npx prisma generate
```

### 5.4 Compilar Backend

```bash
cd ~/apps/sad/backend
npm run build

# Verificar que se generó correctamente
ls -la dist/
# Debe existir dist/server.js y otros archivos compilados
```

### 5.5 Aplicar Migraciones de Base de Datos

```bash
cd ~/apps/sad/backend
npx prisma migrate deploy

# Deberías ver:
# 8 migrations found in prisma/migrations
# Applying migration `...`
# ...
# The following migrations have been applied:
# migrations/
#   └─ 20xxxxxx_init
#   └─ 20xxxxxx_...
#   └─ ...
```

### 5.6 (Opcional) Crear Usuario Admin Inicial

Si necesitas crear un usuario administrador inicial:

```bash
cd ~/apps/sad/backend

# Ejecutar seed (si está configurado)
npm run prisma:seed

# O crear usuario manualmente con script
# (Revisar si existe un script en backend/scripts/)
```

### 5.7 Configurar Variables de Entorno en cPanel

Además del archivo `.env`, configurar las variables en cPanel:

1. **Ir a cPanel → Setup Node.js App**
2. **Seleccionar aplicación `sad-backend`**
3. **Click en el lápiz (editar)**
4. **Desplazarse a "Environment variables"**
5. **Agregar cada variable** una por una:

```
NODE_ENV = production
PORT = 49152
DATABASE_URL = mysql://usuario_sad_user:TU_CONTRASEÑA@localhost:3306/usuario_archivo_digital_disa
JWT_SECRET = TU_JWT_SECRET_GENERADO
JWT_EXPIRES_IN = 15m
JWT_REFRESH_EXPIRES_IN = 7d
FIRMA_PERU_API_URL = http://130.0.15.X:8080/validador/api
FIRMA_PERU_CREDENTIAL = TU_CREDENTIAL
FIRMA_PERU_CLIENT_ID = TU_CLIENT_ID
FIRMA_PERU_CLIENT_SECRET = TU_CLIENT_SECRET
FIRMA_PERU_TOKEN_URL = https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL = https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT = 48596
FIRMA_PERU_BACKEND_BASE_URL = https://archivos.risvirgendecocharcas.gob.pe/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET = TU_ONE_TIME_TOKEN_SECRET
NODE_OPTIONS = --max_old_space_size=512
```

6. **Click en "Save"** después de agregar todas las variables

---

## 6. Despliegue del Frontend

### 6.1 Configurar Variables de Entorno del Frontend

```bash
# Crear archivo .env.production
nano ~/apps/sad/frontend/.env.production
```

Contenido del archivo:

```bash
# Configuración de Producción - Frontend
NODE_ENV=production

# URL del API Backend
# Esta debe apuntar al endpoint público del backend
NEXT_PUBLIC_API_URL=https://archivos.risvirgendecocharcas.gob.pe/api
```

**Guardar el archivo**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 6.2 Modificar next.config.ts para Producción

```bash
nano ~/apps/sad/frontend/next.config.ts
```

Asegurarse de que tenga la configuración de `output: 'standalone'`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // IMPORTANTE para despliegue en cPanel
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'archivos.risvirgendecocharcas.gob.pe',
        pathname: '/api/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
```

**Guardar el archivo**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 6.3 Instalar Dependencias del Frontend

```bash
cd ~/apps/sad/frontend
npm ci

# Verificar instalación
ls -la node_modules/
```

### 6.4 Compilar Frontend

```bash
cd ~/apps/sad/frontend
npm run build

# Esto puede tardar 3-5 minutos
# Deberías ver progreso de compilación de Next.js
```

**Verificar que se generó correctamente:**

```bash
ls -la .next/standalone/
# Debe existir .next/standalone/server.js
```

**Copiar archivos estáticos:**

```bash
cd ~/apps/sad/frontend

# Next.js standalone requiere copiar public y static
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

### 6.5 Configurar Variables de Entorno en cPanel

1. **Ir a cPanel → Setup Node.js App**
2. **Seleccionar aplicación `sad-frontend`**
3. **Click en el lápiz (editar)**
4. **Agregar variables de entorno:**

```
NODE_ENV = production
PORT = 49153
NEXT_PUBLIC_API_URL = https://archivos.risvirgendecocharcas.gob.pe/api
NODE_OPTIONS = --max_old_space_size=512
```

5. **Click en "Save"**

---

## 7. Configuración de Proxy con .htaccess

### 7.1 Configurar .htaccess para Backend (API Subdominio)

```bash
# Identificar el document root del subdominio API
# Generalmente es: ~/public_html/api

# Crear archivo .htaccess
nano ~/public_html/api/.htaccess
```

Contenido del archivo (reemplazar `49152` con el puerto real de tu backend):

```apache
# .htaccess para Backend (API)
# Ubicación: ~/public_html/api/.htaccess

<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Forzar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Proxy hacia aplicación Node.js backend
    # REEMPLAZAR 49152 CON EL PUERTO ASIGNADO POR CPANEL
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:49152/$1 [P,L]
</IfModule>

<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Habilitar proxy
    ProxyPass / http://localhost:49152/
    ProxyPassReverse / http://localhost:49152/
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # CORS para permitir frontend
    Header set Access-Control-Allow-Origin "https://archivos.risvirgendecocharcas.gob.pe"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>

# Disable directory listing
Options -Indexes

# Custom error pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
</apache>
```

**Guardar el archivo**: `Ctrl + O`, `Enter`, `Ctrl + X`

### 7.2 Configurar .htaccess para Frontend (Dominio Principal)

```bash
# El document root del dominio principal es: ~/public_html

# Si ya existe un .htaccess, hacer backup primero
cp ~/public_html/.htaccess ~/public_html/.htaccess.backup

# Editar .htaccess
nano ~/public_html/.htaccess
```

Contenido del archivo (reemplazar `49153` con el puerto real de tu frontend):

```apache
# .htaccess para Frontend
# Ubicación: ~/public_html/.htaccess

<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Forzar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Proxy hacia aplicación Node.js frontend
    # REEMPLAZAR 49153 CON EL PUERTO ASIGNADO POR CPANEL
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:49153/$1 [P,L]
</IfModule>

<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Proxy para frontend
    ProxyPass / http://localhost:49153/
    ProxyPassReverse / http://localhost:49153/
</IfModule>

# Cache control para assets estáticos
<IfModule mod_expires.c>
    ExpiresActive On
    
    # Imágenes
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType image/x-icon "access plus 1 year"
    
    # CSS y JavaScript
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    
    # Fonts
    ExpiresByType font/woff2 "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
</IfModule>

# Compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Cache para assets de Next.js
    <FilesMatch "\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot|ico)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
    
    <FilesMatch "\.(css|js)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>
</IfModule>

# Disable directory listing
Options -Indexes

# Custom error pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
</apache>
```

**Guardar el archivo**: `Ctrl + O`, `Enter`, `Ctrl + X`

---

## 8. Iniciar Aplicaciones en Producción

### 8.1 Iniciar Backend

#### Método 1: Usando cPanel Node.js App Manager (Recomendado)

1. **Ir a cPanel → Setup Node.js App**
2. **Buscar aplicación `sad-backend`**
3. **Click en "Restart"** (botón circular con flecha)
4. **Verificar estado**: Debe mostrar "Running" en verde
5. **Revisar logs** (click en "Open logs"): No debe haber errores

#### Método 2: Usando SSH y node directamente

```bash
cd ~/apps/sad/backend

# Ejecutar en segundo plano con nohup
nohup node dist/server.js > logs/output.log 2>&1 &

# Anotar el PID
echo $! > backend.pid

# Verificar que está corriendo
ps aux | grep "node dist/server.js"
```

### 8.2 Iniciar Frontend

#### Método 1: Usando cPanel Node.js App Manager (Recomendado)

1. **Ir a cPanel → Setup Node.js App**
2. **Buscar aplicación `sad-frontend`**
3. **Click en "Restart"**
4. **Verificar estado**: Debe mostrar "Running" en verde
5. **Revisar logs**: No debe haber errores

#### Método 2: Usando SSH

```bash
cd ~/apps/sad/frontend/.next/standalone

# Ejecutar en segundo plano
nohup node server.js > ../../logs/output.log 2>&1 &

# Anotar el PID
echo $! > ../../frontend.pid

# Verificar que está corriendo
ps aux | grep "node server.js"
```

### 8.3 Configurar Directorios de Logs

```bash
# Crear directorios de logs
mkdir -p ~/apps/sad/backend/logs
mkdir -p ~/apps/sad/frontend/logs

# Dar permisos
chmod 755 ~/apps/sad/backend/logs
chmod 755 ~/apps/sad/frontend/logs
```

---

## 9. Verificación del Sistema

### 9.1 Verificar Backend (API)

```bash
# Conectar por SSH
ssh usuario@archivos.risvirgendecocharcas.gob.pe

# Test 1: Verificar localmente
curl http://localhost:49152/api/health
# Debe retornar: {"status":"OK","timestamp":"..."}

# Test 2: Verificar públicamente
curl https://api.archivos.risvirgendecocharcas.gob.pe/api/health
# Debe retornar: {"status":"OK","timestamp":"..."}

# Test 3: Verificar desde navegador
# Abrir: https://api.archivos.risvirgendecocharcas.gob.pe/api/health
```

### 9.2 Verificar Frontend

```bash
# Test 1: Verificar localmente
curl http://localhost:49153/
# Debe retornar HTML

# Test 2: Verificar públicamente
curl https://archivos.risvirgendecocharcas.gob.pe/
# Debe retornar HTML de Next.js

# Test 3: Verificar desde navegador
# Abrir: https://archivos.risvirgendecocharcas.gob.pe/
# Debe cargar la página de login
```

### 9.3 Verificar Conexión Frontend-Backend

```bash
# Desde el navegador:
# 1. Abrir https://archivos.risvirgendecocharcas.gob.pe/login
# 2. Abrir Developer Tools (F12) → Network
# 3. Intentar login con usuario de prueba
# 4. Verificar que las peticiones API se hacen correctamente
```

### 9.4 Verificar Certificados SSL

```bash
# Verificar SSL del dominio principal
openssl s_client -connect archivos.risvirgendecocharcas.gob.pe:443 -servername archivos.risvirgendecocharcas.gob.pe

# Verificar SSL del subdominio API
openssl s_client -connect api.archivos.risvirgendecocharcas.gob.pe:443 -servername api.archivos.risvirgendecocharcas.gob.pe
```

### 9.5 Verificar Base de Datos

```bash
# Conectar a MySQL
mysql -u usuario_sad_user -p usuario_archivo_digital_disa

# Verificar tablas
SHOW TABLES;
# Debe mostrar: roles, users, documents, etc.

# Verificar datos iniciales
SELECT * FROM roles;
SELECT COUNT(*) FROM users;

# Salir
EXIT;
```

### 9.6 Verificar Logs

```bash
# Ver logs del backend
tail -f ~/apps/sad/backend/logs/output.log

# Ver logs del frontend
tail -f ~/apps/sad/frontend/logs/output.log

# Ver logs de Apache (errores de proxy)
tail -f ~/logs/error_log
```

---

## 10. Actualización y Mantenimiento

### 10.1 Proceso de Actualización con Git

Cuando tengas cambios en el código local:

#### En tu máquina local (Windows):

```powershell
cd C:\Proyectos\SAD

# 1. Hacer commit de cambios
git add .
git commit -m "Descripción de cambios realizados"

# 2. Push a repositorio remoto
git push origin main
```

#### En el servidor (via SSH):

```bash
# Conectar por SSH
ssh usuario@archivos.risvirgendecocharcas.gob.pe

# Ejecutar script de actualización automática
cd ~/apps/sad
./update-production.sh
```

O manualmente:

```bash
cd ~/apps/sad

# 1. Detener aplicaciones (vía cPanel o SSH)
# En cPanel: Stop en cada aplicación

# 2. Obtener últimos cambios
git pull origin main

# 3. Actualizar backend
cd backend
npm ci
npx prisma generate
npm run build
npx prisma migrate deploy

# 4. Actualizar frontend
cd ../frontend
npm ci
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Reiniciar aplicaciones (vía cPanel)
# En cPanel: Restart en cada aplicación
```

### 10.2 Backup Automatizado

#### Crear script de backup de base de datos:

```bash
nano ~/apps/sad/backup-db.sh
```

Contenido:

```bash
#!/bin/bash

# Script de Backup de Base de Datos - Sistema SAD
BACKUP_DIR=~/apps/sad/backend/backups
DB_NAME=usuario_archivo_digital_disa
DB_USER=usuario_sad_user
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE=$BACKUP_DIR/backup_$DATE.sql.gz

# Crear directorio de backups si no existe
mkdir -p $BACKUP_DIR

# Realizar backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME | gzip > $BACKUP_FILE

# Eliminar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: $BACKUP_FILE"
```

Dar permisos:

```bash
chmod +x ~/apps/sad/backup-db.sh
```

#### Configurar Cron Job para Backup Diario:

```bash
crontab -e

# Agregar línea (backup diario a las 2 AM):
0 2 * * * /home/USUARIO/apps/sad/backup-db.sh >> /home/USUARIO/apps/sad/backup.log 2>&1
```

### 10.3 Limpieza de Logs

```bash
# Crear script de limpieza
nano ~/apps/sad/cleanup-logs.sh
```

Contenido:

```bash
#!/bin/bash

# Limpiar logs antiguos (mayores a 30 días)
find ~/apps/sad/backend/logs -name "*.log" -mtime +30 -delete
find ~/apps/sad/frontend/logs -name "*.log" -mtime +30 -delete

# Limpiar archivos temporales (mayores a 7 días)
find ~/apps/sad/backend/temp -type f -mtime +7 -delete

echo "Limpieza completada: $(date)"
```

Dar permisos y configurar cron:

```bash
chmod +x ~/apps/sad/cleanup-logs.sh

crontab -e

# Agregar línea (limpieza semanal, domingos a las 3 AM):
0 3 * * 0 /home/USUARIO/apps/sad/cleanup-logs.sh >> /home/USUARIO/apps/sad/cleanup.log 2>&1
```

---

## 11. Troubleshooting

### 11.1 Backend no inicia

**Síntomas**: Aplicación muestra "Stopped" o error en logs

**Soluciones:**

```bash
# 1. Verificar que dist/server.js existe
ls -la ~/apps/sad/backend/dist/server.js

# Si no existe, compilar:
cd ~/apps/sad/backend
npm run build

# 2. Verificar variables de entorno
cat ~/apps/sad/backend/.env

# 3. Verificar conexión a base de datos
mysql -u usuario_sad_user -p usuario_archivo_digital_disa

# 4. Verificar logs de error
tail -50 ~/apps/sad/backend/logs/output.log

# 5. Probar inicio manual
cd ~/apps/sad/backend
node dist/server.js
# Ver errores directamente

# 6. Verificar puerto no esté en uso
netstat -tuln | grep 49152
```

### 11.2 Frontend no carga

**Síntomas**: Página en blanco o error 502 Bad Gateway

**Soluciones:**

```bash
# 1. Verificar que .next/standalone/server.js existe
ls -la ~/apps/sad/frontend/.next/standalone/server.js

# Si no existe, compilar:
cd ~/apps/sad/frontend
npm run build
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 2. Verificar archivos estáticos copiados
ls -la ~/apps/sad/frontend/.next/standalone/public

# 3. Verificar NEXT_PUBLIC_API_URL
cat ~/apps/sad/frontend/.env.production

# 4. Probar inicio manual
cd ~/apps/sad/frontend/.next/standalone
node server.js

# 5. Verificar puerto
netstat -tuln | grep 49153
```

### 11.3 Error 404 en todas las rutas

**Causa**: .htaccess no está funcionando o proxy no configurado

**Soluciones:**

```bash
# 1. Verificar que .htaccess existe
ls -la ~/public_html/.htaccess
ls -la ~/public_html/api/.htaccess

# 2. Verificar módulos de Apache
# (Contactar soporte para verificar que mod_proxy y mod_rewrite están habilitados)

# 3. Verificar puertos en .htaccess
cat ~/public_html/.htaccess | grep ProxyPass
cat ~/public_html/api/.htaccess | grep ProxyPass

# 4. Verificar logs de Apache
tail -50 ~/logs/error_log
```

### 11.4 Error CORS

**Síntomas**: Frontend no puede conectarse al backend, error CORS en consola

**Soluciones:**

```bash
# 1. Verificar .htaccess del backend tiene headers CORS
nano ~/public_html/api/.htaccess

# Debe tener:
# Header set Access-Control-Allow-Origin "https://archivos.risvirgendecocharcas.gob.pe"

# 2. Verificar NEXT_PUBLIC_API_URL en frontend
cat ~/apps/sad/frontend/.env.production

# Debe ser: NEXT_PUBLIC_API_URL=https://archivos.risvirgendecocharcas.gob.pe/api
```

### 11.5 Error de Base de Datos

**Síntomas**: Error "Can't connect to MySQL server" o "Access denied"

**Soluciones:**

```bash
# 1. Verificar credenciales
cat ~/apps/sad/backend/.env | grep DATABASE_URL

# 2. Probar conexión manual
mysql -u usuario_sad_user -p usuario_archivo_digital_disa

# 3. Verificar que migraciones se aplicaron
cd ~/apps/sad/backend
npx prisma migrate status

# 4. Re-aplicar migraciones si es necesario
npx prisma migrate deploy

# 5. Verificar permisos del usuario
mysql -u root -p
SHOW GRANTS FOR 'usuario_sad_user'@'localhost';
```

### 11.6 Aplicación consume mucha memoria

**Soluciones:**

```bash
# 1. Agregar límite de memoria en variables de entorno
# Ya configurado: NODE_OPTIONS=--max_old_space_size=512

# 2. Verificar procesos
ps aux | grep node
top -u USUARIO

# 3. Reiniciar aplicaciones periódicamente (via cron)
crontab -e

# Reiniciar diariamente a las 4 AM (cuando hay menos tráfico)
0 4 * * * curl -X POST https://CPANEL_URL/restart_app?app=sad-backend
0 4 * * * curl -X POST https://CPANEL_URL/restart_app?app=sad-frontend
```

### 11.7 Git push/pull falla

**Síntomas**: "Permission denied" o "Authentication failed"

**Soluciones:**

```bash
# 1. Verificar configuración de Git
git config --list

# 2. Re-configurar credenciales (si usa HTTPS)
git config --global credential.helper store
git pull
# Ingresar usuario y token

# 3. Verificar SSH keys (si usa SSH)
ssh -T git@github.com

# 4. Re-generar SSH key si es necesario
ssh-keygen -t ed25519 -C "tu-email@dominio.com"
cat ~/.ssh/id_ed25519.pub
# Copiar y agregar en GitHub/GitLab
```

---

## 12. Checklist de Verificación

### Pre-Despliegue

- [ ] Acceso a cPanel verificado
- [ ] Acceso SSH habilitado y verificado
- [ ] Certificado SSL instalado y activo
- [ ] Repositorio Git configurado (remoto o servidor)
- [ ] Credenciales de Firma Perú (producción) obtenidas
- [ ] Node.js >= 18.0.0 disponible en servidor
- [ ] MySQL 8.0 disponible

### Configuración de cPanel

- [ ] Subdominio `api.archivos.risvirgendecocharcas.gob.pe` creado
- [ ] SSL habilitado para subdominio API
- [ ] Aplicación Node.js `sad-backend` creada
- [ ] Aplicación Node.js `sad-frontend` creada
- [ ] Puertos asignados documentados:
  - Backend: ______
  - Frontend: ______

### Git Version Control

- [ ] Repositorio remoto configurado (GitHub/GitLab)
- [ ] Código subido al repositorio (`git push origin main`)
- [ ] .gitignore configurado correctamente
- [ ] Git configurado en el servidor
- [ ] Repositorio clonado en `~/apps/sad/`
- [ ] Script de actualización creado (`update-production.sh`)

### Base de Datos

- [ ] Base de datos `usuario_archivo_digital_disa` creada
- [ ] Usuario `usuario_sad_user` creado con contraseña fuerte
- [ ] Privilegios asignados (ALL PRIVILEGES)
- [ ] Conexión verificada: `mysql -u usuario_sad_user -p`
- [ ] URL de conexión documentada

### Backend

- [ ] Dependencias instaladas: `npm ci`
- [ ] Prisma Client generado: `npx prisma generate`
- [ ] Backend compilado: `npm run build`
- [ ] `dist/server.js` existe
- [ ] Archivo `.env` configurado con valores reales
- [ ] Migraciones aplicadas: `npx prisma migrate deploy`
- [ ] Variables de entorno configuradas en cPanel
- [ ] Backend iniciado (Running en cPanel)
- [ ] Health check exitoso: `curl https://api.archivos.risvirgendecocharcas.gob.pe/api/health`

### Frontend

- [ ] Archivo `.env.production` configurado
- [ ] `next.config.ts` con `output: 'standalone'`
- [ ] Dependencias instaladas: `npm ci`
- [ ] Frontend compilado: `npm run build`
- [ ] `.next/standalone/server.js` existe
- [ ] Archivos estáticos copiados (public y static)
- [ ] Variables de entorno configuradas en cPanel
- [ ] Frontend iniciado (Running en cPanel)
- [ ] Página carga correctamente: `https://archivos.risvirgendecocharcas.gob.pe/`

### Configuración de Proxy

- [ ] `.htaccess` del backend creado en `~/public_html/api/.htaccess`
- [ ] Puerto correcto en .htaccess del backend
- [ ] `.htaccess` del frontend creado en `~/public_html/.htaccess`
- [ ] Puerto correcto en .htaccess del frontend
- [ ] HTTPS forzado en ambos .htaccess
- [ ] Headers de seguridad configurados

### Verificación Final

- [ ] Backend accesible públicamente
- [ ] Frontend accesible públicamente
- [ ] Página de login carga correctamente
- [ ] Login funciona con usuario de prueba
- [ ] Dashboard carga tras login
- [ ] Certificados SSL válidos (sin advertencias)
- [ ] Sin errores en logs de backend
- [ ] Sin errores en logs de frontend
- [ ] Sin errores en logs de Apache
- [ ] Conexión frontend-backend funciona
- [ ] Funcionalidad de carga de documentos funciona
- [ ] Firma Perú integración funciona (si aplica)

### Post-Despliegue

- [ ] Script de backup configurado (`backup-db.sh`)
- [ ] Cron job de backup configurado (diario)
- [ ] Script de limpieza configurado (`cleanup-logs.sh`)
- [ ] Cron job de limpieza configurado (semanal)
- [ ] Monitoreo de uptime configurado (UptimeRobot, etc.)
- [ ] Documentación de puertos guardada
- [ ] Credenciales guardadas de forma segura
- [ ] Procedimiento de actualización documentado
- [ ] Equipo capacitado en uso del sistema

---

## 🎉 ¡Despliegue Completado!

Si todos los ítems del checklist están marcados, tu sistema SAD está correctamente desplegado en producción con Git Version Control.

### URLs de Acceso

- **Frontend (Usuarios)**: https://archivos.risvirgendecocharcas.gob.pe/
- **API (Backend)**: https://api.archivos.risvirgendecocharcas.gob.pe/api/
- **Health Check**: https://api.archivos.risvirgendecocharcas.gob.pe/api/health

### Próximos Pasos

1. **Monitorear el sistema** durante las primeras 24-48 horas
2. **Capacitar a los usuarios** en el uso del sistema
3. **Configurar alertas** para tiempo de inactividad
4. **Realizar backup manual** inicial para verificar proceso
5. **Documentar cualquier problema** encontrado y su solución

### Contacto de Soporte

**Equipo de Desarrollo**: DISA CHINCHEROS  
**Email de Soporte**: [Agregar email]  
**Teléfono**: [Agregar teléfono]

---

**Guía creada por**: [Tu Nombre]  
**Fecha**: 5 de Noviembre, 2025  
**Versión**: 1.0.0  
**Sistema**: SAD - Sistema Integrado de Archivos Digitales
