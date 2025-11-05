# ✅ Checklist de Despliegue Rápido - Sistema SAD

> **Imprime esta página y ve marcando cada paso conforme lo completas**

---

## 📝 FASE 1: PREPARACIÓN LOCAL (Tu Computadora)

### Construir Backend
- [ ] `cd C:\Proyectos\SAD\backend`
- [ ] `npm install`
- [ ] `npm run prisma:generate`
- [ ] `npm run build`
- [ ] ✓ Verificar que existe `backend/dist/`

### Construir Frontend
- [ ] `cd C:\Proyectos\SAD\frontend`
- [ ] `npm install`
- [ ] `npm run build`
- [ ] ✓ Verificar que existe `frontend/.next/standalone/`

### Preparar Base de Datos
- [ ] Crear BD temporal local: `sad_produccion_temp` (MySQL Workbench)
- [ ] Actualizar `backend/.env.temp` con contraseña MySQL correcta
- [ ] `npx prisma db push --skip-generate` (genera tablas)
- [ ] `npx ts-node prisma/seed-admin-only.ts` (crea admin)
- [ ] MySQL Workbench: Exportar estructura → `schema-produccion.sql`
- [ ] MySQL Workbench: Exportar datos (roles + users) → `admin-data.sql`

### Organizar Archivos
- [ ] Crear carpeta `DEPLOY_PRODUCCION`
- [ ] Copiar `backend/dist/` completo
- [ ] Copiar `backend/prisma/schema.prisma`
- [ ] Copiar `backend/package.json` y `package-lock.json`
- [ ] Copiar `backend/.env.production`
- [ ] Copiar archivos OCR: `spa.traineddata`, `eng.traineddata`
- [ ] Comprimir `backend/node_modules` → `node_modules.zip`
- [ ] Copiar `frontend/.next/` completo
- [ ] Copiar `frontend/public/`
- [ ] Copiar `frontend/package.json` y `package-lock.json`
- [ ] Copiar `frontend/.env.production`
- [ ] Comprimir `frontend/node_modules` → `node_modules.zip`
- [ ] Crear `.htaccess`

---

## 🌐 FASE 2: CONFIGURACIÓN DE CPANEL

### Base de Datos MySQL
- [ ] cPanel → **Bases de datos MySQL**
- [ ] Crear BD: `dchincheros_archivo_digital_disa`
- [ ] Crear usuario: `dchincheros_sad_user`
- [ ] Contraseña: `___________________________` (anota aquí)
- [ ] Asignar usuario a BD con **TODOS LOS PRIVILEGIOS**
- [ ] phpMyAdmin → Importar `schema-produccion.sql`
- [ ] phpMyAdmin → Importar `admin-data.sql`
- [ ] ✓ Verificar tablas creadas (debe haber ~20 tablas)

### Subdominio
- [ ] cPanel → **Dominios**
- [ ] Verificar subdominio: `archivos.risvirgendecocharcas.gob.pe`
- [ ] Anotar ruta: `/home/___________/archivos`

### Estructura de Directorios
- [ ] Administrador de archivos → Crear `/archivos/backend`
- [ ] Crear `/archivos/backend/uploads`
- [ ] Crear `/archivos/backend/uploads/documents`
- [ ] Crear `/archivos/backend/uploads/system`
- [ ] Crear `/archivos/backend/prisma`
- [ ] Crear `/archivos/frontend`
- [ ] Crear `/archivos/tmp`

---

## 📤 FASE 3: SUBIR ARCHIVOS (FTP o Administrador de Archivos)

### Backend
- [ ] Subir carpeta `dist/` completa → `/archivos/backend/dist/`
- [ ] Subir `prisma/schema.prisma` → `/archivos/backend/prisma/`
- [ ] Subir `package.json` y `package-lock.json` → `/archivos/backend/`
- [ ] Subir `spa.traineddata` y `eng.traineddata` → `/archivos/backend/`
- [ ] Subir `.env.production` → `/archivos/backend/`
- [ ] Subir `node_modules.zip` → `/archivos/backend/`
- [ ] Descomprimir `node_modules.zip` (en cPanel)
- [ ] Eliminar `node_modules.zip` (después de descomprimir)

