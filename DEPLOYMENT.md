# 🚀 Guía de Despliegue - Sistema SAD

Guía completa para desplegar el Sistema Integrado de Archivos Digitales en Railway (Backend + MySQL) y Vercel (Frontend).

---

## 📋 Requisitos Previos

- [x] Cuenta en [Railway.app](https://railway.app) (gratuita)
- [x] Cuenta en [Vercel](https://vercel.com) (gratuita)
- [x] Cuenta en [GitHub](https://github.com) (para desplegar desde repositorio)
- [x] Código subido a GitHub

---

## 🗄️ PASO 1: Desplegar MySQL en Railway

### 1.1 Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app)
2. Click en **"New Project"**
3. Selecciona **"Provision MySQL"**
4. Espera a que se cree el servicio (1-2 minutos)

### 1.2 Obtener DATABASE_URL

1. Click en el servicio **MySQL**
2. Ve a la pestaña **"Variables"**
3. Copia el valor de **`DATABASE_URL`** (algo como: `mysql://root:xxxxx@containers-us-west-xxx.railway.app:6565/railway`)
4. **Guarda este valor**, lo necesitarás más tarde

### 1.3 Configurar Base de Datos

La base de datos se creará automáticamente cuando despliegues el backend con Prisma Migrate.

---

## 🖥️ PASO 2: Desplegar Backend en Railway

### 2.1 Añadir Backend al Proyecto

1. En el mismo proyecto de Railway, click en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Autoriza a Railway a acceder a tu repositorio
4. Selecciona tu repositorio **SAD**
5. Railway detectará automáticamente que es un proyecto Node.js

### 2.2 Configurar Variables de Entorno

1. Click en el servicio del **Backend**
2. Ve a **"Variables"**
3. Click en **"RAW Editor"**
4. Pega las siguientes variables (reemplaza los valores):

```env
NODE_ENV=production
DATABASE_URL=${{MySQL.DATABASE_URL}}
JWT_SECRET=GENERA_UN_SECRET_ALEATORIO_AQUI_32_CHARS
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FIRMA_PERU_API_URL=http://[TU_IP_VALIDADOR]:8080/validador/api
FIRMA_PERU_CREDENTIAL=tu-credential-aqui
FIRMA_PERU_CLIENT_ID=tu-client-id
FIRMA_PERU_CLIENT_SECRET=tu-client-secret
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596
FIRMA_PERU_BACKEND_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=OTRO_SECRET_ALEATORIO_AQUI
```

**💡 Generar JWT_SECRET:**
Abre una terminal y ejecuta:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Configurar Build Settings

1. En el servicio Backend, ve a **"Settings"**
2. En **"Root Directory"**, escribe: `backend`
3. En **"Build Command"**, deja: `npm ci && npm run build:prod`
4. En **"Start Command"**, deja: `npm run start:prod`
5. Click **"Save Config"**

### 2.4 Ejecutar Migraciones de Prisma

Después del primer despliegue:

1. Ve al servicio Backend en Railway
2. Click en **"Settings"** → **"Deploy"**
3. En **"Custom Build Command"**, temporalmente agrega:
   ```
   npm ci && npx prisma migrate deploy && npm run build:prod
   ```
4. Redeploy el servicio
5. Después del despliegue exitoso, puedes quitar `npx prisma migrate deploy` del build command

### 2.5 Obtener URL del Backend

1. En el servicio Backend, ve a **"Settings"**
2. En **"Networking"**, click en **"Generate Domain"**
3. Copia la URL generada (ejemplo: `sad-backend-production.up.railway.app`)
4. **Guarda esta URL**, la necesitarás para el frontend

---

## 🌐 PASO 3: Desplegar Frontend en Vercel

### 3.1 Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Importa tu repositorio de GitHub **SAD**
4. Vercel detectará automáticamente Next.js

### 3.2 Configurar Proyecto

1. En **"Configure Project"**:
   - **Framework Preset**: Next.js (detectado automáticamente)
   - **Root Directory**: `frontend` (click en "Edit" y selecciona)
   - **Build Command**: `npm run build` (por defecto)
   - **Output Directory**: `.next` (por defecto)

### 3.3 Añadir Variables de Entorno

1. En **"Environment Variables"**, añade:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://TU_DOMINIO_RAILWAY.up.railway.app/api` (sin slash final)
   - **Environment**: Selecciona **Production**

2. Click en **"Deploy"**

### 3.4 Esperar Despliegue

- Vercel construirá y desplegará tu frontend (2-5 minutos)
- Al finalizar, te dará una URL de producción (ejemplo: `sad.vercel.app`)

---

## ✅ PASO 4: Verificación

### 4.1 Verificar Backend

Abre en tu navegador:
```
https://TU_DOMINIO_RAILWAY.up.railway.app/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2025-11-06T...",
  "database": "connected"
}
```

### 4.2 Verificar Frontend

1. Abre tu URL de Vercel: `https://TU_DOMINIO_VERCEL.vercel.app`
2. Deberías ver la pantalla de login del sistema SAD
3. Intenta hacer login con las credenciales por defecto (si usaste seed)

### 4.3 Verificar Conexión Frontend ↔ Backend

1. Abre DevTools (F12) en el frontend
2. Ve a la pestaña **Network**
3. Intenta hacer login
4. Verifica que las peticiones a `/api/auth/login` se hagan a tu dominio de Railway

---

## 🔧 PASO 5: Configuración Post-Despliegue

### 5.1 Ejecutar Seed (Datos Iniciales)

Si necesitas poblar la base de datos con datos iniciales:

1. En Railway, ve al servicio **Backend**
2. Click en **"Settings"** → **"Deploy"**
3. En **"Custom Start Command"**, temporalmente:
   ```
   npx prisma db seed && npm run start:prod
   ```
4. Redeploy
5. Después del seed, vuelve a cambiar el start command a: `npm run start:prod`

### 5.2 Actualizar CORS (si es necesario)

Si tienes problemas de CORS, actualiza `backend/src/app.ts`:

```typescript
app.use(cors({
  origin: [
    'https://TU_DOMINIO_VERCEL.vercel.app',
    'http://localhost:3000' // Para desarrollo local
  ],
  credentials: true
}));
```

### 5.3 Configurar Dominio Personalizado (Opcional)

**En Vercel:**
1. Settings → Domains → Add Domain
2. Sigue las instrucciones para configurar DNS

**En Railway:**
1. Settings → Networking → Custom Domain
2. Añade tu dominio y configura DNS

---

## 🐛 Troubleshooting

### Error: "Database connection failed"

1. Verifica que `DATABASE_URL` esté correctamente configurada en Railway
2. Asegúrate de que el servicio MySQL esté corriendo
3. Revisa los logs: Railway → Backend Service → Deployments → View Logs

### Error: "Cannot connect to backend" en Frontend

1. Verifica que `NEXT_PUBLIC_API_URL` en Vercel apunte al dominio correcto de Railway
2. Verifica que el backend esté corriendo: abre `/api/health`
3. Revisa la consola del navegador para errores de CORS

### Error: Prisma migrations no se ejecutan

1. En Railway, ejecuta manualmente:
   - Settings → Deploy → Custom Build Command
   - Añade: `npm ci && npx prisma migrate deploy && npm run build:prod`
2. Redeploy el servicio

### Archivos subidos no persisten (Railway reinicia)

Railway no es ideal para almacenamiento de archivos persistente. Considera:
- **AWS S3** o **Cloudinary** para archivos
- Actualiza `backend/src/services/upload.service.ts` para usar S3

---

## 📝 Checklist Final

- [ ] Backend desplegado en Railway y accesible en `/api/health`
- [ ] MySQL funcionando en Railway con migraciones aplicadas
- [ ] Frontend desplegado en Vercel y muestra pantalla de login
- [ ] Variables de entorno configuradas correctamente
- [ ] Conexión Frontend → Backend funcionando (login exitoso)
- [ ] CORS configurado correctamente
- [ ] Datos iniciales (seed) ejecutados si es necesario
- [ ] Archivos de configuración commiteados al repo

---

## 🔗 URLs de Referencia

- **Railway Dashboard**: https://railway.app/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentación Railway**: https://docs.railway.app
- **Documentación Vercel**: https://vercel.com/docs

---

## 📧 Soporte

Para problemas específicos del despliegue, revisa:
1. Logs de Railway: Backend Service → Deployments → View Logs
2. Logs de Vercel: Project → Deployments → View Function Logs
3. Consola del navegador (F12) para errores del frontend

---

## 🎉 ¡Listo!

Tu sistema SAD ahora está en producción y accesible desde cualquier lugar. Puedes compartir las URLs con tu equipo para pruebas en entorno real.

**URLs de tu sistema:**
- 🖥️ Backend: `https://TU_DOMINIO_RAILWAY.up.railway.app`
- 🌐 Frontend: `https://TU_DOMINIO_VERCEL.vercel.app`
