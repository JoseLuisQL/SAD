# Checklist de Configuración cPanel - SAD

Usa esta lista para verificar que todos los pasos de configuración se completaron correctamente.

## Pre-requisitos

- [ ] Acceso a cPanel obtenido (usuario y contraseña)
- [ ] Dominio `archivos.risvirgendecocharcas.gob.pe` apunta a servidor (DNS configurado)
- [ ] SSL/TLS certificate instalado para el dominio
- [ ] Node.js >= 18 disponible en cPanel
- [ ] SSH access habilitado (opcional pero recomendado)
- [ ] Git instalado en el servidor

## 1. Aplicaciones Node.js en cPanel

### Backend
- [ ] Aplicación `sad-backend` creada en cPanel > Setup Node.js App
- [ ] Node.js version: 18.x o superior seleccionada
- [ ] Application Mode: **Production**
- [ ] Application Root: `/home/USUARIO/apps/sad/backend`
- [ ] Application Startup File: `dist/server.js`
- [ ] Puerto asignado documentado: _______
- [ ] Aplicación en estado **Running**

### Frontend
- [ ] Aplicación `sad-frontend` creada en cPanel > Setup Node.js App
- [ ] Node.js version: 18.x (misma que backend)
- [ ] Application Mode: **Production**
- [ ] Application Root: `/home/USUARIO/apps/sad/frontend`
- [ ] Application Startup File: `.next/standalone/server.js`
- [ ] Puerto asignado documentado: _______
- [ ] Aplicación en estado **Running**

## 2. Subdominios y DNS

- [ ] Subdominio `api` creado (api.archivos.risvirgendecocharcas.gob.pe)
- [ ] Document root del subdominio configurado
- [ ] Registro DNS A para subdominio API verificado
- [ ] Propagación DNS completada (puede tomar 24-48h)
- [ ] SSL/TLS certificate activo para subdominio API
- [ ] SSL/TLS certificate activo para dominio principal

## 3. Variables de Entorno

### Backend (cPanel > Setup Node.js App > sad-backend > Environment Variables)
- [ ] `NODE_ENV=production`
- [ ] `PORT=[PUERTO_ASIGNADO]`
- [ ] `DATABASE_URL=mysql://...` configurado con credenciales reales
- [ ] `JWT_SECRET` generado (64+ caracteres aleatorios)
- [ ] `JWT_EXPIRES_IN=15m`
- [ ] `JWT_REFRESH_EXPIRES_IN=7d`
- [ ] `FIRMA_PERU_API_URL` configurado
- [ ] `FIRMA_PERU_CREDENTIAL` configurado
- [ ] `FIRMA_PERU_CLIENT_ID` configurado
- [ ] `FIRMA_PERU_CLIENT_SECRET` configurado
- [ ] `FIRMA_PERU_TOKEN_URL` configurado
- [ ] `FIRMA_PERU_CLIENT_WEB_URL` configurado
- [ ] `FIRMA_PERU_LOCAL_SERVER_PORT=48596`
- [ ] `FIRMA_PERU_BACKEND_BASE_URL` configurado con dominio público
- [ ] `FIRMA_PERU_ONE_TIME_TOKEN_SECRET` generado (64+ caracteres)
- [ ] `NODE_OPTIONS=--max_old_space_size=512` (si hay límites de memoria)

### Frontend (cPanel > Setup Node.js App > sad-frontend > Environment Variables)
- [ ] `NODE_ENV=production`
- [ ] `PORT=[PUERTO_ASIGNADO]`
- [ ] `NEXT_PUBLIC_API_URL=https://archivos.risvirgendecocharcas.gob.pe/api`
- [ ] `NODE_OPTIONS=--max_old_space_size=512` (si hay límites de memoria)

## 4. Base de Datos MySQL

- [ ] Base de datos `archivo_digital_disa` creada
- [ ] Usuario `sad_user` (o similar) creado
- [ ] Password fuerte generado y documentado de forma segura
- [ ] Privilegios ALL PRIVILEGES asignados al usuario
- [ ] Conexión probada: `mysql -u sad_user -p archivo_digital_disa`
- [ ] URL de conexión actualizada en variables de entorno del backend

## 5. Estructura de Directorios

Via SSH, verificar:
- [ ] `/home/USUARIO/apps/sad/` existe
- [ ] `/home/USUARIO/apps/sad/backend/` existe
- [ ] `/home/USUARIO/apps/sad/frontend/` existe
- [ ] `/home/USUARIO/apps/sad/logs/backend/` creado con permisos 755
- [ ] `/home/USUARIO/apps/sad/logs/frontend/` creado con permisos 755
- [ ] `/home/USUARIO/apps/sad/backend/uploads/documents/` creado con permisos 755
- [ ] `/home/USUARIO/apps/sad/backend/temp/` creado
- [ ] `/home/USUARIO/apps/sad/backend/backups/` creado

## 6. Instalación y Build

### Backend
- [ ] `cd /home/USUARIO/apps/sad/backend`
- [ ] `npm ci` ejecutado sin errores
- [ ] `npx prisma generate` ejecutado
- [ ] `npm run build:prod` ejecutado sin errores
- [ ] `dist/server.js` existe
- [ ] `dist/` contiene todos los archivos compilados

### Frontend
- [ ] `cd /home/USUARIO/apps/sad/frontend`
- [ ] `npm ci` ejecutado sin errores
- [ ] `npm run build:prod` ejecutado sin errores
- [ ] `.next/standalone/` existe
- [ ] `.next/standalone/server.js` existe

## 7. Migraciones de Base de Datos