### Frontend
- [ ] Subir carpeta `.next/` completa → `/archivos/frontend/.next/`
- [ ] Subir carpeta `public/` → `/archivos/frontend/public/`
- [ ] Subir `package.json` y `package-lock.json` → `/archivos/frontend/`
- [ ] Subir `.env.production` → `/archivos/frontend/`
- [ ] Subir `node_modules.zip` → `/archivos/frontend/`
- [ ] Descomprimir `node_modules.zip` (en cPanel)
- [ ] Eliminar `node_modules.zip` (después de descomprimir)

### Archivos Estáticos (IMPORTANTE)
- [ ] Copiar `/frontend/.next/static/` → `/frontend/.next/standalone/.next/static/`
- [ ] Copiar `/frontend/public/` → `/frontend/.next/standalone/public/`

### Configuración
- [ ] Subir `.htaccess` → `/archivos/.htaccess`

### Permisos
- [ ] `backend/uploads` → Permisos **755**
- [ ] `backend/uploads/documents` → Permisos **755**
- [ ] `backend/uploads/system` → Permisos **755**

---

## ⚙️ FASE 4: CONFIGURAR NODE.JS APPS

### Backend Application
- [ ] cPanel → **Setup Node.js App** → **Create Application**
- [ ] Node.js version: **18.x** (la más reciente disponible)
- [ ] Application mode: **Production**
- [ ] Application root: `/home/______/archivos/backend`
- [ ] Application URL: `archivos.risvirgendecocharcas.gob.pe/api`
- [ ] Application startup file: `dist/server.js`
- [ ] Click **Create**
- [ ] Anotar puerto asignado: `__________` (ej: 5001)

### Backend - Variables de Entorno
- [ ] Click en **Environment variables**
- [ ] Agregar: `NODE_ENV` = `production`
- [ ] Agregar: `PORT` = `__________` (el puerto asignado)
- [ ] Agregar: `DATABASE_URL` = `mysql://dchincheros_sad_user:PASSWORD@localhost:3306/dchincheros_archivo_digital_disa`
- [ ] Agregar: `JWT_SECRET` = (tu secreto)
- [ ] Agregar: `JWT_EXPIRES_IN` = `15m`
- [ ] Agregar: `JWT_REFRESH_EXPIRES_IN` = `7d`
- [ ] Agregar todas las variables de **FIRMA_PERU_***
- [ ] Agregar: `NODE_OPTIONS` = `--max_old_space_size=512`
- [ ] Click **Save**

### Frontend Application
- [ ] cPanel → **Setup Node.js App** → **Create Application**
- [ ] Node.js version: **18.x** (la misma que el backend)
- [ ] Application mode: **Production**
- [ ] Application root: `/home/______/archivos/frontend`
- [ ] Application URL: `archivos.risvirgendecocharcas.gob.pe`
- [ ] Application startup file: `.next/standalone/server.js`
- [ ] Click **Create**
- [ ] Anotar puerto asignado: `__________` (ej: 3000)

### Frontend - Variables de Entorno
- [ ] Click en **Environment variables**
- [ ] Agregar: `NODE_ENV` = `production`
- [ ] Agregar: `PORT` = `__________` (el puerto asignado)
- [ ] Agregar: `NEXT_PUBLIC_API_URL` = `http://archivos.risvirgendecocharcas.gob.pe/api`
- [ ] Click **Save**

### Actualizar .htaccess con Puertos Reales
- [ ] Editar `/archivos/.htaccess`
- [ ] Reemplazar `PUERTO_BACKEND` con el puerto real (ej: 5001)
- [ ] Reemplazar `PUERTO_FRONTEND` con el puerto real (ej: 3000)
- [ ] Guardar

### Reiniciar Aplicaciones
- [ ] Backend → Click **Restart** → Estado: **Running** ✓
- [ ] Frontend → Click **Restart** → Estado: **Running** ✓

---

## 🔍 FASE 5: VERIFICACIÓN

### Backend
- [ ] Abrir: `http://archivos.risvirgendecocharcas.gob.pe/api/health`
- [ ] ✓ Respuesta JSON con `status: "ok"` y `database: "connected"`
- [ ] Si falla: Revisar logs en cPanel → Setup Node.js App → Backend → **Show logs**

### Frontend
- [ ] Abrir: `http://archivos.risvirgendecocharcas.gob.pe`
- [ ] ✓ Ver página de login del sistema
- [ ] Si falla: Revisar logs en cPanel → Setup Node.js App → Frontend → **Show logs**

