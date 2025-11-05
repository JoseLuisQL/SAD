# Guía Completa de Despliegue en Producción - Sistema SAD
## Despliegue Profesional con cPanel 130.0.1 (SIN acceso SSH - Solo UI)

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#1-requisitos-previos)
2. [Preparar Repositorio Git Remoto](#2-preparar-repositorio-git-remoto)
3. [Configurar Git Version Control en cPanel](#3-configurar-git-version-control-en-cpanel)
4. [Configurar Base de Datos MySQL](#4-configurar-base-de-datos-mysql)
5. [Configurar Variables de Entorno](#5-configurar-variables-de-entorno)
6. [Compilar y Desplegar Backend](#6-compilar-y-desplegar-backend)
7. [Compilar y Desplegar Frontend](#7-compilar-y-desplegar-frontend)
8. [Configurar Archivos .htaccess](#8-configurar-archivos-htaccess)
9. [Aplicar Migraciones de Base de Datos](#9-aplicar-migraciones-de-base-de-datos)
10. [Iniciar Aplicaciones](#10-iniciar-aplicaciones)
11. [Verificación del Sistema](#11-verificación-del-sistema)
12. [Actualización con Git (UI)](#12-actualización-con-git-ui)
13. [Troubleshooting](#13-troubleshooting)
14. [Checklist Final](#14-checklist-final)

---

## 1. Requisitos Previos

### 1.1 Información del Sistema (Ya Configurado)

Según las capturas, ya tienes configurado:

✅ **Backend App**:
- URL: `api.archivos.risvirgendecocharcas.gob.pe`
- Ruta: `/home/dchincheros/apps/sad/backend`
- Estado: Started (v20.19.4)
- Modo: production

✅ **Frontend App**:
- URL: `archivos.risvirgendecocharcas.gob.pe`
- Ruta: `/home/dchincheros/apps/sad/frontend`
- Estado: Started (v20.19.4)
- Modo: production

### 1.2 Herramientas Disponibles en cPanel

✅ Git™ Version Control (para clonar repositorio)  
✅ File Manager (para editar archivos)  
✅ Setup Node.js App (para gestionar aplicaciones)  
✅ MySQL® Databases (para crear BD)  
✅ phpMyAdmin (para gestionar BD)  
✅ Terminal (NO disponible - usaremos solo UI)

### 1.3 Lo que Necesitas

📝 Credenciales de GitHub/GitLab (para repositorio Git)  
📝 Credenciales de Firma Perú (producción)  
📝 Acceso a tu máquina local con Git instalado

---

## 2. Preparar Repositorio Git Remoto

### 2.1 Inicializar Git en tu Máquina Local (Windows)

```powershell
# Abrir PowerShell en C:\Proyectos\SAD
cd C:\Proyectos\SAD

# Verificar si Git está inicializado
git status
```

Si ves "fatal: not a git repository", inicializar:

```powershell
git init
```

### 2.2 Crear .gitignore (Importante)

**Abrir el archivo `.gitignore` que ya tienes** y asegurarte de que incluya:

```gitignore
# Node modules
node_modules/
**/node_modules/

# Environment variables (NO subir archivos .env con credenciales)
.env
.env.local
.env.production
backend/.env
frontend/.env.local

# Build outputs (archivos grandes)
backend/dist/
frontend/.next/
frontend/out/

# Logs
*.log
logs/
backend/logs/
frontend/logs/

# Uploads (archivos de usuario - no subir al repo)
backend/uploads/
backend/temp/
backend/backups/

# Prisma
backend/prisma/migrations/*/applied_

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
```

### 2.3 Crear Repositorio en GitHub

1. **Ir a GitHub**: https://github.com
2. **Iniciar sesión** con tu cuenta
3. **Click en "New repository"** (botón verde)
4. Configurar:
   - **Repository name**: `sad-sistema` (o el nombre que prefieras)
   - **Description**: `Sistema Integrado de Archivos Digitales - DISA CHINCHEROS`
   - **Visibility**: **Private** (recomendado para código de producción)
   - **NO** marcar "Initialize this repository with a README"
5. **Click en "Create repository"**

### 2.4 Subir Código al Repositorio

GitHub te mostrará instrucciones. En PowerShell:

```powershell
cd C:\Proyectos\SAD

# Agregar todos los archivos
git add .

# Crear primer commit
git commit -m "Configuración inicial del Sistema SAD para producción"

# Agregar remote (reemplazar con tu URL)
git remote add origin https://github.com/TU_USUARIO/sad-sistema.git

# Cambiar a rama main (si estás en master)
git branch -M main

# Subir código
git push -u origin main
```

Si te pide credenciales:
- **Username**: Tu usuario de GitHub
- **Password**: **Personal Access Token** (NO la contraseña normal)

#### Crear Personal Access Token:

1. GitHub → **Settings** (tu perfil)
2. **Developer settings** (abajo a la izquierda)
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. **Note**: `cPanel SAD Deployment`
6. **Expiration**: `90 days` (o lo que prefieras)
7. **Select scopes**: Marcar `repo` (acceso completo a repositorios)
8. **Generate token**
9. **¡COPIAR EL TOKEN!** (solo se muestra una vez)
10. Usar este token como "password" cuando Git lo pida

### 2.5 Verificar que se Subió Correctamente

Ir a GitHub → Tu repositorio → Deberías ver todos los archivos.

---

## 3. Configurar Git Version Control en cPanel

### 3.1 Crear Repositorio Git en cPanel

1. **Ir a cPanel → Git™ Version Control**
2. **Click en "Create"** (botón azul arriba a la derecha)

#### Configuración del Repositorio:

**Clone a Repository:**

- **Clone URL**: `https://github.com/TU_USUARIO/sad-sistema.git`
- **Repository Path**: `/home/dchincheros/repositories/sad-sistema`
- **Repository Name**: `sad-sistema`

**Click en "Create"**

### 3.2 Proporcionar Credenciales de Git

Si el repositorio es privado, cPanel pedirá credenciales:

1. **Username**: Tu usuario de GitHub
2. **Password**: El Personal Access Token que generaste

cPanel clonará el repositorio. Esto puede tardar 1-2 minutos.

### 3.3 Verificar que se Clonó Correctamente

1. En **Git™ Version Control**, deberías ver el repositorio `sad-sistema`
2. **Click en "Manage"** (ícono de carpeta)
3. Verifica que muestre:
   - **Branch**: `main`
   - **Last Updated**: Fecha reciente
   - **Files**: Lista de archivos del repositorio

### 3.4 Copiar Archivos del Repositorio a las Aplicaciones

Ahora necesitamos copiar los archivos del repositorio clonado a las rutas de las aplicaciones Node.js.

**Usando File Manager:**

1. **cPanel → File Manager**
2. **Navegar a**: `/home/dchincheros/repositories/sad-sistema`
3. **Seleccionar la carpeta `backend`**
4. **Click derecho → Copy**
5. **Navegar a**: `/home/dchincheros/apps/sad/`
6. **Click en "Copy file(s)"**
7. **Ruta de destino**: `/home/dchincheros/apps/sad/backend`
8. **Marcar**: "Overwrite file(s)" (si existe)
9. **Click "Copy File(s)"**

**Repetir para frontend:**

1. **Navegar a**: `/home/dchincheros/repositories/sad-sistema`
2. **Seleccionar carpeta `frontend`**
3. **Click derecho → Copy**
4. **Copiar a**: `/home/dchincheros/apps/sad/frontend`
5. **Overwrite file(s)**: Marcar
6. **Copy File(s)**

---

## 4. Configurar Base de Datos MySQL

### 4.1 Crear Base de Datos

1. **cPanel → MySQL® Databases**
2. **Sección "Create New Database"**
3. **New Database**: `archivo_digital_disa`
4. **Click "Create Database"**
5. cPanel agregará un prefijo automáticamente: `dchincheros_archivo_digital_disa`
6. **Anotar el nombre completo**: `dchincheros_archivo_digital_disa`

### 4.2 Crear Usuario de MySQL

1. **Desplazarse a "MySQL Users" → "Add New User"**
2. **Username**: `sad_user`
3. **Password**: Click en **"Password Generator"**
4. **Generar contraseña fuerte** (copiarla y guardarla de forma segura)
5. **¡IMPORTANTE!** Copiar la contraseña antes de continuar
6. **Click "Create User"**
7. **Anotar el nombre completo**: `dchincheros_sad_user`

### 4.3 Asignar Privilegios

1. **Desplazarse a "Add User To Database"**
2. **User**: Seleccionar `dchincheros_sad_user`
3. **Database**: Seleccionar `dchincheros_archivo_digital_disa`
4. **Click "Add"**
5. En la página de privilegios:
   - **Marcar "ALL PRIVILEGES"** (checkbox arriba)
   - **Click "Make Changes"**

### 4.4 Construir URL de Conexión

Formato:
```
mysql://dchincheros_sad_user:TU_CONTRASEÑA_GENERADA@localhost:3306/dchincheros_archivo_digital_disa
```

**Ejemplo:**
```
mysql://dchincheros_sad_user:P4ssw0rd_S3gur4!xYz@localhost:3306/dchincheros_archivo_digital_disa
```

**¡GUARDAR ESTA URL!** La necesitarás en el siguiente paso.

---

## 5. Configurar Variables de Entorno

### 5.1 Generar Secretos para JWT

Necesitamos generar valores aleatorios seguros para:
- `JWT_SECRET`
- `FIRMA_PERU_ONE_TIME_TOKEN_SECRET`

**Opción A: Usar generador online** (recomendado):
1. Ir a: https://www.random.org/passwords/
2. Configurar:
   - **Length**: 64
   - **Quantity**: 2
   - **Characters**: Incluir letras, números y símbolos
3. **Generate Passwords**
4. Copiar ambos valores generados

**Opción B: Desde PowerShell (Windows):**

```powershell
# Generar secreto 1 (JWT_SECRET)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generar secreto 2 (FIRMA_PERU_ONE_TIME_TOKEN_SECRET)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### 5.2 Configurar Variables de Entorno del Backend

1. **cPanel → Setup Node.js App**
2. **Buscar**: `api.archivos.risvirgendecocharcas.gob.pe`
3. **Click en el ícono de lápiz** (Edit)
4. **Desplazarse a "Environment variables"**
5. **Agregar cada variable** (click en "+" para agregar nueva):

**IMPORTANTE**: Obtener los puertos asignados primero:
- En la lista de aplicaciones, anotar el puerto de cada app
- Generalmente están en el rango 49152-65535

**Variables a agregar** (una por una):

```
NODE_ENV = production
PORT = [PUERTO_ASIGNADO_BACKEND] (ej: 49152)
DATABASE_URL = mysql://dchincheros_sad_user:TU_CONTRASEÑA_REAL@localhost:3306/dchincheros_archivo_digital_disa
JWT_SECRET = [SECRETO_GENERADO_64_CARACTERES]
JWT_EXPIRES_IN = 15m
JWT_REFRESH_EXPIRES_IN = 7d
FIRMA_PERU_API_URL = http://130.0.15.X:8080/validador/api
FIRMA_PERU_CREDENTIAL = [TU_CREDENTIAL_FIRMA_PERU_PRODUCCION]
FIRMA_PERU_CLIENT_ID = [TU_CLIENT_ID_PRODUCCION]
FIRMA_PERU_CLIENT_SECRET = [TU_CLIENT_SECRET_PRODUCCION]
FIRMA_PERU_TOKEN_URL = https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL = https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT = 48596
FIRMA_PERU_BACKEND_BASE_URL = https://archivos.risvirgendecocharcas.gob.pe/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET = [OTRO_SECRETO_GENERADO_64_CARACTERES]
NODE_OPTIONS = --max_old_space_size=512
```

6. **Click "Save"** al finalizar

### 5.3 Crear Archivo .env en Backend (Adicional)

**Usando File Manager:**

1. **cPanel → File Manager**
2. **Navegar a**: `/home/dchincheros/apps/sad/backend`
3. **Click en "+ File"** (arriba a la izquierda)
4. **New File Name**: `.env`
5. **Create New File**
6. **Seleccionar el archivo `.env`** creado
7. **Click derecho → Edit** (o botón "Edit" arriba)
8. **Pegar el siguiente contenido** (ajustar con tus valores reales):

```bash
NODE_ENV=production
PORT=49152
DATABASE_URL=mysql://dchincheros_sad_user:TU_CONTRASEÑA_REAL@localhost:3306/dchincheros_archivo_digital_disa
JWT_SECRET=TU_SECRETO_GENERADO_64_CARACTERES
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FIRMA_PERU_API_URL=http://130.0.15.X:8080/validador/api
FIRMA_PERU_CREDENTIAL=TU_CREDENTIAL_FIRMA_PERU
FIRMA_PERU_CLIENT_ID=TU_CLIENT_ID
FIRMA_PERU_CLIENT_SECRET=TU_CLIENT_SECRET
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596
FIRMA_PERU_BACKEND_BASE_URL=https://archivos.risvirgendecocharcas.gob.pe/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=TU_OTRO_SECRETO_GENERADO
NODE_OPTIONS=--max_old_space_size=512
```

9. **Click "Save Changes"** (arriba a la derecha)
10. **Close** (cerrar editor)

### 5.4 Configurar Variables de Entorno del Frontend

1. **cPanel → Setup Node.js App**
2. **Buscar**: `archivos.risvirgendecocharcas.gob.pe`
3. **Click en el ícono de lápiz** (Edit)
4. **Agregar variables**:

```
NODE_ENV = production
PORT = [PUERTO_ASIGNADO_FRONTEND] (ej: 49153)
NEXT_PUBLIC_API_URL = https://archivos.risvirgendecocharcas.gob.pe/api
NODE_OPTIONS = --max_old_space_size=512
```

5. **Click "Save"**

### 5.5 Crear .env.production en Frontend

**Usando File Manager:**

1. **Navegar a**: `/home/dchincheros/apps/sad/frontend`
2. **Crear archivo**: `.env.production`
3. **Editar** y agregar:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://archivos.risvirgendecocharcas.gob.pe/api
```

4. **Save Changes**

---

## 6. Compilar y Desplegar Backend

### 6.1 Instalar Dependencias del Backend

1. **cPanel → Setup Node.js App**
2. **Buscar app**: `api.archivos.risvirgendecocharcas.gob.pe`
3. **Click en "Stop App"** (detener primero)
4. **Esperar a que el estado cambie a "stopped"**
5. **Scroll hasta "Detected configuration files"**
6. **Click en "Run NPM Install"** (botón azul)
7. **Esperar** (puede tardar 2-5 minutos)
8. Verás un log de instalación. Debe terminar sin errores.

### 6.2 Generar Prisma Client

**Usando Terminal de Node.js App:**

1. En la misma página de la app backend
2. **Scroll hasta abajo** → verás una consola/terminal web pequeña
3. **Ejecutar comando**:

```bash
npx prisma generate
```

4. **Enter** y esperar. Debe mostrar:
   ```
   ✔ Generated Prisma Client
   ```

**Si NO hay terminal disponible**, crear script temporal:

**File Manager**:
1. Navegar a `/home/dchincheros/apps/sad/backend`
2. Crear archivo: `generate-prisma.js`
3. Contenido:

```javascript
const { exec } = require('child_process');

console.log('Generando Prisma Client...');

exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
  console.log('Prisma Client generado exitosamente');
});
```

4. En Node.js App → Terminal web, ejecutar:
```bash
node generate-prisma.js
```

5. Eliminar el archivo después: `rm generate-prisma.js`

### 6.3 Compilar Backend

En la terminal web de la app backend:

```bash
npm run build
```

**Esperar 1-3 minutos**. Debe compilar TypeScript a JavaScript.

### 6.4 Verificar Compilación

**File Manager**:
1. Navegar a `/home/dchincheros/apps/sad/backend`
2. Verificar que existe carpeta `dist/`
3. Dentro de `dist/` debe haber `server.js` y otros archivos `.js`

**Si no se compiló correctamente:**

Revisar `package.json` del backend para asegurar que tiene:

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

---

## 7. Compilar y Desplegar Frontend

### 7.1 Modificar next.config.ts

**IMPORTANTE**: Next.js necesita `output: 'standalone'` para funcionar en cPanel.

**File Manager**:
1. Navegar a `/home/dchincheros/apps/sad/frontend`
2. Abrir `next.config.ts`
3. **Verificar** que tenga esta configuración:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // ← IMPORTANTE
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

4. **Guardar** si hiciste cambios

### 7.2 Instalar Dependencias del Frontend

1. **cPanel → Setup Node.js App**
2. **App**: `archivos.risvirgendecocharcas.gob.pe`
3. **Stop App**
4. **Run NPM Install**
5. Esperar (puede tardar 3-7 minutos - Next.js tiene muchas dependencias)

### 7.3 Compilar Frontend

En la terminal web de la app frontend:

```bash
npm run build
```

**Esperar 3-5 minutos**. Next.js compilará todo el proyecto.

Si todo va bien, verás:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
...
```

### 7.4 Copiar Archivos Estáticos (CRÍTICO)

Next.js standalone necesita que copies manualmente los archivos estáticos.

**File Manager**:

1. Navegar a `/home/dchincheros/apps/sad/frontend`

2. **Copiar carpeta `public`**:
   - Seleccionar carpeta `public`
   - Click derecho → Copy
   - Pegar en: `/home/dchincheros/apps/sad/frontend/.next/standalone/`
   - Overwrite si existe

3. **Copiar carpeta `static`**:
   - Navegar a `/home/dchincheros/apps/sad/frontend/.next`
   - Seleccionar carpeta `static`
   - Click derecho → Copy
   - Pegar en: `/home/dchincheros/apps/sad/frontend/.next/standalone/.next/`
   - Overwrite si existe

### 7.5 Verificar Estructura

En File Manager, verificar:

```
/home/dchincheros/apps/sad/frontend/
├── .next/
│   ├── standalone/
│   │   ├── server.js          ← Archivo principal
│   │   ├── public/            ← Copiado
│   │   ├── .next/
│   │   │   └── static/        ← Copiado
│   │   └── node_modules/
│   └── static/
├── public/
└── package.json
```

---

## 8. Configurar Archivos .htaccess

### 8.1 Obtener Puertos Asignados

En **Setup Node.js App**, anotar los puertos:

- **Backend**: Buscar en configuración de `api.archivos...` (ej: 49152)
- **Frontend**: Buscar en configuración de `archivos...` (ej: 49153)

### 8.2 Crear .htaccess para Backend (API)

**File Manager**:

1. Navegar al **document root del subdominio API**:
   - Generalmente: `/home/dchincheros/public_html/api`
   - O verificar en cPanel → Dominios → buscar `api.archivos...` → ver document root

2. **Crear archivo**: `.htaccess`

3. **Editar** y pegar (reemplazar `49152` con tu puerto real):

```apache
# .htaccess para Backend (API)
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Forzar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Proxy hacia aplicación Node.js backend
    # REEMPLAZAR 49152 CON TU PUERTO REAL
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
    
    # CORS
    Header set Access-Control-Allow-Origin "https://archivos.risvirgendecocharcas.gob.pe"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"
</IfModule>

# Disable directory listing
Options -Indexes
```

4. **Save Changes**

### 8.3 Crear .htaccess para Frontend

**File Manager**:

1. Navegar al **document root del dominio principal**:
   - Generalmente: `/home/dchincheros/public_html`

2. **Si ya existe .htaccess**, hacer backup primero:
   - Seleccionar `.htaccess`
   - Click derecho → Copy
   - Renombrar copia a `.htaccess.backup`

3. **Editar .htaccess** (o crear si no existe)

4. **Reemplazar TODO el contenido** con (ajustar puerto `49153`):

```apache
# .htaccess para Frontend
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Forzar HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Proxy hacia aplicación Node.js frontend
    # REEMPLAZAR 49153 CON TU PUERTO REAL
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ http://localhost:49153/$1 [P,L]
</IfModule>

<IfModule mod_proxy.c>
    ProxyPreserveHost On
    ProxyRequests Off
    
    ProxyPass / http://localhost:49153/
    ProxyPassReverse / http://localhost:49153/
</IfModule>

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>

Options -Indexes
```

5. **Save Changes**

---

## 9. Aplicar Migraciones de Base de Datos

### 9.1 Ejecutar Migraciones con Prisma

En la **terminal web del backend** (Setup Node.js App):

```bash
npx prisma migrate deploy
```

**Esperar 10-30 segundos**. Deberías ver:

```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": MySQL database

8 migrations found in prisma/migrations

Applying migration `20xxxxxx_init`
Applying migration `20xxxxxx_add_documents`
...

The following migrations have been applied:

migrations/
  └─ 20xxxxxx_init/
  └─ 20xxxxxx_add_documents/
  ...
```

### 9.2 Verificar Migraciones en phpMyAdmin

1. **cPanel → phpMyAdmin**
2. **Seleccionar BD**: `dchincheros_archivo_digital_disa` (en panel izquierdo)
3. **Ver lista de tablas**. Deberías ver:
   - `_prisma_migrations`
   - `roles`
   - `users`
   - `documents`
   - `document_types`
   - `offices`
   - `archivadores`
   - `signatures`
   - `audit_logs`
   - etc. (total ~15 tablas)

### 9.3 (Opcional) Crear Usuario Admin Inicial

Si tienes un script de seed configurado:

```bash
npm run prisma:seed
```

**O crear usuario manualmente en phpMyAdmin:**

1. phpMyAdmin → BD `dchincheros_archivo_digital_disa`
2. **Click en tabla `roles`**
3. **Verificar que existe rol "admin"**. Si no, crear uno.
4. **Click en tabla `users`**
5. **Click "Insert"**
6. Agregar usuario admin (usa generador de hash bcrypt para password)

---

## 10. Iniciar Aplicaciones

### 10.1 Iniciar Backend

1. **cPanel → Setup Node.js App**
2. **Buscar**: `api.archivos.risvirgendecocharcas.gob.pe`
3. **Verificar**:
   - Application Startup File: `dist/server.js`
   - Application Mode: `Production`
4. **Click en "Start App"** (botón play ▶)
5. **Esperar 5-10 segundos**
6. **Estado debe cambiar a**: **"started"** (con punto verde)

**Si falla:**
- Click en "Open logs" para ver errores
- Verificar que `dist/server.js` existe
- Verificar variables de entorno configuradas

### 10.2 Iniciar Frontend

1. **Buscar**: `archivos.risvirgendecocharcas.gob.pe`
2. **Verificar**:
   - Application Startup File: `.next/standalone/server.js`
   - Application Mode: `Production`
3. **Click en "Start App"**
4. **Esperar 5-10 segundos**
5. **Estado**: **"started"** (verde)

**Si falla:**
- Verificar que `.next/standalone/server.js` existe
- Verificar que copiaste `public/` y `static/`
- Ver logs

---

## 11. Verificación del Sistema

### 11.1 Verificar Backend (API)

**Desde navegador:**

1. Abrir: https://api.archivos.risvirgendecocharcas.gob.pe/api/health

**Debe retornar JSON**:
```json
{
  "status": "OK",
  "timestamp": "2025-11-05T..."
}
```

**Si aparece error 404 o 502:**
- Verificar que app backend está "started"
- Verificar .htaccess del subdominio API tiene puerto correcto
- Verificar logs en Setup Node.js App

### 11.2 Verificar Frontend

**Desde navegador:**

1. Abrir: https://archivos.risvirgendecocharcas.gob.pe/

**Debe cargar**:
- Página de login del sistema SAD
- Sin errores en consola del navegador (F12)

**Si aparece página en blanco:**
- F12 → Console → Ver errores
- Verificar que `NEXT_PUBLIC_API_URL` esté configurado
- Verificar .htaccess del dominio principal

### 11.3 Probar Conectividad Frontend-Backend

1. Abrir: https://archivos.risvirgendecocharcas.gob.pe/login
2. **F12** → **Network** tab
3. Intentar login con credenciales de prueba
4. Verificar que aparecen requests a `/api/...`
5. Deben retornar respuestas (200, 401, etc.) NO errores de red

### 11.4 Verificar SSL

Ambos dominios deben mostrar **candado verde** en el navegador:
- ✅ https://archivos.risvirgendecocharcas.gob.pe
- ✅ https://api.archivos.risvirgendecocharcas.gob.pe

**Si hay advertencia SSL:**
- cPanel → SSL/TLS Status
- Buscar dominio y subdominio
- Click "Run AutoSSL" si no tienen certificado

---

## 12. Actualización con Git (UI)

### 12.1 Proceso de Actualización desde tu Máquina Local

**Cuando tengas cambios en el código:**

#### Paso 1: En tu Windows (PowerShell)

```powershell
cd C:\Proyectos\SAD

# Ver cambios
git status

# Agregar cambios
git add .

# Commit
git commit -m "Descripción de cambios realizados"

# Push al repositorio remoto
git push origin main
```

### 12.2 Actualizar en cPanel con Git UI

#### Paso 2: En cPanel

1. **cPanel → Git™ Version Control**
2. **Buscar repositorio**: `sad-sistema`
3. **Click en "Manage"** (ícono de carpeta)
4. **Click en "Pull or Deploy"** (botón arriba)
5. **Seleccionar branch**: `main`
6. **Click "Update from Remote"**
7. **Esperar** - cPanel descargará los últimos cambios

### 12.3 Copiar Archivos Actualizados

**File Manager:**

1. **Copiar backend actualizado**:
   - Origen: `/home/dchincheros/repositories/sad-sistema/backend`
   - Destino: `/home/dchincheros/apps/sad/backend`
   - Seleccionar carpeta → Copy → Overwrite

2. **Copiar frontend actualizado**:
   - Origen: `/home/dchincheros/repositories/sad-sistema/frontend`
   - Destino: `/home/dchincheros/apps/sad/frontend`
   - Overwrite

### 12.4 Re-compilar y Reiniciar

**Backend:**
1. Setup Node.js App → backend
2. Stop App
3. Run NPM Install (si cambiaron dependencias)
4. Terminal web: `npm run build`
5. Si hay nuevas migraciones: `npx prisma migrate deploy`
6. Start App

**Frontend:**
1. Setup Node.js App → frontend
2. Stop App
3. Run NPM Install (si cambiaron dependencias)
4. Terminal web: `npm run build`
5. Copiar `public/` y `static/` (File Manager)
6. Start App

---

## 13. Troubleshooting

### 13.1 Error: "Application failed to start"

**Solución:**

1. Setup Node.js App → Click en "Open logs"
2. Leer el error específico

**Errores comunes:**

**Error de conexión a BD:**
```
Error: Can't connect to MySQL server
```
- Verificar `DATABASE_URL` en variables de entorno
- Probar conexión en phpMyAdmin

**Archivo no encontrado:**
```
Cannot find module './dist/server.js'
```
- File Manager → Verificar que `dist/server.js` existe
- Re-compilar: `npm run build`

**Puerto en uso:**
```
Error: listen EADDRINUSE
```
- Detener la app y volver a iniciar
- Si persiste, contactar soporte de hosting

### 13.2 Error 404 en todas las rutas

**Causa**: .htaccess no funciona o mod_proxy deshabilitado

**Solución:**

1. Verificar que .htaccess existe:
   - File Manager → `/home/dchincheros/public_html/.htaccess`
   - File Manager → `/home/dchincheros/public_html/api/.htaccess`

2. Verificar puerto correcto en .htaccess

3. Si mod_proxy no está habilitado:
   - **Contactar soporte del hosting**
   - Solicitar habilitar: `mod_proxy`, `mod_proxy_http`, `mod_rewrite`

### 13.3 Frontend carga pero no conecta con backend

**Síntoma**: Errores CORS en consola del navegador

**Solución:**

1. Verificar `NEXT_PUBLIC_API_URL` en frontend:
   - Debe ser: `https://archivos.risvirgendecocharcas.gob.pe/api`
   - NO debe ser: `http://localhost:...`

2. Verificar CORS en .htaccess del backend:
```apache
Header set Access-Control-Allow-Origin "https://archivos.risvirgendecocharcas.gob.pe"
```

3. Re-compilar frontend después de cambiar variables:
```bash
npm run build
```

### 13.4 Cambios de código no se reflejan

**Solución:**

1. Verificar que hiciste `git push` desde tu máquina local
2. En cPanel Git → "Update from Remote"
3. **Copiar archivos** del repositorio a apps/sad/
4. **Re-compilar**:
   - Backend: `npm run build`
   - Frontend: `npm run build` + copiar static
5. **Reiniciar aplicaciones**

### 13.5 Error al ejecutar migraciones

```
Error: P1001: Can't reach database server
```

**Solución:**

1. Verificar `DATABASE_URL` en `.env`
2. Probar conexión en phpMyAdmin
3. Verificar que usuario tiene privilegios

### 13.6 No puedo ver terminal web en Node.js App

**Solución:**

Algunos hostings no proveen terminal web. Alternativa:

**Crear scripts auxiliares en File Manager:**

**Script: `run-command.js`**
```javascript
const { exec } = require('child_process');

const command = process.argv[2] || 'echo "No command provided"';

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error.message);
    return;
  }
  if (stderr) console.error('stderr:', stderr);
  console.log(stdout);
});
```

**Usar con Node.js App:**
1. Guardar en `/home/dchincheros/apps/sad/backend/run-command.js`
2. Desde cPanel, crear archivo temporal con comando a ejecutar
3. Ejemplo de uso limitado

**Si no funciona**: Solicitar acceso SSH al proveedor.

---

## 14. Checklist Final

### Pre-Despliegue
- [ ] Código subido a GitHub/GitLab
- [ ] Personal Access Token generado
- [ ] Credenciales de Firma Perú obtenidas
- [ ] .gitignore configurado (no subir .env)

### Git Version Control
- [ ] Repositorio clonado en cPanel Git™ Version Control
- [ ] Branch `main` visible
- [ ] Archivos copiados a `/apps/sad/backend` y `/apps/sad/frontend`

### Base de Datos
- [ ] BD `dchincheros_archivo_digital_disa` creada
- [ ] Usuario `dchincheros_sad_user` creado con contraseña fuerte
- [ ] Privilegios asignados (ALL)
- [ ] URL de conexión documentada

### Variables de Entorno
- [ ] Secretos JWT generados (64 caracteres)
- [ ] Variables configuradas en Node.js App (backend)
- [ ] Variables configuradas en Node.js App (frontend)
- [ ] Archivo `.env` creado en backend
- [ ] Archivo `.env.production` creado en frontend

### Backend
- [ ] NPM Install ejecutado
- [ ] `npx prisma generate` ejecutado
- [ ] `npm run build` ejecutado exitosamente
- [ ] `dist/server.js` existe
- [ ] Migraciones aplicadas: `npx prisma migrate deploy`
- [ ] 8 migraciones aplicadas correctamente
- [ ] Tablas visibles en phpMyAdmin

### Frontend
- [ ] `next.config.ts` tiene `output: 'standalone'`
- [ ] NPM Install ejecutado
- [ ] `npm run build` ejecutado exitosamente
- [ ] `.next/standalone/server.js` existe
- [ ] Carpeta `public/` copiada a `standalone/`
- [ ] Carpeta `static/` copiada a `standalone/.next/`

### Proxy (.htaccess)
- [ ] .htaccess creado en `/public_html/api/`
- [ ] Puerto correcto en .htaccess del backend
- [ ] .htaccess creado/editado en `/public_html/`
- [ ] Puerto correcto en .htaccess del frontend

### Aplicaciones
- [ ] Backend iniciado (estado "started" verde)
- [ ] Frontend iniciado (estado "started" verde)
- [ ] Sin errores en logs de backend
- [ ] Sin errores en logs de frontend

### Verificación
- [ ] Backend accesible: https://api.archivos.../api/health
- [ ] Frontend carga: https://archivos...
- [ ] Página de login visible
- [ ] Certificados SSL activos (candado verde)
- [ ] Login funciona (conexión frontend-backend OK)

---

## 🎉 Sistema Desplegado Exitosamente

### URLs Finales:
- **Frontend**: https://archivos.risvirgendecocharcas.gob.pe/
- **API**: https://api.archivos.risvirgendecocharcas.gob.pe/api/
- **Health Check**: https://api.archivos.risvirgendecocharcas.gob.pe/api/health

### Flujo de Actualización:
1. Hacer cambios localmente (Windows)
2. `git push origin main`
3. cPanel Git™ → "Update from Remote"
4. Copiar archivos actualizados (File Manager)
5. Re-compilar (backend y frontend)
6. Reiniciar aplicaciones

---

**Guía creada para**: cPanel 130.0.1 (sin acceso SSH)  
**Fecha**: 5 de Noviembre, 2025  
**Versión**: 2.0.0 (UI Only)  
**Sistema**: SAD - DISA CHINCHEROS
