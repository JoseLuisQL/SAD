# Comandos Rápidos de Referencia - Sistema SAD

## 🎯 Preparación Local - Comandos Esenciales

### Backend

```powershell
# Ir a la carpeta backend
cd C:\Proyectos\SAD\backend

# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Verificar tipos
npm run typecheck

# Compilar para producción
npm run build

# El resultado estará en: backend/dist/
```

### Frontend

```powershell
# Ir a la carpeta frontend
cd C:\Proyectos\SAD\frontend

# Instalar dependencias
npm install

# Compilar para producción
npm run build

# El resultado estará en: frontend/.next/
```

### Base de Datos

```powershell
# 1. Crear base de datos temporal local
# (ejecutar en MySQL Workbench o HeidiSQL)
DROP DATABASE IF EXISTS sad_produccion_temp;
CREATE DATABASE sad_produccion_temp;
USE sad_produccion_temp;

# 2. Configurar .env.temp con tu conexión
# Edita backend/.env.temp:
# DATABASE_URL=mysql://root:TU_PASSWORD@localhost:3306/sad_produccion_temp

# 3. Generar estructura desde schema.prisma
cd C:\Proyectos\SAD\backend
npx prisma db push --skip-generate

# 4. Crear usuario administrador inicial
npx ts-node prisma/seed-admin-only.ts

# 5. Exportar SQL (en MySQL Workbench):
# Server → Data Export → sad_produccion_temp
# - Estructura: Dump Structure Only → schema-produccion.sql
# - Datos admin: Dump Data Only (tablas roles y users) → admin-data.sql
```

### Exportar Esquema SQL

```powershell
# Opción 1: Via Prisma (solo estructura)
cd C:\Proyectos\SAD\backend
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > ..\schema-produccion.sql

# Opción 2: Via MySQL Workbench
# Server → Data Export → Export to Self-Contained File
```

---

## 📦 Comprimir Node Modules

```powershell
# Backend
cd C:\Proyectos\SAD\backend
powershell Compress-Archive -Path node_modules -DestinationPath node_modules.zip

# Frontend
cd C:\Proyectos\SAD\frontend
powershell Compress-Archive -Path node_modules -DestinationPath node_modules.zip
```

---

## 🔄 Actualizaciones Futuras

### Solo cambió el código (sin dependencias ni BD)

```powershell
# 1. Reconstruir backend
cd C:\Proyectos\SAD\backend
npm run build

# 2. Reconstruir frontend
cd C:\Proyectos\SAD\frontend
npm run build

# 3. Subir a cPanel (via FTP):
#    - Reemplazar: backend/dist/
#    - Reemplazar: frontend/.next/

# 4. Reiniciar apps en cPanel:
#    Setup Node.js App → Restart (ambas apps)
```

### Cambió el esquema de base de datos

```powershell
# 1. Crear migración
cd C:\Proyectos\SAD\backend
npx prisma migrate dev --name descripcion_cambio

# Esto crea: prisma/migrations/XXXXXX_descripcion_cambio/migration.sql

# 2. En cPanel → phpMyAdmin:
#    - Seleccionar base de datos
#    - Ir a "SQL"
#    - Copiar el contenido de migration.sql
#    - Ejecutar

# 3. Subir schema.prisma actualizado:
#    backend/prisma/schema.prisma

# 4. Reiniciar backend en cPanel
```

### Cambiaron dependencias

```powershell
# 1. Actualizar localmente
cd C:\Proyectos\SAD\backend
npm install

# 2. Reconstruir
npm run build

# 3. Comprimir node_modules
powershell Compress-Archive -Path node_modules -DestinationPath node_modules.zip

# 4. Subir y reemplazar node_modules.zip en cPanel

# 5. Descomprimir en cPanel

# 6. Reiniciar app en cPanel
```

---

## 🗄️ Backup Rápido

### Desde cPanel

```bash
# Base de datos
# phpMyAdmin → Seleccionar BD → Exportar → Método: Rápido
# Guardar como: backup-YYYY-MM-DD.sql

# Archivos
# Administrador de archivos → backend/uploads → Comprimir
# Descargar el archivo ZIP
```

### Restaurar Backup

```bash
# Base de datos
# phpMyAdmin → Seleccionar BD → Importar → Elegir archivo .sql

# Archivos
# Subir ZIP a backend/uploads/
# Click derecho → Extraer
```

---

## 🔍 Verificación Rápida

### Health Check Backend

```bash
# Abrir en navegador:
http://archivos.risvirgendecocharcas.gob.pe/api/health

# Respuesta esperada:
{
  "status": "ok",
  "timestamp": "...",
  "database": "connected",
  "version": "1.0.0"
}
```

### Ver Logs en cPanel

```bash
# cPanel → Setup Node.js App → [Seleccionar app] → Show logs
```

### Ver Estado de Apps

```bash
# cPanel → Setup Node.js App
# Verificar que ambas apps muestren: "Running" (verde)
```

---

## 🐛 Troubleshooting Rápido

### Backend no inicia

```powershell
# 1. Ver logs en cPanel
# 2. Verificar variables de entorno (especialmente DATABASE_URL)
# 3. Verificar que dist/ tiene archivos
# 4. Verificar que node_modules existe y está completo
# 5. Reiniciar app
```

### Frontend no inicia