### Login
- [ ] Usuario: `admin`
- [ ] Contraseña: `Admin123!`
- [ ] ✓ Login exitoso
- [ ] **INMEDIATAMENTE** cambiar contraseña desde el perfil

### Funcionalidades Básicas
- [ ] Crear una oficina de prueba
- [ ] Crear un tipo de documento de prueba
- [ ] Subir un documento de prueba
- [ ] Verificar que el archivo se guardó en `backend/uploads/documents/`
- [ ] Descargar el documento
- [ ] ✓ Todo funciona correctamente

---

## 📊 FASE 6: POST-DESPLIEGUE

### Backup Inicial
- [ ] phpMyAdmin → Exportar base de datos → `backup-inicial-YYYY-MM-DD.sql`
- [ ] Descargar carpeta `backend/uploads/` (vía FTP)
- [ ] Guardar credenciales en gestor de contraseñas seguro

### Documentación
- [ ] Anotar URL de producción: `http://archivos.risvirgendecocharcas.gob.pe`
- [ ] Anotar credenciales de BD en lugar seguro
- [ ] Anotar puertos asignados por cPanel
- [ ] Anotar fecha de despliegue: `_______________`

### Configuración Inicial del Sistema
- [ ] Login como admin
- [ ] Ir a Configuración → Datos de la Empresa
- [ ] Actualizar nombre de la institución
- [ ] Subir logo institucional
- [ ] Configurar datos de contacto
- [ ] Crear usuarios adicionales (operadores, consultores)
- [ ] Crear oficinas reales
- [ ] Crear tipos de documentos reales
- [ ] Crear períodos (años)

---

## 🎯 CHECKLIST FINAL

- [ ] ✅ Base de datos funcionando
- [ ] ✅ Backend respondiendo en `/api/health`
- [ ] ✅ Frontend mostrando interfaz
- [ ] ✅ Login funcional
- [ ] ✅ Carga de documentos funcional
- [ ] ✅ Descarga de documentos funcional
- [ ] ✅ Permisos de carpetas correctos
- [ ] ✅ Ambas apps en estado "Running"
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Backup inicial creado
- [ ] ✅ Contraseña de admin cambiada
- [ ] ✅ Documentación completa

---

## 🚨 SI ALGO FALLA

### Backend no responde
1. [ ] Verificar estado en cPanel → Setup Node.js App
2. [ ] Revisar logs: **Show logs**
3. [ ] Verificar variables de entorno
4. [ ] Verificar que `DATABASE_URL` es correcta
5. [ ] Reiniciar aplicación

### Frontend no responde
1. [ ] Verificar estado en cPanel → Setup Node.js App
2. [ ] Revisar logs: **Show logs**
3. [ ] Verificar que archivos estáticos existen
4. [ ] Verificar `NEXT_PUBLIC_API_URL`
5. [ ] Reiniciar aplicación

### Error de base de datos
1. [ ] Verificar en phpMyAdmin que la BD existe
2. [ ] Verificar que el usuario tiene privilegios
3. [ ] Verificar `DATABASE_URL` en variables de entorno
4. [ ] Probar conexión desde phpMyAdmin

### Error al subir archivos
1. [ ] Verificar permisos de `uploads/` (755)
2. [ ] Verificar espacio disponible en hosting
3. [ ] Revisar logs del backend

---

## 📞 CONTACTOS DE EMERGENCIA

**Hosting/cPanel:**
- Soporte: _________________________
- Usuario cPanel: __________________
- Teléfono: ________________________

**Desarrollador:**
- Nombre: __________________________
- Email: ___________________________
- Teléfono: ________________________

---

## ⏱️ TIEMPO ESTIMADO POR FASE

- Fase 1 (Preparación Local): **30-45 min**
- Fase 2 (Configuración cPanel): **15-20 min**
- Fase 3 (Subir Archivos): **45-90 min** (depende de velocidad de internet)
- Fase 4 (Configurar Apps): **20-30 min**
- Fase 5 (Verificación): **15-20 min**
- Fase 6 (Post-Despliegue): **30-40 min**

**TOTAL ESTIMADO: 3-4 horas**

---

**Fecha de despliegue**: _______________  
**Realizado por**: _______________  
**Versión desplegada**: 1.0.0  
**Estado**: ⬜ En proceso  ⬜ Completado ⬜ Con errores

---

🎉 **¡FELICIDADES! Sistema desplegado exitosamente**
