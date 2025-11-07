# Guía de Despliegue en Producción - SAD Frontend

## 📋 Pre-requisitos

- Node.js 20+ instalado
- npm instalado
- Build del backend funcionando y accesible
- Puerto 3000 disponible (o configurar otro puerto)

## 🚀 Pasos para Despliegue

### 1. Configurar Variables de Entorno

Edita el archivo `.env.production` con la URL de tu backend:

```bash
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
```

**Importante:** 
- NO incluyas slash final en la URL
- Debe ser la URL completa incluyendo `/api`
- Ejemplos válidos:
  - `https://archivos.risvirgendecocharcas.gob.pe/api`
  - `http://192.168.1.100:4000/api`

### 2. Instalar Dependencias

```bash
npm install --production=false
```

### 3. Construir para Producción

#### Opción A: Usando el script PowerShell (Recomendado)
```powershell
.\build-production.ps1
```

#### Opción B: Usando npm directamente
```bash
npm run build
```

Esto generará:
- Archivos optimizados en `.next/`
- Build en modo standalone
- Assets estáticos optimizados

### 4. Iniciar Servidor de Producción

#### Opción A: Usando el script PowerShell
```powershell
.\start-production.ps1
```

#### Opción B: Usando npm directamente
```bash
npm run start
```

El servidor estará disponible en `http://localhost:3000`

## 🔧 Configuración Avanzada

### Cambiar Puerto

Puedes especificar un puerto diferente:

```bash
$env:PORT=8080; npm run start
```

O en Linux/Mac:
```bash
PORT=8080 npm run start
```

### Variables de Entorno Adicionales

Crea un archivo `.env.production.local` (este archivo NO se versiona en git):

```bash
# .env.production.local
NEXT_PUBLIC_API_URL=https://tu-backend-real.com/api
```

## 📦 Estructura de Build

```
.next/
├── standalone/       # Aplicación standalone (incluye node_modules necesarios)
├── static/          # Assets estáticos
└── cache/           # Cache de build
```

## 🐛 Solución de Problemas

### Error: "Puerto ya en uso"

Cambia el puerto o cierra la aplicación que lo está usando:

```powershell
# Ver qué proceso usa el puerto 3000
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el ID del proceso)
taskkill /PID <PID> /F
```

### Error: "Cannot find module"

Reinstala dependencias:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Error de conexión con el backend

Verifica:
1. Backend está corriendo y accesible
2. URL en `.env.production` es correcta
3. No hay problemas de CORS en el backend
4. Firewall permite la conexión

## 🔐 Seguridad en Producción

1. **HTTPS:** Usa un reverse proxy (Nginx, Caddy) para servir con HTTPS
2. **Firewall:** Configura reglas para permitir solo puertos necesarios
3. **Variables de Entorno:** Nunca subas `.env.production.local` a git
4. **Headers de Seguridad:** El backend debe configurar CORS apropiadamente

## 🔄 Actualización de la Aplicación

Para actualizar a una nueva versión:

```bash
# 1. Obtener últimos cambios
git pull origin main

# 2. Instalar nuevas dependencias (si las hay)
npm install

# 3. Reconstruir
npm run build

# 4. Reiniciar servidor
# Detén el servidor actual (Ctrl+C) y ejecuta:
npm run start
```

## 📊 Monitoreo

### Health Check

Verifica que el frontend esté funcionando:

```bash
curl http://localhost:3000
```

### Logs

Los logs de Next.js se muestran en la consola. Para producción, considera:

- Redirigir logs a un archivo:
  ```bash
  npm run start > logs/frontend.log 2>&1
  ```

- Usar PM2 para gestión de procesos:
  ```bash
  npm install -g pm2
  pm2 start "npm run start" --name sad-frontend
  pm2 logs sad-frontend
  ```

## 🌐 Despliegue con Reverse Proxy (Nginx)

Ejemplo de configuración Nginx:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 📱 Optimizaciones de Producción Aplicadas

- ✅ Output standalone para despliegue optimizado
- ✅ Compresión habilitada
- ✅ Headers de seguridad (X-Powered-By removido)
- ✅ Imágenes en formato AVIF/WebP
- ✅ Restricción de imágenes HTTP solo en desarrollo
- ✅ Webpack optimizado para react-pdf

## 📞 Soporte

Para problemas o dudas, contacta al equipo de desarrollo.
