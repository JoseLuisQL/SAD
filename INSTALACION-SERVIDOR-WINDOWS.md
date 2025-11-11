# 🚀 Guía de Instalación Completa - Servidor Windows

Instalación desde cero del Sistema Integrado de Archivos Digitales (SAD) en un servidor Windows limpio.

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Instalación de Dependencias del Sistema](#instalación-de-dependencias-del-sistema)
3. [Clonar Repositorio](#clonar-repositorio)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Instalación del Backend](#instalación-del-backend)
6. [Instalación del Frontend](#instalación-del-frontend)
7. [Despliegue en Producción](#despliegue-en-producción)
8. [Verificación](#verificación)
9. [Solución de Problemas](#solución-de-problemas)

---

## 📋 Pre-requisitos

### Software Requerido

- **Windows Server 2019+** o Windows 10/11
- **Node.js 18+** y **npm 9+**
- **MySQL 8.0+**
- **Git** para Windows
- **PowerShell 5.1+** (incluido en Windows)

### Recursos Mínimos

- **RAM:** 4 GB (8 GB recomendado)
- **Disco:** 20 GB libres
- **CPU:** 2 cores (4 recomendado)
- **Red:** Conexión estable a internet para instalación

---

## 🔧 Instalación de Dependencias del Sistema

### 1. Instalar Node.js y npm

1. Descarga Node.js LTS desde: https://nodejs.org/
2. Ejecuta el instalador
3. Verifica la instalación:

```powershell
node --version
# Debe mostrar: v18.x.x o superior

npm --version
# Debe mostrar: 9.x.x o superior
```

### 2. Instalar MySQL

1. Descarga MySQL 8.0 desde: https://dev.mysql.com/downloads/installer/
2. Ejecuta el instalador
3. Durante la instalación:
   - Tipo: **Developer Default** o **Server Only**
   - Puerto: **3306** (default)
   - Configura contraseña de root
   - Marca: "Start MySQL Server at System Startup"

4. Verifica la instalación:

```powershell
mysql --version
# Debe mostrar: mysql Ver 8.0.x
```

5. **Configura MySQL** para aceptar conexiones:

```powershell
# Conecta a MySQL como root
mysql -u root -p

# Dentro de MySQL, ejecuta:
CREATE DATABASE archivo_digital_disa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Crea usuario para la aplicación (recomendado para producción)
CREATE USER 'sad_user'@'localhost' IDENTIFIED BY 'TuPasswordSegura123!';
GRANT ALL PRIVILEGES ON archivo_digital_disa.* TO 'sad_user'@'localhost';
FLUSH PRIVILEGES;

# Sal de MySQL
EXIT;
```

### 3. Instalar Git

1. Descarga Git desde: https://git-scm.com/download/win
2. Ejecuta el instalador (deja opciones por defecto)
3. Verifica:

```powershell
git --version
# Debe mostrar: git version 2.x.x
```

### 4. Configurar Git (Primera vez)

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 📥 Clonar Repositorio

### Opción 1: Clonar desde GitHub/GitLab (Repositorio Remoto)

```powershell
# Navega al directorio donde quieres instalar
cd C:\

# Clona el repositorio (reemplaza con tu URL real)
git clone https://github.com/tu-organizacion/SAD.git

# Entra al directorio
cd SAD
```

### Opción 2: Desde Repositorio Local/USB

```powershell
# Copia el proyecto desde USB o red
Copy-Item -Path "E:\SAD" -Destination "C:\SAD" -Recurse

# Entra al directorio
cd C:\SAD
```

### Verificar Estructura

```powershell
ls

# Debes ver:
# backend/
# frontend/
# .git/
# README.md
# etc.
```

---

## 🗄️ Configuración de Base de Datos

### 1. Verificar que MySQL esté corriendo

```powershell
# Ver servicios de MySQL
Get-Service -Name "MySQL*"

# Si no está corriendo, iniciarlo
Start-Service -Name "MySQL80"
```

### 2. Crear Base de Datos (si no lo hiciste antes)

```powershell
mysql -u root -p

# Dentro de MySQL:
CREATE DATABASE archivo_digital_disa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

---

## ⚙️ Instalación del Backend

### 1. Navegar al Backend

```powershell
cd C:\SAD\backend
```

### 2. Instalar Dependencias

```powershell
npm install
```

**Nota:** Este proceso puede tomar 3-5 minutos.

### 3. Configurar Variables de Entorno

#### Para Desarrollo/Testing:

```powershell
# Copiar archivo de ejemplo
Copy-Item .env.example .env

# Editar el archivo .env
notepad .env
```

#### Para Producción:

Crea el archivo `.env` con la siguiente configuración:

```bash
NODE_ENV=production
PORT=5001
HOST=0.0.0.0

# Base de Datos
DATABASE_URL=mysql://sad_user:TuPasswordSegura123!@localhost:3306/archivo_digital_disa

# JWT
JWT_SECRET=CAMBIA_ESTE_SECRETO_POR_ALGO_ALEATORIO_Y_SEGURO_MINIMO_32_CARACTERES
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend URL - Orígenes permitidos para CORS (separar con comas)
# IMPORTANTE: Reemplaza 192.168.18.21 con la IP real de tu servidor
FRONTEND_URL=http://localhost:3000,http://192.168.18.21:3000

# Firma Perú Configuration (Opcional - Solo si usas Firma Digital)
FIRMA_PERU_API_URL=http://localhost:8080/validador/api
FIRMA_PERU_CREDENTIAL=default-credential
FIRMA_PERU_CLIENT_ID=TU_CLIENT_ID
FIRMA_PERU_CLIENT_SECRET=TU_CLIENT_SECRET
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596
FIRMA_PERU_BACKEND_BASE_URL=http://192.168.18.21:5001/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=otro-secreto-aleatorio-diferente
```

**⚠️ IMPORTANTE - Cambia estos valores:**
1. `JWT_SECRET` - Genera uno aleatorio de 32+ caracteres
2. `DATABASE_URL` - Usuario, contraseña y nombre de DB correctos
3. `FRONTEND_URL` - IP real de tu servidor
4. `FIRMA_PERU_*` - Solo si usas Firma Digital del gobierno

**Generar JWT_SECRET seguro:**
```powershell
# Opción 1: Usar OpenSSL (si está instalado)
openssl rand -base64 32

# Opción 2: Generar en PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 4. Ejecutar Migraciones de Prisma

Prisma creará todas las tablas en la base de datos:

```powershell
# Generar el cliente de Prisma
npm run prisma:generate

# Aplicar migraciones (crea las tablas)
npm run prisma:migrate:deploy
```

**Salida esperada:**
```
✓ Generated Prisma Client
✓ Applying migration `20231001000000_init`
✓ Applying migration `20231002000000_add_signatures`
... (más migraciones)
✓ Database schema is up to date!
```

### 5. Poblar Base de Datos (Seed)

Hay dos opciones:

#### Opción A: Seed Completo (Recomendado para desarrollo/testing)

Crea datos de ejemplo: roles, usuario admin, oficinas, tipos de documento, períodos.

```powershell
npm run prisma:seed
```

**Credenciales creadas:**
- Usuario: `admin`
- Email: `admin@disachincheros.gob.pe`
- Password: `Admin123!`

#### Opción B: Solo Usuario Administrador (Recomendado para producción)

Solo crea el rol de administrador y usuario admin, sin datos de ejemplo.

```powershell
npx ts-node prisma/seed-admin-only.ts
```

**Credenciales creadas:**
- Usuario: `admin`
- Email: `admin@risvirgendecocharcas.gob.pe`
- Password: `Admin123!`

**⚠️ IMPORTANTE:** Cambia la contraseña del admin después del primer login.

### 6. Compilar Backend (TypeScript a JavaScript)

```powershell
npm run build
```

Este comando crea la carpeta `dist/` con el código compilado.

### 7. Verificar Instalación del Backend

```powershell
# Inicia el backend
npm run start

# Debes ver:
# ✓ Servidor corriendo en puerto 5001
# ✓ Host: 0.0.0.0
# ✓ URL Red: http://192.168.18.21:5001
```

Prueba el health check en otra terminal:

```powershell
curl http://localhost:5001/api/health
```

Si responde con `"status": "OK"`, el backend está funcionando correctamente.

**Detén el servidor** con `Ctrl+C` antes de continuar.

---

## 💻 Instalación del Frontend

### 1. Navegar al Frontend

```powershell
cd C:\SAD\frontend
```

### 2. Instalar Dependencias

```powershell
npm install
```

### 3. Configurar Variables de Entorno

#### Para Desarrollo:

```powershell
# Crear archivo .env.local
New-Item .env.local -ItemType File

# Editar
notepad .env.local
```

Contenido de `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

#### Para Producción:

Crea el archivo `.env.production`:

```powershell
# Crear archivo
New-Item .env.production -ItemType File -Force

# Editar
notepad .env.production
```

Contenido de `.env.production`:
```bash
# URL del Backend API en Producción
# IMPORTANTE: Reemplaza con la IP real de tu servidor
NEXT_PUBLIC_API_URL=http://192.168.18.21:5001/api
```

**⚠️ IMPORTANTE:** 
- Usa la **IP real** de tu servidor, no `localhost`
- NO incluyas slash final en la URL
- Si tienes un dominio, usa: `https://tu-dominio.com/api`

### 4. Construir para Producción

```powershell
npm run build
```

Este proceso puede tomar 3-5 minutos. Genera la carpeta `.next/` con la aplicación optimizada.

**Si el build falla**, limpia el cache e intenta de nuevo:
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build
```

---

## 🌐 Despliegue en Producción

### Opción 1: Inicio Manual (Para Testing)

#### Terminal 1 - Backend:
```powershell
cd C:\SAD\backend
npm run start
```

#### Terminal 2 - Frontend:
```powershell
cd C:\SAD\frontend
.\start-production.ps1
```

### Opción 2: Inicio Automático (Recomendado)

Desde la raíz del proyecto:

```powershell
cd C:\SAD
.\INICIO-RAPIDO.ps1
```

Este script:
- Detecta automáticamente tu IP de red local
- Inicia backend y frontend en ventanas separadas
- Muestra las URLs de acceso

### Opción 3: Servicio de Windows (Producción Permanente)

Para que se inicie automáticamente con Windows, usa **PM2**:

#### Instalar PM2:
```powershell
npm install -g pm2
npm install -g pm2-windows-startup

# Configurar PM2 para inicio automático
pm2-startup install
```

#### Crear configuración PM2:

Crea el archivo `C:\SAD\ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'sad-backend',
      cwd: 'C:/SAD/backend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      }
    },
    {
      name: 'sad-frontend',
      cwd: 'C:/SAD/frontend',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      }
    }
  ]
};
```

#### Iniciar servicios con PM2:

```powershell
cd C:\SAD

# Iniciar aplicaciones
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs

# Guardar configuración para inicio automático
pm2 save
```

#### Comandos útiles de PM2:

```powershell
# Ver estado
pm2 status

# Reiniciar todo
pm2 restart all

# Reiniciar solo backend
pm2 restart sad-backend

# Detener todo
pm2 stop all

# Ver logs en tiempo real
pm2 logs

# Ver logs solo del backend
pm2 logs sad-backend

# Eliminar procesos
pm2 delete all
```

---

## ✅ Verificación

### 1. Verificar Backend

```powershell
# Health check
curl http://localhost:5001/api/health

# Debe responder:
# {"status":"OK","message":"Sistema... funcionando correctamente"}
```

### 2. Verificar Frontend

Abre el navegador y ve a:
- **Local:** http://localhost:3000
- **Red Local:** http://192.168.18.21:3000 (reemplaza con tu IP)

Debes ver la pantalla de login.

### 3. Verificar Login

Usa las credenciales creadas en el seed:
- **Usuario:** `admin`
- **Password:** `Admin123!`

Si puedes hacer login, ¡la instalación fue exitosa! 🎉

### 4. Checklist Final

- [ ] Backend responde en puerto 5001
- [ ] Frontend responde en puerto 3000
- [ ] Puedes hacer login con usuario admin
- [ ] Base de datos tiene tablas creadas
- [ ] Puedes acceder desde otro dispositivo en la red (opcional)

---

## 🔧 Configuración Adicional

### Configurar Firewall de Windows

Para acceso desde otros equipos en la red:

```powershell
# Permitir puerto 3000 (Frontend)
New-NetFirewallRule -DisplayName "SAD Frontend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Permitir puerto 5001 (Backend)
New-NetFirewallRule -DisplayName "SAD Backend" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
```

### Configurar IP Estática (Recomendado)

Para que la IP no cambie:

1. Abre **Configuración de Windows** → **Red e Internet**
2. Click en tu conexión de red
3. **Configuración de IP** → Cambiar a **Manual**
4. Configura:
   - IP: `192.168.18.21` (o la que tengas)
   - Máscara: `255.255.255.0`
   - Puerta de enlace: `192.168.18.1` (IP de tu router)
   - DNS: `8.8.8.8` y `8.8.4.4`

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to MySQL"

**Causas comunes:**
1. MySQL no está corriendo
2. Credenciales incorrectas en `.env`
3. Base de datos no existe

**Soluciones:**
```powershell
# Ver estado de MySQL
Get-Service MySQL80

# Iniciar MySQL
Start-Service MySQL80

# Verificar conexión
mysql -u sad_user -p archivo_digital_disa
```

### Error: "Port 3000 is already in use"

Otro proceso está usando el puerto.

**Solución:**
```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F

# O cambiar el puerto en las variables de entorno
$env:PORT=3001
npm run start
```

### Error: "Prisma Client not generated"

**Solución:**
```powershell
cd C:\SAD\backend
npm run prisma:generate
npm run build
```

### Error: "Not allowed by CORS"

El backend está rechazando peticiones del frontend.

**Solución:**
1. Verifica que `backend\.env` tenga `FRONTEND_URL` con la IP correcta
2. Reinicia el backend
3. Limpia el cache del navegador

### Error: "Cannot find module '@prisma/client'"

**Solución:**
```powershell
cd C:\SAD\backend
npm install
npm run prisma:generate
```

### El build del frontend falla

**Solución:**
```powershell
cd C:\SAD\frontend

# Limpiar todo
Remove-Item -Recurse -Force .next, node_modules
Remove-Item package-lock.json

# Reinstalar
npm install
npm run build
```

### No puedo acceder desde el celular

**Soluciones:**
1. Verifica que estés en la misma red WiFi
2. Verifica el firewall (comandos arriba)
3. Verifica la IP del servidor:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4
   ```
4. Prueba hacer ping desde el celular a la IP del servidor

---

## 📚 Comandos Rápidos de Referencia

### Backend

```powershell
cd C:\SAD\backend

# Desarrollo
npm run dev                      # Inicia en modo desarrollo

# Producción
npm run build                    # Compila TypeScript
npm run start                    # Inicia servidor de producción

# Prisma
npm run prisma:generate          # Genera cliente de Prisma
npm run prisma:migrate:deploy    # Aplica migraciones
npm run prisma:seed              # Ejecuta seed
npm run prisma:studio            # Abre GUI de base de datos

# Base de datos
npx ts-node prisma/seed.ts       # Seed completo
npx ts-node prisma/seed-admin-only.ts  # Solo admin
```

### Frontend

```powershell
cd C:\SAD\frontend

# Desarrollo
npm run dev                      # Inicia en modo desarrollo

# Producción
npm run build                    # Construye para producción
npm run start                    # Inicia servidor de producción
.\start-production.ps1           # Inicia con script (detecta IP)
```

### PM2 (Servicio)

```powershell
pm2 start ecosystem.config.js    # Iniciar servicios
pm2 status                       # Ver estado
pm2 logs                         # Ver logs
pm2 restart all                  # Reiniciar todo
pm2 stop all                     # Detener todo
pm2 delete all                   # Eliminar procesos
pm2 save                         # Guardar configuración
```

---

## 🔄 Actualizar el Sistema

Cuando haya actualizaciones del código:

```powershell
cd C:\SAD

# 1. Detener servicios (si usan PM2)
pm2 stop all

# 2. Obtener últimos cambios
git pull origin main

# 3. Actualizar backend
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:deploy
npm run build

# 4. Actualizar frontend
cd ..\frontend
npm install
npm run build

# 5. Reiniciar servicios
cd ..
pm2 restart all

# O manualmente:
# Terminal 1: cd backend && npm run start
# Terminal 2: cd frontend && .\start-production.ps1
```

---

## 📞 Soporte

Para problemas o dudas:
1. Revisa la sección **Solución de Problemas**
2. Consulta los logs: `pm2 logs` o en las terminales
3. Verifica los archivos `.env` tienen las configuraciones correctas
4. Consulta el README del proyecto

---

## ✅ ¡Instalación Completada!

Si llegaste hasta aquí y todo funciona, ¡felicitaciones! 🎉

Tu sistema SAD está:
- ✅ Instalado correctamente
- ✅ Base de datos configurada y poblada
- ✅ Backend corriendo en puerto 5001
- ✅ Frontend corriendo en puerto 3000
- ✅ Accesible desde la red local

**Próximos pasos:**
1. Cambiar la contraseña del administrador
2. Crear usuarios y configurar roles
3. Configurar oficinas y tipos de documento
4. Comenzar a digitalizar documentos

**URLs de acceso:**
- Frontend: http://192.168.18.21:3000 (reemplaza con tu IP)
- Backend API: http://192.168.18.21:5001/api
- Health Check: http://192.168.18.21:5001/api/health

---

**Última actualización:** Noviembre 2025
