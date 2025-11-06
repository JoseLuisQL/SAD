# ⚡ Guía Rápida de Despliegue - 30 Minutos

Sigue estos pasos en orden para desplegar tu sistema en Railway + Vercel.

---

## 🔴 ANTES DE EMPEZAR

### 1. Sube tu código a GitHub (si no lo has hecho)

```bash
git add .
git commit -m "Preparar para despliegue en Railway y Vercel"
git push origin main
```

### 2. Genera un JWT Secret

Ejecuta en tu terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
**Guarda el resultado**, lo necesitarás en Railway.

---

## 📦 PASO 1: Railway - Base de Datos (5 min)

1. Ve a https://railway.app y haz login
2. Click **"New Project"** → **"Provision MySQL"**
3. Espera a que se cree (1-2 min)
4. Click en el servicio **MySQL** → pestaña **"Variables"**
5. **Copia** el valor de `DATABASE_URL` y guárdalo

✅ **Listo**: Tienes MySQL corriendo

---

## 🖥️ PASO 2: Railway - Backend (10 min)

1. En el mismo proyecto, click **"+ New"** → **"GitHub Repo"**
2. Autoriza Railway y selecciona tu repositorio **SAD**
3. Railway lo desplegará automáticamente

### Configurar el Backend:

1. Click en el servicio del **Backend**
2. Ve a **"Settings"**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm ci && npm run build:prod`
   - **Start Command**: `npm run start:prod`
   - Click **"Save Config"**

3. Ve a **"Variables"** → **"RAW Editor"** y pega esto (reemplaza los valores):

```env
NODE_ENV=production
DATABASE_URL=${{MySQL.DATABASE_URL}}
FRONTEND_URL=https://TU_DOMINIO_VERCEL.vercel.app
JWT_SECRET=PEGA_EL_SECRET_QUE_GENERASTE_ANTES
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FIRMA_PERU_API_URL=http://TU_IP:8080/validador/api
FIRMA_PERU_CREDENTIAL=tu-credential
FIRMA_PERU_CLIENT_ID=tu-client-id
FIRMA_PERU_CLIENT_SECRET=tu-client-secret
FIRMA_PERU_TOKEN_URL=https://apps.firmaperu.gob.pe/admin/api/security/generate-token
FIRMA_PERU_CLIENT_WEB_URL=https://apps.firmaperu.gob.pe/web/clienteweb/firmaperu.min.js
FIRMA_PERU_LOCAL_SERVER_PORT=48596
FIRMA_PERU_BACKEND_BASE_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}/api/firma
FIRMA_PERU_ONE_TIME_TOKEN_SECRET=GENERA_OTRO_SECRET_ALEATORIO
```

4. Ve a **"Settings"** → **"Networking"** → Click **"Generate Domain"**
5. **Copia la URL** generada (ejemplo: `sad-backend-production.up.railway.app`)

### Ejecutar Migraciones de Prisma:

1. En **"Settings"** → **"Deploy"**
2. Cambia **"Custom Build Command"** a:
   ```
   npm ci && npx prisma migrate deploy && npm run build:prod
   ```
3. Click **"Redeploy"**
4. Espera a que termine (3-5 min)
5. Después del despliegue, vuelve a cambiar el build command a: `npm ci && npm run build:prod`

✅ **Verifica**: Abre `https://TU_DOMINIO_RAILWAY.up.railway.app/api/health` - deberías ver `"status": "OK"`

---

## 🌐 PASO 3: Vercel - Frontend (10 min)

1. Ve a https://vercel.com/dashboard y haz login
2. Click **"Add New..."** → **"Project"**
3. Importa tu repositorio **SAD**

### Configurar el Frontend:

1. En **"Configure Project"**:
   - Click en **"Edit"** en Root Directory
   - Selecciona carpeta **`frontend`**
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

2. En **"Environment Variables"**:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://TU_DOMINIO_RAILWAY.up.railway.app/api` (SIN slash final)
   - **Environment**: Selecciona **Production**

3. Click **"Deploy"**

4. Espera a que termine (3-5 min)

5. **Copia la URL** de Vercel (ejemplo: `sad.vercel.app`)

✅ **Verifica**: Abre tu URL de Vercel, deberías ver la pantalla de login

---

## 🔄 PASO 4: Actualizar FRONTEND_URL en Railway

Ahora que tienes la URL de Vercel:

1. Ve a Railway → Servicio **Backend** → **"Variables"**
2. Busca `FRONTEND_URL`
3. Reemplaza `TU_DOMINIO_VERCEL` con tu URL real de Vercel
4. Click **"Save"**
5. Railway re-desplegará automáticamente

✅ **Listo**: El CORS está configurado correctamente

---

## ✅ PASO 5: Verificación Final

### Backend Health Check:
```
https://TU_DOMINIO_RAILWAY.up.railway.app/api/health
```
Deberías ver:
```json
{
  "status": "OK",
  "database": "Connected"
}
```

### Frontend:
1. Abre tu URL de Vercel
2. Intenta hacer login
3. Abre DevTools (F12) → pestaña Network
4. Verifica que las peticiones se hagan al dominio de Railway

✅ **Si todo funciona**: ¡Tu sistema está en producción!

---

## 🐛 Problemas Comunes

### "Database connection failed"
- Verifica que `DATABASE_URL` esté configurada correctamente
- Revisa que el servicio MySQL esté corriendo en Railway

### "Cannot connect to backend"
- Verifica que `NEXT_PUBLIC_API_URL` apunte a tu dominio de Railway
- Verifica que NO tenga slash final: ❌ `/api/` → ✅ `/api`

### "CORS error"
- Asegúrate de haber actualizado `FRONTEND_URL` en Railway con la URL de Vercel
- Verifica que el backend se haya re-desplegado después del cambio

### Prisma migrations no se ejecutan
- Ejecuta manualmente en Railway:
  - Settings → Deploy → Custom Build Command
  - `npm ci && npx prisma migrate deploy && npm run build:prod`
  - Redeploy

---

## 🎯 Próximos Pasos (Opcional)

### Ejecutar Seed (Datos Iniciales):

1. Railway → Backend → Settings → Deploy
2. Custom Start Command: `npx prisma db seed && npm run start:prod`
3. Redeploy
4. Después del seed, vuelve el start command a: `npm run start:prod`

### Configurar Dominio Personalizado:

**Vercel**: Settings → Domains → Add Domain
**Railway**: Settings → Networking → Custom Domain

---

## 📝 Checklist

- [ ] Código subido a GitHub
- [ ] MySQL desplegado en Railway
- [ ] Backend desplegado en Railway con migraciones
- [ ] Frontend desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] FRONTEND_URL actualizada con dominio de Vercel
- [ ] Health check respondiendo OK
- [ ] Login funcionando en el frontend

---

## 🔗 URLs Importantes

- Railway Dashboard: https://railway.app/dashboard
- Vercel Dashboard: https://vercel.com/dashboard
- Guía Completa: Ver `DEPLOYMENT.md` para detalles avanzados

---

**¡Felicidades! 🎉 Tu sistema SAD está desplegado y listo para usar.**
