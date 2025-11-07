# 🌐 Guía de Despliegue en Red Local - SAD

Sistema Integrado de Archivos Digitales para acceso desde múltiples dispositivos en red local.

## 📊 Configuración de Red Detectada

**IP del Servidor:** `192.168.18.21`
**Puerto Frontend:** `3000`
**Puerto Backend:** `5001`

## 🚀 Despliegue Rápido

### Paso 1: Verificar Configuración del Backend

El archivo `backend\.env` debe tener:

```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=http://localhost:3000,http://192.168.18.21:3000,http://192.168.56.1:3000,http://127.0.0.1:3000
```

### Paso 2: Iniciar el Backend

```powershell
cd C:\Proyectos\SAD\backend
npm run start
```

**Verifica que muestre:**
```
✓ Host: 0.0.0.0
✓ URL Red: http://192.168.18.21:5001
```

### Paso 3: Verificar Configuración del Frontend

El archivo `frontend\.env.production` debe tener:

```bash
NEXT_PUBLIC_API_URL=http://192.168.18.21:5001/api
```

### Paso 4: Build del Frontend (si no está hecho)

```powershell
cd C:\Proyectos\SAD\frontend
npm run build
```

### Paso 5: Iniciar el Frontend

```powershell
cd C:\Proyectos\SAD\frontend
.\start-production.ps1
```

El script mostrará algo como:
```
🌐 URLs de Acceso:
   Local:      http://localhost:3000
   Red Local:  http://192.168.18.21:3000

📱 Accede desde tu celular usando:
   http://192.168.18.21:3000
```

## 📱 Acceso desde Dispositivos Móviles

### Desde Celular/Tablet en la Misma Red WiFi

1. **Conecta tu dispositivo a la misma red WiFi** que el servidor
2. **Abre el navegador** (Chrome, Safari, etc.)
3. **Ingresa la URL:** `http://192.168.18.21:3000`

### Verificar Conectividad

Desde tu celular, puedes probar primero el health check del backend:
```
http://192.168.18.21:5001/api/health
```

Deberías ver un JSON con `"status": "OK"`

## 🔧 Solución de Problemas

### ❌ "No se puede acceder al sitio" desde el celular

**Posibles causas y soluciones:**

1. **Firewall de Windows bloqueando conexiones**

   Verifica las reglas del firewall:
   ```powershell
   Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*Node*" -or $_.DisplayName -like "*3000*"} | Select-Object DisplayName, Enabled, Action
   ```

   Si no hay reglas o están deshabilitadas, crea una nueva:
   ```powershell
   New-NetFirewallRule -DisplayName "SAD Frontend (Puerto 3000)" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   New-NetFirewallRule -DisplayName "SAD Backend (Puerto 5001)" -Direction Inbound -LocalPort 5001 -Protocol TCP -Action Allow
   ```

2. **IP del servidor cambió**

   Las IPs asignadas por DHCP pueden cambiar. Verifica tu IP actual:
   ```powershell
   Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -and $_.IPAddress -notlike "192.168.56.*"}
   ```

   Si cambió, actualiza:
   - `backend\.env` → FRONTEND_URL
   - `frontend\.env.production` → NEXT_PUBLIC_API_URL
   - Reinicia backend y frontend

3. **Next.js no está escuchando en 0.0.0.0**

   Asegúrate de usar el script `start-production.ps1` que configura `HOSTNAME=0.0.0.0`

4. **Red diferente**

   Verifica que el celular y el servidor estén en la misma red WiFi

5. **Antivirus/Firewall de terceros**

   Temporalmente deshabilita antivirus como Avast, Norton, etc., para probar

### ❌ Error CORS desde el celular

Si ves errores CORS en la consola del navegador:

1. Verifica que `backend\.env` incluya la IP en FRONTEND_URL:
   ```bash
   FRONTEND_URL=http://192.168.18.21:3000
   ```

2. Reinicia el backend

### ❌ "Cannot GET /" o página en blanco

El frontend no se construyó correctamente. Reconstruye:
```powershell
cd C:\Proyectos\SAD\frontend
Remove-Item -Recurse -Force .next
npm run build
.\start-production.ps1
```

## 🔐 Seguridad en Red Local

### Recomendaciones:

1. **Usa la red WiFi de tu organización**, no WiFi público
2. **Cambia JWT_SECRET** en `backend\.env` por algo único
3. **No expongas los puertos** a Internet sin un firewall/VPN apropiado
4. **Mantén Windows Firewall activo**

### Configurar IP Estática (Recomendado)

Para que la IP no cambie:

1. Abre **Configuración de red** → Tu conexión Ethernet
2. Edita **Configuración IP**
3. Cambiar de **Automático (DHCP)** a **Manual**
4. Configura:
   - **IP:** `192.168.18.21`
   - **Máscara:** `255.255.255.0`
   - **Puerta de enlace:** `192.168.18.1` (o la de tu router)
   - **DNS:** `8.8.8.8` y `8.8.4.4` (Google DNS)

## 📊 Monitoreo

### Ver logs del backend:
```powershell
cd C:\Proyectos\SAD\backend
npm run start
# Los logs aparecerán en la consola
```

### Ver logs del frontend:
```powershell
cd C:\Proyectos\SAD\frontend
.\start-production.ps1
# Los logs aparecerán en la consola
```

### Health Checks:

- **Backend:** http://192.168.18.21:5001/api/health
- **Frontend:** http://192.168.18.21:3000

## 🔄 Reiniciar Servicios

Si algo no funciona, reinicia en orden:

```powershell
# 1. Detén backend (Ctrl+C en su terminal)
# 2. Detén frontend (Ctrl+C en su terminal)

# 3. Inicia backend
cd C:\Proyectos\SAD\backend
npm run start

# 4. En otra terminal, inicia frontend
cd C:\Proyectos\SAD\frontend
.\start-production.ps1
```

## 🌐 Acceso desde Otros Equipos

La configuración actual permite acceso desde:

- **Misma PC:** http://localhost:3000
- **Otros equipos en red local:** http://192.168.18.21:3000
- **Celulares/tablets:** http://192.168.18.21:3000

## 📱 Crear Acceso Directo en Celular

### Android:
1. Abre Chrome → http://192.168.18.21:3000
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Se creará un icono como si fuera una app

### iOS (iPhone/iPad):
1. Abre Safari → http://192.168.18.21:3000
2. Icono de compartir (□↑) → "Agregar a pantalla de inicio"
3. Se creará un icono como si fuera una app

## 🆘 Contacto de Soporte

Si después de seguir estos pasos aún no funciona, revisa:

1. ¿El backend responde? → http://192.168.18.21:5001/api/health
2. ¿El frontend responde localmente? → http://localhost:3000
3. ¿Están en la misma red? → Desde el celular, intenta hacer ping a 192.168.18.21
4. ¿Firewall activo? → Revisa las reglas de firewall

---

**¡Listo!** Ahora deberías poder acceder a SAD desde cualquier dispositivo en tu red local.
