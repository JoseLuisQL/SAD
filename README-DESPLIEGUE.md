# 📚 Documentación de Despliegue - Sistema SAD

## Sistema Integrado de Archivos Digitales

> **Versión**: 1.0.0  
> **Entorno**: Producción en cPanel (sin SSH)  
> **URL**: http://archivos.risvirgendecocharcas.gob.pe

---

## 🎯 Objetivo

Esta documentación te guiará paso a paso para desplegar el Sistema SAD en tu servidor de producción usando cPanel, **sin necesidad de acceso SSH/terminal**.

---

## 📖 Guías Disponibles

### 1️⃣ [PREPARACION-LOCAL-ANTES-DESPLIEGUE.md](./PREPARACION-LOCAL-ANTES-DESPLIEGUE.md)
**Empieza aquí si es tu primer despliegue**

- ✅ Cómo construir el backend
- ✅ Cómo construir el frontend
- ✅ Cómo preparar la base de datos
- ✅ Cómo exportar todo para subirlo

**Duración**: 30-45 minutos

---

### 2️⃣ [GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md](./GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md)
**Guía principal completa y detallada**

Esta es la guía más completa. Incluye:

- 📋 Preparación local (builds)
- 🌐 Configuración de cPanel (base de datos, dominios)
- 🚀 Despliegue del backend
- 🎨 Despliegue del frontend
- ✅ Verificación del sistema
- 🔄 Actualizaciones futuras
- 🐛 Solución de problemas

**Duración**: 2-4 horas (primera vez)

---

### 3️⃣ [CHECKLIST-DESPLIEGUE-RAPIDO.md](./CHECKLIST-DESPLIEGUE-RAPIDO.md)
**Checklist imprimible para marcar mientras despliegas**

- ✅ Lista de verificación paso a paso
- ✅ Espacios para anotar datos importantes
- ✅ Checkboxes para marcar progreso
- ✅ Perfecto para imprimir o tener en pantalla secundaria

**Recomendación**: Imprime este archivo y ve marcando cada paso

---

### 4️⃣ [COMANDOS-RAPIDOS-REFERENCIA.md](./COMANDOS-RAPIDOS-REFERENCIA.md)
**Referencia rápida de comandos**

- 💻 Comandos PowerShell para builds
- 🔄 Comandos para actualizaciones
- 🗄️ Comandos para backups
- 🔍 Comandos para troubleshooting

**Úsalo como**: Cheat sheet durante el despliegue

---

### 5️⃣ [FLUJO-DESPLIEGUE-VISUAL.md](./FLUJO-DESPLIEGUE-VISUAL.md)
**Diagramas visuales del proceso**

- 📐 Arquitectura del sistema
- 🔄 Flujo de despliegue paso a paso
- 📂 Estructura de directorios
- 🔐 Flujo de seguridad
- 📊 Flujo de subida de documentos
- ⏱️ Tiempos estimados

**Úsalo como**: Referencia visual para entender el sistema

---

## 🚀 ¿Por Dónde Empiezo?

### Primer Despliegue (nunca has desplegado el sistema)

```
1. Lee: PREPARACION-LOCAL-ANTES-DESPLIEGUE.md
   ⬇️
2. Sigue: GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md
   ⬇️
3. Usa: CHECKLIST-DESPLIEGUE-RAPIDO.md (para ir marcando)
   ⬇️
4. Consulta: COMANDOS-RAPIDOS-REFERENCIA.md (cuando lo necesites)
```

### Actualización de Código (ya está desplegado)

```
1. Sección "6. Actualizaciones Futuras" en:
   GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md
   ⬇️
2. O usa directamente:
   COMANDOS-RAPIDOS-REFERENCIA.md
```

### Solución de Problemas

```
1. Sección "7. Solución de Problemas" en:
   GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md
   ⬇️
2. Consulta los logs en cPanel:
   Setup Node.js App → Show logs
```

---

## 📋 Archivos Creados para Ti

```
C:\Proyectos\SAD\
├── README-DESPLIEGUE.md                      (ESTE ARCHIVO - Índice)
├── PREPARACION-LOCAL-ANTES-DESPLIEGUE.md    (Guía de preparación)
├── GUIA-DESPLIEGUE-CPANEL-PRODUCCION.md     (Guía principal completa)
├── CHECKLIST-DESPLIEGUE-RAPIDO.md           (Checklist imprimible)
├── COMANDOS-RAPIDOS-REFERENCIA.md           (Comandos útiles)
├── FLUJO-DESPLIEGUE-VISUAL.md               (Diagramas visuales)
│
└── backend/
    └── prisma/
        └── seed-admin-only.ts                (Script para crear admin)
```

---

