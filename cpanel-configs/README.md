# Archivos de Configuración para cPanel

Este directorio contiene todos los archivos de configuración necesarios para desplegar el Sistema SAD en cPanel.

## Índice de Archivos

### 1. Documentación Principal

**`../GUIA-CONFIGURACION-CPANEL.md`**
- Guía completa paso a paso para configurar cPanel
- Configuración de aplicaciones Node.js
- Configuración de subdominios y DNS
- Variables de entorno detalladas
- Troubleshooting y resolución de problemas

### 2. Configuración de Proxy

**`htaccess-backend.txt`**
- Archivo `.htaccess` para el subdominio API (backend)
- Configurar proxy hacia aplicación Node.js backend
- Headers de seguridad
- Redirect HTTPS
- CORS configurado

**Ubicación en servidor:** `/home/USUARIO/apps/sad/backend/public/.htaccess`

---

**`htaccess-frontend.txt`**
- Archivo `.htaccess` para el dominio principal (frontend)
- Configurar proxy hacia aplicación Node.js frontend
- Cache control para assets estáticos
- Compresión Gzip
- Headers de seguridad

**Ubicación en servidor:** `/home/USUARIO/public_html/.htaccess`

### 3. Gestores de Procesos

**`ecosystem.config.js`**
- Configuración de PM2 para ambas aplicaciones
- Manejo de logs
- Reinicio automático
- Límites de memoria

**Uso:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

**`Passengerfile-backend.json`**
- Configuración de Passenger para backend
- Alternativa a PM2

**Ubicación en servidor:** `/home/USUARIO/apps/sad/backend/Passengerfile.json`

---

**`Passengerfile-frontend.json`**
- Configuración de Passenger para frontend
- Alternativa a PM2

**Ubicación en servidor:** `/home/USUARIO/apps/sad/frontend/Passengerfile.json`

### 4. Scripts de Instalación

**`setup-cpanel.sh`**
- Script automatizado de configuración inicial
- Crea directorios necesarios
- Instala dependencias
- Compila backend y frontend
- Genera archivos de configuración

**Uso:**
```bash
# Editar el script primero y actualizar variables
nano setup-cpanel.sh

# Ejecutar
bash setup-cpanel.sh
```

### 5. Checklist de Verificación

**`CHECKLIST-CPANEL.md`**
- Lista completa de verificación con 150+ items
- Organizada por secciones
- Pre-requisitos, configuración, verificación
- Post-despliegue y monitoring

**Uso:** Imprimir o usar como guía durante la configuración.

---

## Flujo de Trabajo Recomendado

### Paso 1: Preparación
1. Leer `../GUIA-CONFIGURACION-CPANEL.md` completamente
2. Verificar pre-requisitos en `CHECKLIST-CPANEL.md`
3. Obtener credenciales necesarias (cPanel, MySQL, Firma Perú)

### Paso 2: Configuración Manual en cPanel
1. Crear aplicaciones Node.js (sad-backend y sad-frontend)
2. Documentar puertos asignados
3. Configurar variables de entorno
4. Crear subdominio API
5. Crear base de datos MySQL

### Paso 3: Despliegue via SSH
1. Clonar repositorio
2. Editar y ejecutar `setup-cpanel.sh`
3. Ejecutar migraciones: `npx prisma migrate deploy`
4. Copiar archivos `.htaccess` desde `htaccess-*.txt`

### Paso 4: Iniciar Aplicaciones
**Opción A - PM2:**
```bash
cp ecosystem.config.js /home/USUARIO/apps/sad/
cd /home/USUARIO/apps/sad
pm2 start ecosystem.config.js
```

**Opción B - Passenger:**
```bash
cp Passengerfile-backend.json /home/USUARIO/apps/sad/backend/Passengerfile.json
cp Passengerfile-frontend.json /home/USUARIO/apps/sad/frontend/Passengerfile.json
# Reiniciar en cPanel Node.js App Manager
```

**Opción C - cPanel Node.js App Manager:**
```
Ir a cPanel > Setup Node.js App
Click "Restart" en cada aplicación
```

### Paso 5: Verificación
1. Usar `CHECKLIST-CPANEL.md` para verificar cada paso
2. Ejecutar tests de conectividad
3. Verificar logs
4. Monitorear por 24 horas

---

## Personalización

Antes de usar estos archivos, buscar y reemplazar:

- `USUARIO` → Tu usuario de cPanel
- `49152` → Puerto asignado al backend por cPanel
- `49153` → Puerto asignado al frontend por cPanel
- `CAMBIAR_*` → Valores específicos de tu configuración

---

## Troubleshooting Rápido

### Aplicación no inicia
1. Verificar logs en cPanel Node.js App
2. Verificar que `dist/server.js` existe (backend)
3. Verificar que `.next/standalone/server.js` existe (frontend)
4. Verificar variables de entorno configuradas

### Proxy no funciona (404)
1. Verificar que mod_proxy está habilitado (contactar soporte)
2. Verificar puerto correcto en `.htaccess`
3. Verificar logs de Apache: `/home/USUARIO/logs/error_log`
4. Probar acceso directo: `curl http://localhost:PUERTO`

### Error de base de datos
1. Verificar `DATABASE_URL` en variables de entorno
2. Probar conexión: `mysql -u sad_user -p archivo_digital_disa`
3. Verificar que migraciones se ejecutaron: `npx prisma migrate status`

---

## Soporte

Para problemas adicionales, consultar:
- `../GUIA-CONFIGURACION-CPANEL.md` sección 9: Troubleshooting
- `../AUDITORIA-PRODUCCION.md` para información del sistema
- `../ESTRATEGIA-BUILD-PRODUCCION.md` para detalles de build

---

## Actualizaciones

Estos archivos de configuración son para la versión inicial del despliegue.

**Última actualización:** 5 de Noviembre, 2025  
**Versión SAD:** 1.0.0  
**Node.js requerido:** >= 18.0.0
