# Preparación Local Antes del Despliegue

Esta guía te ayudará a preparar todos los archivos necesarios localmente **antes** de subirlos a cPanel.

## 🎯 Objetivo

Tener listos todos estos archivos para simplemente copiarlos a tu hosting:
- ✅ Backend compilado (`dist/`)
- ✅ Frontend compilado (`.next/`)
- ✅ Esquema SQL de la base de datos
- ✅ Usuario administrador inicial
- ✅ Archivos de configuración

---

## 📋 Paso 1: Verificar Requisitos

```powershell
# Verifica Node.js
node --version
# Debe ser v18 o superior

# Verifica npm
npm --version
# Debe ser v9 o superior
```

---

## 🔧 Paso 2: Preparar Backend

### 2.1 Instalar dependencias

```powershell
cd C:\Proyectos\SAD\backend
npm install
```

### 2.2 Generar cliente de Prisma

```powershell
npm run prisma:generate
```

**✓ Verificar**: Debe aparecer el mensaje "✔ Generated Prisma Client"

### 2.3 Compilar TypeScript

```powershell
npm run build
```

**✓ Verificar**: Se creó la carpeta `backend/dist` con archivos `.js`

### 2.4 Verificar compilación

```powershell
# Listar archivos compilados
dir dist
```

Deberías ver:
- `server.js`
- `app.js`
- Carpetas: `config`, `controllers`, `middlewares`, `routes`, `services`, etc.

---

## 🎨 Paso 3: Preparar Frontend

### 3.1 Instalar dependencias

```powershell
cd C:\Proyectos\SAD\frontend
npm install
```

### 3.2 Compilar Next.js

```powershell
npm run build
```

**Tiempo estimado**: 2-5 minutos

**✓ Verificar**: Deberías ver al final:
```
Route (app)                Size     First Load JS
┌ ○ /                     ...
├ ○ /dashboard           ...
...
○  (Static)  prerendered as static content
```

### 3.3 Verificar build

```powershell
# Verificar carpetas creadas
dir .next

# Verificar standalone
dir .next\standalone
```

Deberías ver:
- `.next/static/` (archivos estáticos)
- `.next/standalone/` (servidor Node.js)
- `.next/standalone/server.js` (punto de entrada)

---

## 🗄️ Paso 4: Preparar Base de Datos

### 4.1 Crear base de datos local temporal

**Opción A: MySQL Workbench**

1. Abre MySQL Workbench
2. Crea una nueva conexión (localhost)
3. Ejecuta:
   ```sql
   CREATE DATABASE sad_produccion_temp;
   ```

**Opción B: HeidiSQL**

1. Abre HeidiSQL
2. Conecta a localhost
3. Click derecho → "Crear nuevo" → "Base de datos"
4. Nombre: `sad_produccion_temp`

### 4.2 Actualizar .env temporal

Crea un archivo `.env.temp` en `backend/`:

```env
DATABASE_URL=mysql://root:tu_password@localhost:3306/sad_produccion_temp
```

### 4.3 Generar SQL desde el schema (Método Recomendado)

**Opción A: Generar SQL directamente** (Recomendado - evita problemas de migraciones)

```powershell
cd C:\Proyectos\SAD\backend

# Generar SQL completo desde schema.prisma
npx prisma db push --skip-generate
```

Si este comando falla, usa el **Método Manual** (Opción B):

**Opción B: Método Manual con MySQL Workbench** (Más confiable)

1. Abre MySQL Workbench
2. Conecta a tu servidor local
3. Ejecuta este comando para crear una base de datos limpia:
   ```sql
   DROP DATABASE IF EXISTS sad_produccion_temp;
   CREATE DATABASE sad_produccion_temp;
   USE sad_produccion_temp;
   ```

4. Ahora ejecuta:
   ```powershell
   cd C:\Proyectos\SAD\backend
   
   # Actualiza el .env.temp con tu contraseña real de MySQL
   # DATABASE_URL=mysql://root:TU_PASSWORD_REAL@localhost:3306/sad_produccion_temp
   
   # Genera la estructura desde el schema.prisma
   npx prisma db push --skip-generate
   ```

**✓ Verificar**: MySQL Workbench → Refrescar → Deberías ver ~20 tablas creadas

### 4.4 Crear usuario administrador inicial

```powershell
# En la carpeta backend
npx ts-node prisma/seed-admin-only.ts
```

**✓ Verificar**: Deberías ver:
```
✓ Usuario administrador creado exitosamente
=============================================
  Username: admin
  Password: Admin123!
  Email: admin@risvirgendecocharcas.gob.pe
=============================================
```