- [ ] `cd /home/USUARIO/apps/sad/backend`
- [ ] `npx prisma migrate deploy` ejecutado sin errores
- [ ] Todas las 8 migraciones aplicadas correctamente
- [ ] (Opcional) `npm run prisma:seed` ejecutado para datos iniciales
- [ ] Usuario admin creado o verificado

## 8. Configuración de Proxy (.htaccess)

### Backend (Subdominio API)
- [ ] `.htaccess` creado en document root de `api.archivos.risvirgendecocharcas.gob.pe`
- [ ] Puerto correcto configurado en ProxyPass (PUERTO_BACKEND)
- [ ] Redirect HTTPS configurado
- [ ] Headers de seguridad configurados

### Frontend (Dominio Principal)
- [ ] `.htaccess` creado en `/home/USUARIO/public_html/`
- [ ] Puerto correcto configurado en ProxyPass (PUERTO_FRONTEND)
- [ ] Redirect HTTPS configurado
- [ ] Reglas de caching configuradas
- [ ] Headers de seguridad configurados

## 9. Logs

- [ ] Directorio de logs tiene permisos correctos (755)
- [ ] `logs/backend/out.log` se está generando
- [ ] `logs/backend/error.log` se está generando
- [ ] `logs/frontend/out.log` se está generando
- [ ] `logs/frontend/error.log` se está generando
- [ ] (Opcional) Rotación de logs configurada con cron

## 10. Process Manager

**Si usas PM2:**
- [ ] PM2 instalado globalmente: `npm install -g pm2`
- [ ] `ecosystem.config.js` configurado con puertos correctos
- [ ] `pm2 start ecosystem.config.js` ejecutado
- [ ] `pm2 save` ejecutado
- [ ] `pm2 startup` ejecutado y comando agregado a startup
- [ ] `pm2 list` muestra ambas apps en estado **online**

**Si usas Passenger:**
- [ ] `Passengerfile.json` creado en backend
- [ ] `Passengerfile.json` creado en frontend
- [ ] Aplicaciones reiniciadas en cPanel

**Si usas cPanel Node.js App Manager:**
- [ ] Ambas aplicaciones muestran estado **Running** en cPanel
- [ ] Logs visibles en cPanel Node.js App interface

## 11. Verificación de Conectividad

### Tests Locales (via SSH)
- [ ] Backend: `curl http://localhost:PUERTO_BACKEND/api/health` retorna 200
- [ ] Frontend: `curl http://localhost:PUERTO_FRONTEND/` retorna HTML

### Tests Públicos
- [ ] Backend: `curl https://api.archivos.risvirgendecocharcas.gob.pe/api/health` retorna 200
- [ ] Frontend: `curl https://archivos.risvirgendecocharcas.gob.pe/` retorna HTML
- [ ] Browser: Abrir `https://archivos.risvirgendecocharcas.gob.pe` carga correctamente
- [ ] Browser: Abrir `https://api.archivos.risvirgendecocharcas.gob.pe/api/health` retorna JSON

### Tests Funcionales
- [ ] Login page carga: `https://archivos.risvirgendecocharcas.gob.pe/login`
- [ ] Login funciona con usuario de prueba
- [ ] Dashboard carga correctamente tras login
- [ ] Carga de documento de prueba funciona
- [ ] API responde a request autenticado

## 12. Seguridad

- [ ] HTTPS forzado en ambos dominios
- [ ] Certificados SSL válidos y no expirados
- [ ] Headers de seguridad configurados (X-Frame-Options, CSP, etc.)
- [ ] Secrets (JWT_SECRET, tokens) generados con valores aleatorios fuertes
- [ ] Credenciales de base de datos no expuestas en Git
- [ ] Variables de entorno con valores de producción (no placeholders)
- [ ] CORS configurado correctamente (solo dominio principal permitido)
- [ ] Directorio listing deshabilitado (Options -Indexes)

## 13. Monitoring y Mantenimiento

- [ ] Configurar alertas de uptime (UptimeRobot, Pingdom, etc.)
- [ ] Configurar backup automático de base de datos
- [ ] Configurar backup de directorio uploads/
- [ ] Documentar procedimiento de rollback
- [ ] Crear cron job para limpiar logs antiguos
- [ ] Verificar límites de disco y configurar alertas

## 14. Documentación

- [ ] Puertos documentados en archivo `PUERTOS.txt`
- [ ] Credenciales guardadas en gestor de passwords seguro
- [ ] Procedimiento de actualización documentado
- [ ] Contactos de soporte técnico documentados
- [ ] Runbook de incidentes creado

## 15. Post-Despliegue

- [ ] Smoke tests ejecutados exitosamente
- [ ] Health checks configurados
- [ ] Monitoreo activo por 24 horas
- [ ] Sin errores críticos en logs
- [ ] Performance aceptable (tiempos de respuesta < 2s)
- [ ] Capacitación a usuarios administradores completada

---

## Notas Adicionales

**Fecha de Configuración:** _____________

**Configurado por:** _____________

**Puertos Asignados:**
- Backend: _______
- Frontend: _______

**Incidencias durante configuración:**
```
(Documentar cualquier problema encontrado y su solución)
```

**Optimizaciones pendientes:**
```
(Lista de mejoras a implementar en el futuro)
```

---

## Estado Final

- [ ] **Configuración 100% completada**
- [ ] **Sistema en producción y operativo**
- [ ] **Monitoreo activo**
- [ ] **Equipo notificado y capacitado**

---

**Firma de Aprobación:**

Nombre: _____________
Cargo: _____________
Fecha: _____________
Firma: _____________
