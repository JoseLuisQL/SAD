# Guía de Despliegue en Producción - Sistema SAD
## cPanel 130.0.1 (Sin acceso SSH)

> **Sistema**: Sistema Integrado de Archivos Digitales  
> **URL Producción**: http://archivos.risvirgendecocharcas.gob.pe  
> **Versión**: 1.0.0  
> **Fecha**: Noviembre 2025

---

## 📋 Tabla de Contenidos

1. [Preparación Local (Tu Computadora)](#1-preparación-local)
2. [Configuración de cPanel](#2-configuración-de-cpanel)
3. [Despliegue del Backend](#3-despliegue-del-backend)
4. [Despliegue del Frontend](#4-despliegue-del-frontend)
5. [Configuración Final y Verificación](#5-configuración-final-y-verificación)
6. [Actualizaciones Futuras](#6-actualizaciones-futuras)
7. [Solución de Problemas](#7-solución-de-problemas)

---

## 1. Preparación Local

### 1.1 Requisitos Previos

- Node.js v18+ instalado
- MySQL Workbench o HeidiSQL
- Cliente FTP (FileZilla recomendado)
- Acceso a cPanel

### 1.2 Construir el Backend

```powershell
# Abrir PowerShell en la carpeta del proyecto
cd C:\Proyectos\SAD\backend

# Instalar dependencias (si no lo has hecho)
npm install

# Generar cliente de Prisma
npm run prisma:generate

# Verificar tipos
npm run typecheck

# Construir para producción
npm run build
```

**Resultado esperado**: Se creará la carpeta `backend/dist` con todo el código compilado.

### 1.3 Construir el Frontend

```powershell
# Abrir PowerShell en la carpeta frontend
cd C:\Proyectos\SAD\frontend

# Instalar dependencias (si no lo has hecho)
npm install

# Construir para producción
npm run build
```

**Resultado esperado**: Se crearán las carpetas:
- `frontend/.next` (build de Next.js)
- `frontend/.next/standalone` (versión standalone lista para producción)
- `frontend/.next/static` (archivos estáticos)

### 1.4 Preparar Base de Datos

```powershell
# En la carpeta backend
cd C:\Proyectos\SAD\backend

# Exportar el esquema SQL
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > schema-produccion.sql
```

**Alternativa** (si el comando anterior no funciona):

1. Abre MySQL Workbench o HeidiSQL
2. Crea una base de datos local temporal llamada `sad_produccion`
3. Ejecuta:
   ```powershell
   npx prisma migrate deploy
   ```
4. Exporta toda la estructura (sin datos) usando la opción "Export > Structure Only"
5. Guarda como `schema-produccion.sql`

### 1.5 Crear Usuario Administrador Inicial

```powershell
# En la carpeta backend (solo el usuario admin inicial, sin datos de prueba)
# Abre backend/prisma/seed.ts y asegúrate de tener solo la creación de roles y el usuario admin
npx ts-node prisma/seed-admin-only.ts
```

**IMPORTANTE**: Crea un archivo temporal `backend/prisma/seed-admin-only.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario administrador inicial...');

  // Crear rol de Administrador
  const adminRole = await prisma.role.create({
    data: {
      name: 'Administrador',
      description: 'Acceso total al sistema',
      permissions: {
        users: { view: true, create: true, update: true, delete: true },
        roles: { view: true, create: true, update: true, delete: true },
        offices: { view: true, create: true, update: true, delete: true },
        documentTypes: { view: true, create: true, update: true, delete: true },
        periods: { view: true, create: true, update: true, delete: true },
        audit: { view: true, export: true },
        configuration: { view: true, update: true },
        archivadores: { view: true, create: true, update: true, delete: true },
        documents: { view: true, create: true, update: true, delete: true, download: true, export: true },
        versions: { view: true, restore: true, download: true, compare: true },
        expedientes: { view: true, create: true, update: true, delete: true },
        search: { view: true, export: true },
        reports: { view: true, generate: true, export: true },
        analytics: { view: true, export: true },
        signing: { view: true, sign: true },
        signatureFlows: { view: true, create: true, update: true, delete: true, approve: true },
        notifications: { view: true, delete: true }
      }
    }
  });

  // Crear usuario administrador
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  
  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@risvirgendecocharcas.gob.pe',
      password: hashedPassword,
      firstName: 'Administrador',
      lastName: 'Sistema',
      roleId: adminRole.id,
      isActive: true
    }
  });

  console.log('✓ Usuario administrador creado exitosamente');
  console.log('  Username: admin');
  console.log('  Password: Admin123!');
  console.log('  ⚠️  CAMBIAR LA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Luego exporta los datos SQL del usuario admin:

```sql
-- Exporta solo estas dos tablas:
-- 1. roles (solo el rol Administrador)
-- 2. users (solo el usuario admin)
```

Guarda como `admin-data.sql`

---

## 2. Configuración de cPanel

### 2.1 Crear Base de Datos MySQL

1. **Ingresa a cPanel** → **Bases de datos MySQL**

2. **Crear nueva base de datos**:
   - Nombre: `dchincheros_archivo_digital_disa`
   - Click en "Crear base de datos"

3. **Crear usuario de base de datos**:
   - Usuario: `dchincheros_sad_user`
   - Contraseña: `luisdkb2025` (o genera una segura)
   - Click en "Crear usuario"

4. **Asignar usuario a la base de datos**:
   - Selecciona usuario: `dchincheros_sad_user`
   - Selecciona base de datos: `dchincheros_archivo_digital_disa`
   - Marca "TODOS LOS PRIVILEGIOS"
   - Click en "Realizar cambios"

5. **Importar esquema y datos**:
   - Ve a **cPanel** → **phpMyAdmin**
   - Selecciona la base de datos `dchincheros_archivo_digital_disa`
   - Click en "Importar"
   - Sube `schema-produccion.sql` (estructura de tablas)
   - Click en "Continuar"
   - Luego sube `admin-data.sql` (usuario administrador)
   - Click en "Continuar"

**✓ VERIFICAR**: En phpMyAdmin deberías ver todas las tablas creadas y el usuario admin en la tabla `users`.

### 2.2 Configurar Subdominio

1. **Ingresa a cPanel** → **Dominios**

2. **Crear subdominio** (si aún no existe):
   - Subdominio: `archivos`
   - Dominio: `risvirgendecocharcas.gob.pe`
   - Raíz del documento: `/home/username/archivos` (cPanel lo asigna automáticamente)
   - Click en "Enviar"

**IMPORTANTE**: Anota la ruta completa, por ejemplo:
```
/home/dchincheros/archivos
```

### 2.3 Crear Estructura de Directorios

Usando el **Administrador de archivos de cPanel**:

```
/home/dchincheros/archivos/
├── backend/                    (Aplicación Node.js del backend)
│   ├── dist/                  (Código compilado - lo subirás)
│   ├── node_modules/          (Se instala en cPanel)
│   ├── prisma/                (Esquema de Prisma)
│   ├── uploads/               (Archivos subidos por usuarios)
│   │   ├── documents/         (PDFs de documentos)
│   │   └── system/            (logos, favicon, etc.)
│   ├── spa.traineddata        (OCR español)
│   ├── eng.traineddata        (OCR inglés)
│   ├── package.json
│   ├── package-lock.json
│   └── .env.production        (Variables de entorno)
│
├── frontend/                   (Aplicación Next.js)
│   ├── .next/                 (Build de Next.js - lo subirás)
│   ├── node_modules/          (Se instala en cPanel)
│   ├── public/                (Archivos públicos)
│   ├── package.json
│   ├── package-lock.json
│   └── .env.production        (Variables de entorno)
│
└── tmp/                        (Temporal para Node.js apps)
```

**Crear carpetas manualmente** en el Administrador de archivos:
1. `backend`
2. `backend/uploads`
3. `backend/uploads/documents`
4. `backend/uploads/system`
5. `backend/prisma`
6. `frontend`
7. `tmp`

---

## 3. Despliegue del Backend

### 3.1 Subir Archivos del Backend

**Usando FileZilla o el Administrador de archivos de cPanel**:

1. **Archivos compilados** (`backend/dist`):
   - Sube toda la carpeta `dist` a `/home/dchincheros/archivos/backend/dist`

2. **Configuración de Prisma**:
   - Sube `backend/prisma/schema.prisma` a `/home/dchincheros/archivos/backend/prisma/`

3. **Archivos de OCR** (Tesseract):
   - Sube `backend/spa.traineddata` a `/home/dchincheros/archivos/backend/`
   - Sube `backend/eng.traineddata` a `/home/dchincheros/archivos/backend/`

4. **Archivos de configuración**:
   - Sube `backend/package.json` a `/home/dchincheros/archivos/backend/`
   - Sube `backend/package-lock.json` a `/home/dchincheros/archivos/backend/`

5. **Variables de entorno**:
   - Crea un archivo `.env.production` en `/home/dchincheros/archivos/backend/`
   - Contenido (ajusta según tus datos reales):

```env
# NODE ENVIRONMENT
NODE_ENV=production

# PORT (cPanel lo asignará automáticamente)
PORT=5001

# DATABASE
DATABASE_URL=mysql://dchincheros_sad_user:luisdkb2025@localhost:3306/dchincheros_archivo_digital_disa

# JWT SECRETS (USA VALORES SEGUROS DIFERENTES)
JWT_SECRET=OG9gLrsIbkJKwAnXTHhC6oWZecM4mF3f2iu1y8QYPtz5qlBxdNjSpDER0va7VU
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# FIRMA PERÚ - PRODUCCIÓN
FIRMA_PERU_API_URL=http://localhost:8080/validador/api
FIRMA_PERU_CREDENTIAL=CREDENTIAL_PRODUCCION
FIRMA_PERU_CLIENT_ID=PdTyHKL6kjIwNDkxMjQ0OTAwgoC3nFvbkA
FIRMA_PERU_CLIENT_SECRET=jjFbcPUHA5hrlYOO89MLftpNH8pRGEcXOnE
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596
FIRMA_PERU_BACKEND_BASE_URL=http://archivos.risvirgendecocharcas.gob.pe/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=iQuUcmzRqO05j61IMS8asdEvZNhJHb3wpFf7gDWn9LXxkPlYTrt2oe4GKBVAyC

# OPTIMIZACIÓN
NODE_OPTIONS=--max_old_space_size=512
```

### 3.2 Configurar Aplicación Node.js (Backend)

1. **Ingresa a cPanel** → **Setup Node.js App**

2. **Crear aplicación**:
   - Node.js version: **18.x** o superior (la última disponible)
   - Application mode: **Production**
   - Application root: `/home/dchincheros/archivos/backend`
   - Application URL: `archivos.risvirgendecocharcas.gob.pe/api`
   - Application startup file: `dist/server.js`
   - Click en "Create"

3. **Configurar variables de entorno** (en la misma pantalla):
   - Click en "Environment variables"
   - Agrega TODAS las variables del archivo `.env.production`:
     ```
     NODE_ENV = production
     PORT = (el puerto que cPanel asignó, ej: 5001)
     DATABASE_URL = mysql://dchincheros_sad_user:luisdkb2025@localhost:3306/dchincheros_archivo_digital_disa
     JWT_SECRET = (tu secreto)
     JWT_EXPIRES_IN = 15m
     JWT_REFRESH_EXPIRES_IN = 7d
     (... todas las demás variables)
     ```

4. **Instalar dependencias**:
   - En la misma pantalla, copia el comando que cPanel te muestra, algo como:
     ```bash
     source /home/dchincheros/nodevenv/archivos/backend/18/bin/activate && cd /home/dchincheros/archivos/backend && npm install
     ```
   - **PROBLEMA**: No tienes acceso SSH, entonces:
     
   **SOLUCIÓN**:
   - Copia toda tu carpeta `backend/node_modules` desde tu computadora local
   - Súbela a `/home/dchincheros/archivos/backend/node_modules` usando FTP
   - **IMPORTANTE**: Esto puede tardar mucho (miles de archivos)
   - **ALTERNATIVA**: Comprime `node_modules` en un ZIP, súbelo y descomprímelo en cPanel

5. **Generar Prisma Client**:
   - Necesitas que Prisma genere el cliente en el servidor
   - **PROBLEMA**: No puedes ejecutar `npx prisma generate` sin SSH
   
   **SOLUCIÓN**:
   - Localmente, después de hacer `npm run prisma:generate`, copia la carpeta:
     ```
     backend/node_modules/.prisma
     backend/node_modules/@prisma/client
     ```
   - Súbelas a las mismas rutas en el servidor

### 3.3 Configurar .htaccess para Backend

Crea un archivo `.htaccess` en `/home/dchincheros/archivos/`:

```apache
# Backend API - Redirigir /api a la aplicación Node.js
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Redirigir todas las peticiones /api/* al backend Node.js
  RewriteCond %{REQUEST_URI} ^/api/(.*)$
  RewriteRule ^api/(.*)$ http://127.0.0.1:5001/api/$1 [P,L]
  
  # Servir archivos estáticos del backend (uploads, etc.)
  RewriteCond %{REQUEST_URI} ^/uploads/(.*)$
  RewriteRule ^uploads/(.*)$ backend/uploads/$1 [L]
  
  # Todo lo demás va al frontend
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>
```

**IMPORTANTE**: Reemplaza `5001` y `3000` con los puertos reales que cPanel asignó.

---

## 4. Despliegue del Frontend

### 4.1 Subir Archivos del Frontend

1. **Build de Next.js standalone**:
   - Sube toda la carpeta `frontend/.next` a `/home/dchincheros/archivos/frontend/.next`

2. **Archivos estáticos**:
   - Sube la carpeta `frontend/public` a `/home/dchincheros/archivos/frontend/public`

3. **Archivos de configuración**:
   - Sube `frontend/package.json`
   - Sube `frontend/package-lock.json`
   - Sube `frontend/next.config.ts` (opcional, ya está compilado en .next)

4. **Variables de entorno**:
   - Crea `.env.production` en `/home/dchincheros/archivos/frontend/`:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://archivos.risvirgendecocharcas.gob.pe/api
```

### 4.2 Configurar Aplicación Node.js (Frontend)

1. **Ingresa a cPanel** → **Setup Node.js App**

2. **Crear aplicación**:
   - Node.js version: **18.x** o superior (la misma que el backend)
   - Application mode: **Production**
   - Application root: `/home/dchincheros/archivos/frontend`
   - Application URL: `archivos.risvirgendecocharcas.gob.pe` (sin /api)
   - Application startup file: `.next/standalone/server.js`
   - Click en "Create"

3. **Configurar variables de entorno**:
   ```
   NODE_ENV = production
   NEXT_PUBLIC_API_URL = http://archivos.risvirgendecocharcas.gob.pe/api
   PORT = (el puerto que cPanel asignó, ej: 3000)
   ```

4. **Instalar dependencias**:
   - Igual que con el backend, sube `node_modules` manualmente vía FTP
   - O comprimido en ZIP y descomprime en cPanel

### 4.3 Configurar Archivos Estáticos

**IMPORTANTE**: Next.js standalone necesita acceso a los archivos estáticos.

Crea un symlink o copia los archivos:

**Opción 1: Via cPanel Administrador de archivos** (no soporta symlinks)
- Copia la carpeta `frontend/.next/static` a `frontend/.next/standalone/.next/static`
- Copia la carpeta `frontend/public` a `frontend/.next/standalone/public`

**Opción 2: Si tuvieras SSH** (no aplica en tu caso):
```bash
ln -s /home/dchincheros/archivos/frontend/.next/static /home/dchincheros/archivos/frontend/.next/standalone/.next/static
ln -s /home/dchincheros/archivos/frontend/public /home/dchincheros/archivos/frontend/.next/standalone/public
```

---

## 5. Configuración Final y Verificación

### 5.1 Reiniciar Aplicaciones Node.js

1. Ve a **cPanel** → **Setup Node.js App**
2. Para cada aplicación (backend y frontend):
   - Click en el botón "Restart"
   - Espera a que muestre "Running"

### 5.2 Verificar Backend

Abre en el navegador:
```
http://archivos.risvirgendecocharcas.gob.pe/api/health
```

**Respuesta esperada**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T...",
  "database": "connected",
  "version": "1.0.0"
}
```

**Si falla**: Revisa los logs en cPanel → Setup Node.js App → Ver logs de la aplicación backend

### 5.3 Verificar Frontend

Abre en el navegador:
```
http://archivos.risvirgendecocharcas.gob.pe
```

**Resultado esperado**: Ver la página de login del sistema

### 5.4 Primer Login

1. Ve a `http://archivos.risvirgendecocharcas.gob.pe`
2. Ingresa:
   - **Usuario**: `admin`
   - **Contraseña**: `Admin123!`
3. **INMEDIATAMENTE** cambia la contraseña desde el menú de perfil

### 5.5 Verificar Permisos de Carpetas

Usando el **Administrador de archivos de cPanel**:

1. Click derecho en `backend/uploads` → "Cambiar permisos"
   - Permisos: **755** (o 775 si da problemas)

2. Click derecho en `backend/uploads/documents` → "Cambiar permisos"
   - Permisos: **755**

3. Click derecho en `backend/uploads/system` → "Cambiar permisos"
   - Permisos: **755**

---

## 6. Actualizaciones Futuras

### 6.1 Preparación Local

```powershell
# 1. Hacer cambios en tu código local
# 2. Probar localmente
# 3. Commit a Git

# 4. Reconstruir backend
cd C:\Proyectos\SAD\backend
npm run build

# 5. Reconstruir frontend
cd C:\Proyectos\SAD\frontend
npm run build
```

### 6.2 Actualizar Backend

**Archivos a subir** (vía FTP):

1. **Código actualizado**:
   - Reemplaza toda la carpeta `backend/dist` en el servidor

2. **Si cambiaste dependencias** (`package.json`):
   - Sube `package.json` y `package-lock.json`
   - Sube `node_modules` completo (o incrementalmente si sabes qué cambió)

3. **Si cambiaste el esquema de base de datos** (`prisma/schema.prisma`):
   - **IMPORTANTE**: Este es el paso más delicado
   
   **Proceso**:
   ```powershell
   # Local: Genera el SQL de migración
   cd backend
   npx prisma migrate dev --name nombre_de_migracion
   
   # Esto crea: prisma/migrations/XXXXXX_nombre_de_migracion/migration.sql
   ```
   
   - Sube el archivo `schema.prisma` actualizado
   - Abre **phpMyAdmin** en cPanel
   - Selecciona tu base de datos
   - Click en "SQL"
   - Copia el contenido de `migration.sql`
   - Pégalo y ejecuta
   - Verifica que las tablas se actualizaron correctamente

4. **Reiniciar backend**:
   - cPanel → Setup Node.js App → Backend → Restart

### 6.3 Actualizar Frontend

**Archivos a subir** (vía FTP):

1. **Build actualizado**:
   - Reemplaza toda la carpeta `frontend/.next` en el servidor

2. **Si cambiaste archivos públicos**:
   - Reemplaza `frontend/public`

3. **Si cambiaste dependencias**:
   - Sube `package.json` y `node_modules` actualizados

4. **Archivos estáticos**:
   - Asegúrate de copiar nuevamente:
     - `frontend/.next/static` → `frontend/.next/standalone/.next/static`
     - `frontend/public` → `frontend/.next/standalone/public`

5. **Reiniciar frontend**:
   - cPanel → Setup Node.js App → Frontend → Restart

### 6.4 Actualización Rápida (Solo Código)

Si **NO** cambiaste:
- Dependencias (`package.json`)
- Esquema de base de datos
- Variables de entorno

**Pasos rápidos**:

1. Build local (backend y frontend)
2. Sube solo `backend/dist` (reemplaza todo)
3. Sube solo `frontend/.next` (reemplaza todo)
4. Reinicia ambas apps en cPanel

**Tiempo estimado**: 5-10 minutos

### 6.5 Backup Antes de Actualizar

**SIEMPRE** antes de actualizar:

1. **Backup de base de datos**:
   - cPanel → phpMyAdmin
   - Selecciona la base de datos
   - Click en "Exportar"
   - Guarda el archivo `.sql` con fecha: `backup-2025-11-05.sql`

2. **Backup de uploads**:
   - Descarga la carpeta `backend/uploads/documents` completa vía FTP
   - Guarda localmente con fecha

3. **Backup de configuración**:
   - Descarga `.env.production` de ambos (backend y frontend)

---

## 7. Solución de Problemas

### 7.1 Error: "Cannot connect to database"

**Causa**: Credenciales incorrectas o base de datos no existe

**Solución**:
1. Verifica en cPanel → Bases de datos MySQL que la BD existe
2. Verifica que el usuario tiene privilegios
3. Revisa `DATABASE_URL` en `.env.production`
4. Formato correcto:
   ```
   mysql://USUARIO:CONTRASEÑA@localhost:3306/NOMBRE_BD
   ```

### 7.2 Error: "Prisma Client not generated"

**Causa**: Falta el cliente de Prisma generado

**Solución**:
1. Local: `npm run prisma:generate`
2. Copia `node_modules/.prisma` y `node_modules/@prisma/client`
3. Súbelos al servidor
4. Reinicia la app backend

### 7.3 Error 502 Bad Gateway

**Causa**: La aplicación Node.js no está corriendo

**Solución**:
1. cPanel → Setup Node.js App
2. Verifica que el estado sea "Running"
3. Si no, click en "Restart"
4. Revisa los logs para ver errores

### 7.4 Frontend muestra página en blanco

**Causa**: Archivos estáticos no accesibles

**Solución**:
1. Verifica que `frontend/.next/standalone/.next/static` existe
2. Verifica que `frontend/.next/standalone/public` existe
3. Si no, cópialos desde las carpetas originales
4. Reinicia la app frontend

### 7.5 Error: "Upload failed"

**Causa**: Permisos incorrectos en carpeta uploads

**Solución**:
1. Administrador de archivos de cPanel
2. `backend/uploads` → Permisos 755
3. `backend/uploads/documents` → Permisos 755
4. `backend/uploads/system` → Permisos 755

### 7.6 Las imágenes no se muestran

**Causa**: Configuración de Next.js o rutas incorrectas

**Solución**:
1. Verifica que `next.config.ts` tenga la configuración correcta:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'http',
         hostname: 'archivos.risvirgendecocharcas.gob.pe',
         pathname: '/api/**',
       },
     ],
   }
   ```
2. Verifica que `.htaccess` redirija correctamente `/uploads/*`

### 7.7 Ver Logs de Errores

**Backend logs**:
- cPanel → Setup Node.js App → Aplicación backend → "Show logs"

**Frontend logs**:
- cPanel → Setup Node.js App → Aplicación frontend → "Show logs"

**Base de datos logs**:
- cPanel → phpMyAdmin → Tab "Estado" → "Logs"

---

## 📝 Checklist Final

Antes de considerar el despliegue completo:

- [ ] Base de datos creada y usuario asignado
- [ ] Estructura de tablas importada correctamente
- [ ] Usuario admin creado y probado login
- [ ] Backend desplegado y respondiendo en `/api/health`
- [ ] Frontend desplegado y página de login visible
- [ ] Permisos de carpetas `uploads` configurados (755)
- [ ] Variables de entorno configuradas correctamente
- [ ] Ambas aplicaciones Node.js en estado "Running"
- [ ] `.htaccess` configurado para enrutamiento
- [ ] Archivos estáticos accesibles (logos, imágenes)
- [ ] Archivos OCR (spa.traineddata, eng.traineddata) subidos
- [ ] Contraseña de admin cambiada desde el sistema
- [ ] Backup de base de datos creado
- [ ] Documentación de credenciales guardada de forma segura

---

## 🔐 Credenciales a Guardar

**Guarda estas credenciales en un lugar seguro** (KeePass, 1Password, etc.):

```
=== BASE DE DATOS ===
Host: localhost
Puerto: 3306
Base de datos: dchincheros_archivo_digital_disa
Usuario: dchincheros_sad_user
Contraseña: luisdkb2025

=== USUARIO ADMINISTRADOR INICIAL ===
URL: http://archivos.risvirgendecocharcas.gob.pe
Usuario: admin
Contraseña: Admin123! (CAMBIAR INMEDIATAMENTE)

=== FIRMA PERÚ ===
Client ID: PdTyHKL6kjIwNDkxMjQ0OTAwgoC3nFvbkA
Client Secret: jjFbcPUHA5hrlYOO89MLftpNH8pRGEcXOnE

=== JWT SECRETS ===
JWT_SECRET: OG9gLrsIbkJKwAnXTHhC6oWZecM4mF3f2iu1y8QYPtz5qlBxdNjSpDER0va7VU
FIRMA_PERU_ONE_TIME_TOKEN_SECRET: iQuUcmzRqO05j61IMS8asdEvZNhJHb3wpFf7gDWn9LXxkPlYTrt2oe4GKBVAyC
```

---

## 📞 Soporte

Si encuentras problemas durante el despliegue:

1. **Revisa los logs** en cPanel (Setup Node.js App → Show logs)
2. **Verifica la sección de solución de problemas** de esta guía
3. **Revisa la documentación de cPanel** para Node.js apps
4. **Consulta con el proveedor de hosting** si hay restricciones específicas

---

**Versión de esta guía**: 1.0  
**Última actualización**: Noviembre 2025  
**Autor**: Sistema SAD - DISA CHINCHEROS