```powershell
# 1. Ver logs en cPanel
# 2. Verificar que .next/standalone/ existe
# 3. Verificar que .next/standalone/server.js existe
# 4. Verificar que .next/standalone/.next/static/ existe
# 5. Verificar NEXT_PUBLIC_API_URL
# 6. Reiniciar app
```

### Error de base de datos

```sql
-- 1. Verificar en phpMyAdmin que la BD existe
SHOW DATABASES LIKE 'dchincheros_archivo_digital_disa';

-- 2. Verificar que el usuario tiene acceso
SELECT User, Host FROM mysql.user WHERE User = 'dchincheros_sad_user';

-- 3. Verificar privilegios
SHOW GRANTS FOR 'dchincheros_sad_user'@'localhost';
```

### Error al subir archivos

```powershell
# 1. Verificar permisos de carpeta uploads
# En cPanel → Administrador de archivos:
# backend/uploads → Permisos: 755

# 2. Verificar espacio disponible
# cPanel → Uso del disco

# 3. Ver logs del backend
# cPanel → Setup Node.js App → Backend → Show logs
```

---

## 📊 Información del Sistema

### Rutas en Producción

```bash
# Raíz del sitio
/home/dchincheros/archivos/

# Backend
/home/dchincheros/archivos/backend/
/home/dchincheros/archivos/backend/dist/
/home/dchincheros/archivos/backend/uploads/

# Frontend
/home/dchincheros/archivos/frontend/
/home/dchincheros/archivos/frontend/.next/

# Logs (puede variar según cPanel)
/home/dchincheros/logs/
```

### URLs

```bash
# Frontend principal
http://archivos.risvirgendecocharcas.gob.pe

# Backend API
http://archivos.risvirgendecocharcas.gob.pe/api

# Health check
http://archivos.risvirgendecocharcas.gob.pe/api/health

# Uploads
http://archivos.risvirgendecocharcas.gob.pe/uploads/documents/...
```

### Base de Datos

```bash
Host: localhost
Puerto: 3306
Base de datos: dchincheros_archivo_digital_disa
Usuario: dchincheros_sad_user
Contraseña: [guardada en .env.production]
```

### Usuario Administrador Inicial

```bash
URL: http://archivos.risvirgendecocharcas.gob.pe
Usuario: admin
Contraseña: Admin123!
⚠️ CAMBIAR INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN
```

---

## 🔐 Variables de Entorno Críticas

### Backend (.env.production)

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=mysql://dchincheros_sad_user:PASSWORD@localhost:3306/dchincheros_archivo_digital_disa
JWT_SECRET=OG9gLrsIbkJKwAnXTHhC6oWZecM4mF3f2iu1y8QYPtz5qlBxdNjSpDER0va7VU
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FIRMA_PERU_CLIENT_ID=PdTyHKL6kjIwNDkxMjQ0OTAwgoC3nFvbkA
FIRMA_PERU_CLIENT_SECRET=jjFbcPUHA5hrlYOO89MLftpNH8pRGEcXOnE
FIRMA_PERU_BACKEND_BASE_URL=http://archivos.risvirgendecocharcas.gob.pe/api/firma
NODE_OPTIONS=--max_old_space_size=512
```

### Frontend (.env.production)

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://archivos.risvirgendecocharcas.gob.pe/api
```

---

## 🚀 Comandos de Git (Opcional)

```powershell
# Ver cambios
git status
git diff

# Crear commit
git add .
git commit -m "Descripción de cambios"

# Ver historial
git log --oneline -10

# Crear tag de versión
git tag -a v1.0.0 -m "Versión inicial en producción"
git push origin v1.0.0
```

---

## 📋 Checklist Express (Copy-Paste)

```bash
# ========================================
# PREPARACIÓN LOCAL
# ========================================
cd C:\Proyectos\SAD\backend && npm install && npm run prisma:generate && npm run build
cd C:\Proyectos\SAD\frontend && npm install && npm run build

# ========================================
# COMPRIMIR NODE_MODULES
# ========================================
cd C:\Proyectos\SAD\backend && powershell Compress-Archive -Path node_modules -DestinationPath node_modules.zip
cd C:\Proyectos\SAD\frontend && powershell Compress-Archive -Path node_modules -DestinationPath node_modules.zip

# ========================================
# SUBIR A CPANEL (VIA FTP)
# ========================================
# backend/dist/ → /archivos/backend/dist/
# backend/prisma/schema.prisma → /archivos/backend/prisma/
# backend/package*.json → /archivos/backend/
# backend/.env.production → /archivos/backend/
# backend/node_modules.zip → /archivos/backend/
# backend/*.traineddata → /archivos/backend/
#
# frontend/.next/ → /archivos/frontend/.next/
# frontend/public/ → /archivos/frontend/public/
# frontend/package*.json → /archivos/frontend/
# frontend/.env.production → /archivos/frontend/
# frontend/node_modules.zip → /archivos/frontend/

# ========================================
# CONFIGURAR EN CPANEL
# ========================================
# 1. Descomprimir node_modules.zip (ambos)
# 2. Setup Node.js App (backend y frontend)
# 3. Configurar variables de entorno
# 4. Restart ambas apps
# 5. Verificar: http://archivos.risvirgendecocharcas.gob.pe/api/health
# 6. Login: admin / Admin123!
```

---

**Última actualización**: Noviembre 2025  
**Sistema**: SAD - Sistema Integrado de Archivos Digitales  
**Versión**: 1.0.0
