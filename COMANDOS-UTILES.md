# 🛠️ Comandos Útiles - Sistema SAD

Comandos frecuentes para el desarrollo y mantenimiento del sistema.

---

## 📦 Instalación Inicial

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Desarrollo Local

### Backend (Puerto 4000)
```bash
cd backend
npm run dev              # Inicia con nodemon
npm run build            # Compila TypeScript
npm run typecheck        # Verifica tipos sin compilar
```

### Frontend (Puerto 3000)
```bash
cd frontend
npm run dev              # Inicia Next.js con Turbopack
npm run build            # Build de producción
npm run lint             # ESLint
```

---

## 🗄️ Base de Datos (Prisma)

### Migraciones
```bash
cd backend
npx prisma migrate dev           # Crear y aplicar migración en desarrollo
npx prisma migrate deploy        # Aplicar migraciones en producción
npx prisma migrate reset         # Reset completo de la DB (¡cuidado!)
```

### Gestión de Schema
```bash
npx prisma generate              # Generar Prisma Client después de cambios
npx prisma studio                # Abrir GUI de base de datos
npx prisma db push               # Push schema sin crear migración (dev only)
npx prisma db seed               # Ejecutar seed para datos iniciales
```

### Inspección
```bash
npx prisma db pull               # Introspect DB existente
npx prisma validate              # Validar schema.prisma
npx prisma format                # Formatear schema.prisma
```

---

## 🚀 Producción

### Generar Secrets (JWT)
```bash
# JWT_SECRET (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# FIRMA_PERU_ONE_TIME_TOKEN_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Build de Producción
```bash
# Backend
cd backend
npm run build:prod              # Typecheck + Build + Prisma Generate

# Frontend
cd frontend
npm run build                   # Build de Next.js
```

### Verificar Despliegue
```bash
# Después de desplegar en Railway + Vercel
node verify-deployment.js https://TU_BACKEND.railway.app https://TU_FRONTEND.vercel.app
```

---

## 🧪 Testing y Verificación

### Backend
```bash
cd backend
npm run check:prod              # Health check del backend
node check-permissions.ts       # Verificar permisos de usuario
node check-user-status.ts       # Verificar estado de usuarios
```

### Endpoints
```bash
# Health check
curl http://localhost:4000/api/health

# Database stats
curl http://localhost:4000/api/health/db
```

---

## 🔐 Gestión de Usuarios

### Generar Hash de Password
```bash
cd backend
node generar-hash-password.js TU_PASSWORD_AQUI
```

### Reset Password de Usuario
```bash
cd backend
npx ts-node reset-password.ts
```

### Fix Admin User
```bash
cd backend
npx ts-node fix-admin-user.ts
```

---

## 📊 Git

### Commit y Push
```bash
git status                       # Ver cambios
git add .                        # Agregar todos los cambios
git commit -m "Descripción"      # Commit
git push origin main             # Push a GitHub
```

### Ver Historial
```bash
git log --oneline -10            # Últimos 10 commits
git diff                         # Ver cambios sin staging
git diff --cached                # Ver cambios staged
```

---

## 🔄 Railway (Despliegue Backend)

### Redeploy Forzado
```bash
# En Railway Dashboard:
# 1. Ve al servicio Backend
# 2. Click en "Deployments"
# 3. Click en "Redeploy"
```

### Ver Logs en Tiempo Real
```bash
# En Railway Dashboard:
# 1. Ve al servicio Backend
# 2. Click en el deployment activo
# 3. Los logs aparecerán en tiempo real
```

### Ejecutar Comandos en Railway
```bash
# Railway no tiene terminal interactiva, pero puedes:
# 1. Modificar el "Start Command" temporalmente
# 2. Redeploy
# 3. Ver el output en los logs
# 4. Restaurar el Start Command original
```

---

## 🌐 Vercel (Despliegue Frontend)

### Redeploy
```bash
# Opción 1: Push a GitHub (auto-deploy)
git push origin main

# Opción 2: Manual en Vercel Dashboard
# 1. Ve a tu proyecto
# 2. Click en "Deployments"
# 3. Click en los 3 puntos del último deploy
# 4. Click "Redeploy"
```

### Ver Logs
```bash
# En Vercel Dashboard:
# 1. Ve a tu proyecto
# 2. Click en "Deployments"
# 3. Click en el deployment
# 4. Click en "View Function Logs"
```

---

## 🧹 Limpieza y Mantenimiento

### Limpiar Node Modules
```bash
# Backend
cd backend
rd /s /q node_modules     # Windows
npm install

# Frontend
cd frontend
rd /s /q node_modules     # Windows
npm install
```

### Limpiar Build Artifacts
```bash
# Backend
cd backend
rd /s /q dist

# Frontend
cd frontend
rd /s /q .next
```

### Limpiar Prisma
```bash
cd backend
rd /s /q node_modules\.prisma
npx prisma generate
```

---

## 📦 Actualizar Dependencias

### Ver Paquetes Desactualizados
```bash
npm outdated
```

### Actualizar Paquetes (con cuidado)
```bash
# Actualizar a versiones menores (seguro)
npm update

# Actualizar a versiones mayores (puede romper cosas)
# Usa herramientas como npm-check-updates:
npx npm-check-updates -u
npm install
```

---

## 🐛 Troubleshooting Rápido

### Puerto en Uso
```bash
# Windows - Matar proceso en puerto 4000
netstat -ano | findstr :4000
taskkill /PID [PID_NUMBER] /F
```

### Problemas con Prisma
```bash
# Regenerar Prisma Client
cd backend
rd /s /q node_modules\.prisma
npx prisma generate

# Reset completo de base de datos (¡CUIDADO!)
npx prisma migrate reset
```

### Frontend no conecta al Backend
```bash
# 1. Verificar que backend esté corriendo en puerto 4000
curl http://localhost:4000/api/health

# 2. Verificar variable de entorno en frontend
# frontend/.env.local debe tener:
# NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## 📚 Documentación de Referencia

- **Backend**: `backend/README.md`
- **Despliegue Rápido**: `DEPLOY-QUICKSTART.md`
- **Despliegue Completo**: `DEPLOYMENT.md`
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs
- **Railway**: https://docs.railway.app
- **Vercel**: https://vercel.com/docs

---

## 💡 Tips

1. **Siempre verifica que el backend esté corriendo antes de iniciar el frontend**
2. **Ejecuta `npx prisma generate` después de cambios en el schema**
3. **Haz commit frecuente de tus cambios**
4. **Mantén las variables de entorno actualizadas en `.env.example`**
5. **Prueba en local antes de desplegar a producción**
6. **Revisa los logs en Railway/Vercel si algo falla**