## ⚙️ Especificaciones Técnicas

### Sistema

- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: Next.js 15 + React 19 + Zustand
- **Base de Datos**: MySQL 8.0
- **Node.js**: v18+ requerido
- **Hosting**: cPanel 130.0.1 (sin acceso SSH)

### URLs

- **Producción**: http://archivos.risvirgendecocharcas.gob.pe
- **Backend API**: http://archivos.risvirgendecocharcas.gob.pe/api
- **Health Check**: http://archivos.risvirgendecocharcas.gob.pe/api/health

### Credenciales Iniciales

```
Usuario: admin
Contraseña: Admin123!
⚠️ CAMBIAR INMEDIATAMENTE DESPUÉS DEL PRIMER LOGIN
```

---

## 🎯 Requisitos Previos

Antes de empezar, asegúrate de tener:

### En tu computadora

- [ ] Node.js v18+ instalado
- [ ] npm v9+ instalado
- [ ] Cliente FTP (FileZilla recomendado)
- [ ] MySQL Workbench o HeidiSQL

### En cPanel

- [ ] Acceso a cPanel (usuario y contraseña)
- [ ] Subdominio creado: `archivos.risvirgendecocharcas.gob.pe`
- [ ] Capacidad para crear bases de datos MySQL
- [ ] Node.js App support habilitado
- [ ] Espacio en disco: mínimo 2 GB libre

---

## ⏱️ Tiempos Estimados

| Tarea | Primera vez | Actualización |
|-------|-------------|---------------|
| Preparación local | 30-45 min | 5-10 min |
| Configuración cPanel | 15-20 min | - |
| Subida de archivos | 45-90 min | 10-15 min |
| Configuración apps | 20-30 min | - |
| Verificación | 15-20 min | 5 min |
| **TOTAL** | **2-4 horas** | **20-30 min** |

---

## 📞 Soporte

### Consultas sobre la documentación

Si encuentras algún paso confuso o falta información:

1. Revisa la sección "Solución de Problemas" en la guía principal
2. Consulta los diagramas visuales en `FLUJO-DESPLIEGUE-VISUAL.md`
3. Verifica los logs en cPanel (Setup Node.js App → Show logs)

### Contacto

- **Sistema**: SAD - Sistema Integrado de Archivos Digitales
- **Institución**: DISA CHINCHEROS
- **Versión**: 1.0.0

---

## ✅ Checklist Rápido

Antes de empezar el despliegue, verifica:

### Preparación

- [ ] He leído la guía de preparación local
- [ ] Tengo acceso a cPanel
- [ ] Tengo todos los requisitos instalados
- [ ] He creado el subdominio en cPanel
- [ ] Tengo al menos 2 horas disponibles para el despliegue inicial

### Durante el Despliegue

- [ ] Estoy siguiendo la guía paso a paso
- [ ] Estoy marcando el checklist imprimible
- [ ] Estoy guardando las credenciales en lugar seguro
- [ ] Estoy creando backups antes de cambios importantes

### Después del Despliegue

- [ ] El sistema está funcionando correctamente
- [ ] He cambiado la contraseña del usuario admin
- [ ] He creado un backup de la base de datos
- [ ] He descargado los archivos de configuración (.env)
- [ ] He documentado las credenciales de manera segura

---

## 🔐 Seguridad

### Información Sensible

Las guías incluyen información sensible como:
- Credenciales de base de datos
- Tokens JWT
- Credenciales de Firma Perú

⚠️ **IMPORTANTE**:
- **NO compartas** estas guías públicamente
- **Cambia** todas las contraseñas en producción
- **Genera** nuevos secrets para JWT
- **Guarda** las credenciales en un gestor de contraseñas seguro (KeePass, 1Password, etc.)

### Después del Despliegue

1. Cambia la contraseña del usuario `admin`
2. Genera nuevos valores para `JWT_SECRET`
3. Verifica que `.env.production` no esté en tu repositorio Git
4. Configura backups automáticos de la base de datos

---

## 🎉 ¡Listo para Empezar!

Ahora que conoces toda la documentación disponible, puedes empezar con tu despliegue.

**Siguiente paso**: Abre [PREPARACION-LOCAL-ANTES-DESPLIEGUE.md](./PREPARACION-LOCAL-ANTES-DESPLIEGUE.md)

---

## 📝 Notas de Versión

### v1.0.0 (Noviembre 2025)

- ✅ Documentación inicial completa
- ✅ Guía de despliegue sin SSH
- ✅ Guía de actualizaciones
- ✅ Checklist imprimible
- ✅ Comandos de referencia rápida
- ✅ Diagramas visuales
- ✅ Script de seed para usuario admin

---

**¡Éxito en tu despliegue! 🚀**