### 4.5 Exportar estructura SQL

**Método Recomendado: MySQL Workbench**

1. En MySQL Workbench → "Server" → "Data Export"
2. Selecciona la base de datos `sad_produccion_temp`
3. Marca "Export to Self-Contained File"
4. Ruta: `C:\Proyectos\SAD\schema-produccion.sql`
5. En "Objects to Export":
   - ✅ Dump Structure Only (sin datos)
6. Click "Start Export"

**Resultado**: Tendrás `schema-produccion.sql` con toda la estructura de tablas

---

**Exportar datos del usuario admin**:

1. En MySQL Workbench → "Server" → "Data Export"
2. Selecciona SOLO las tablas: `roles` y `users`
3. Marca "Dump Data Only" (sin estructura)
4. Ruta: `C:\Proyectos\SAD\admin-data.sql`
5. Click "Start Export"

**Resultado**: Tendrás `admin-data.sql` con solo el usuario administrador inicial

---

**Alternativa rápida si prefieres un solo archivo**:

Exporta estructura + datos juntos:
1. Selecciona `sad_produccion_temp`
2. "Dump Structure and Data"
3. Guarda como: `C:\Proyectos\SAD\database-completa-produccion.sql`

Luego en producción solo importas este archivo completo.

---

## 📦 Paso 5: Organizar Archivos para Despliegue

Crea una carpeta temporal con todo listo para subir:

```powershell
# Crear carpeta de despliegue
mkdir C:\Proyectos\SAD\DEPLOY_PRODUCCION
cd C:\Proyectos\SAD\DEPLOY_PRODUCCION
```

### 5.1 Backend

```powershell
# Crear estructura
mkdir backend
mkdir backend\dist
mkdir backend\prisma
mkdir backend\uploads
mkdir backend\uploads\documents
mkdir backend\uploads\system

# Copiar archivos compilados
xcopy /E /I C:\Proyectos\SAD\backend\dist backend\dist

# Copiar Prisma
copy C:\Proyectos\SAD\backend\prisma\schema.prisma backend\prisma\

# Copiar package.json
copy C:\Proyectos\SAD\backend\package.json backend\
copy C:\Proyectos\SAD\backend\package-lock.json backend\

# Copiar OCR
copy C:\Proyectos\SAD\backend\spa.traineddata backend\
copy C:\Proyectos\SAD\backend\eng.traineddata backend\

# Copiar .env.production
copy C:\Proyectos\SAD\backend\.env.production backend\
```

### 5.2 Frontend

```powershell
# Crear estructura
mkdir frontend
mkdir frontend\.next
mkdir frontend\public

# Copiar build
xcopy /E /I C:\Proyectos\SAD\frontend\.next frontend\.next

# Copiar public
xcopy /E /I C:\Proyectos\SAD\frontend\public frontend\public

# Copiar package.json
copy C:\Proyectos\SAD\frontend\package.json frontend\
copy C:\Proyectos\SAD\frontend\package-lock.json frontend\

# Copiar .env.production
copy C:\Proyectos\SAD\frontend\.env.production frontend\
```

### 5.3 Base de datos

```powershell
# Copiar archivos SQL
copy C:\Proyectos\SAD\schema-produccion.sql .
copy C:\Proyectos\SAD\admin-data.sql .
```

### 5.4 Node Modules (IMPORTANTE)

```powershell
# BACKEND - Comprimir node_modules
cd C:\Proyectos\SAD\backend
powershell Compress-Archive -Path node_modules -DestinationPath ..\DEPLOY_PRODUCCION\backend\node_modules.zip

# FRONTEND - Comprimir node_modules
cd C:\Proyectos\SAD\frontend
powershell Compress-Archive -Path node_modules -DestinationPath ..\DEPLOY_PRODUCCION\frontend\node_modules.zip
```

**⚠️ IMPORTANTE**: Los archivos ZIP pueden ser muy grandes (100-300 MB cada uno). Si tu hosting tiene límite de subida, considera:

**Alternativa 1: Subir por FTP sin comprimir** (tomará mucho tiempo pero es más seguro)

**Alternativa 2: Dividir el ZIP** en partes más pequeñas:
```powershell
# Dividir en partes de 50MB
powershell Compress-Archive -Path node_modules -DestinationPath node_modules-part1.zip -CompressionLevel Optimal
```

### 5.5 Archivos de configuración adicionales

```powershell
# Crear .htaccess
cd C:\Proyectos\SAD\DEPLOY_PRODUCCION
notepad .htaccess
```

Copia este contenido en el `.htaccess`:

```apache
# Backend API - Redirigir /api a la aplicación Node.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirigir todas las peticiones /api/* al backend Node.js
  RewriteCond %{REQUEST_URI} ^/api/(.*)$
  RewriteRule ^api/(.*)$ http://127.0.0.1:PUERTO_BACKEND/api/$1 [P,L]
  
  # Servir archivos estáticos del backend (uploads, etc.)
  RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
  RewriteRule ^uploads/(.*)$ backend/uploads/$1 [L]
  
  # Todo lo demás va al frontend
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:PUERTO_FRONTEND/$1 [P,L]
</IfModule>
```

**⚠️ Nota**: Reemplaza `PUERTO_BACKEND` y `PUERTO_FRONTEND` con los puertos reales que cPanel asigne.

---

## 📁 Paso 6: Verificar Estructura Final

Tu carpeta `DEPLOY_PRODUCCION` debe tener:

```
DEPLOY_PRODUCCION/
├── .htaccess
├── schema-produccion.sql
├── admin-data.sql
├── backend/
│   ├── dist/                    (código compilado)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── uploads/
│   │   ├── documents/
│   │   └── system/
│   ├── spa.traineddata
│   ├── eng.traineddata
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules.zip         (comprimido)
│   └── .env.production
└── frontend/
    ├── .next/                   (build completo)
    ├── public/
    ├── package.json
    ├── package-lock.json
    ├── node_modules.zip         (comprimido)
    └── .env.production
```

---

## ✅ Checklist de Verificación

Antes de subir a cPanel, verifica:

### Backend
- [ ] Carpeta `dist/` existe y tiene archivos `.js`
- [ ] `package.json` y `package-lock.json` presentes
- [ ] `prisma/schema.prisma` presente
- [ ] Archivos OCR presentes (`spa.traineddata`, `eng.traineddata`)
- [ ] `.env.production` con credenciales correctas
- [ ] `node_modules.zip` creado (o carpeta `node_modules` completa)

### Frontend
- [ ] Carpeta `.next/` existe y tiene `standalone/`
- [ ] Carpeta `public/` presente
- [ ] `package.json` y `package-lock.json` presentes
- [ ] `.env.production` con `NEXT_PUBLIC_API_URL` correcto
- [ ] `node_modules.zip` creado (o carpeta `node_modules` completa)

### Base de Datos
- [ ] `schema-produccion.sql` creado (estructura de tablas)
- [ ] `admin-data.sql` creado (usuario administrador)

### Configuración
- [ ] `.htaccess` creado y revisado

---

## 🚀 Siguiente Paso

¡Todo listo! Ahora puedes seguir la guía principal:

👉 **[GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md](./GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md)**

Desde la sección **"2. Configuración de cPanel"** en adelante.

---

## 💡 Consejos

### Tamaño de Archivos

Revisa el tamaño de los archivos antes de subir:

```powershell
# Ver tamaño de carpetas
cd C:\Proyectos\SAD\DEPLOY_PRODUCCION

# Backend
Get-ChildItem -Path backend -Recurse | Measure-Object -Property Length -Sum

# Frontend
Get-ChildItem -Path frontend -Recurse | Measure-Object -Property Length -Sum
```

### Subida por FTP

**Recomendaciones**:
1. Usa **FileZilla** configurado con:
   - Transfer mode: Binary
   - Maximum simultaneous transfers: 2
   - Timeout: 600 seconds

2. Sube en este orden:
   - Primero: Archivos SQL y configuración
   - Segundo: Archivos de backend (dist, prisma, etc.)
   - Tercero: Archivos de frontend (.next, public)
   - Cuarto: node_modules (o los ZIP)

3. **No cierres la conexión** hasta que todo termine

### Verificar Integridad

Después de subir, verifica que:
- El número de archivos coincida
- Los tamaños sean similares
- No haya errores en los logs de FTP

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

**Causa**: No se generó el cliente de Prisma

**Solución**:
```powershell
cd C:\Proyectos\SAD\backend
npm run prisma:generate
```

### Error: "Build failed"

**Causa**: Error de TypeScript o dependencias

**Solución**:
```powershell
# Backend
cd backend
npm run typecheck
# Revisa y corrige errores

# Frontend
cd frontend
npm run lint
# Revisa y corrige errores
```

### Error: "Database connection failed"

**Causa**: Base de datos local no está corriendo

**Solución**:
- Inicia MySQL/MariaDB
- Verifica el usuario y contraseña en `.env.temp`

---

**Tiempo estimado total**: 30-45 minutos  
**Tamaño estimado de archivos**: 500 MB - 1 GB
