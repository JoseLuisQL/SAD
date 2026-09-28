# 🏛️ Sistema Integrado de Archivos Digitales (SAD)
### Dirección de Red de Salud Chincheros — Gobierno Regional de Apurímac

[![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue.svg?style=for-the-badge)](https://github.com/JoseLuisQL/SAD/releases)
[![Plataforma](https://img.shields.io/badge/Plataforma-Windows%20x64%20%7C%20Web-0078D6.svg?style=for-the-badge&logo=windows)](https://github.com/JoseLuisQL/SAD)
[![Electron](https://img.shields.io/badge/Desktop-Electron%2033-47848F.svg?style=for-the-badge&logo=electron)](https://www.electronjs.org/)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2015-black.svg?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Backend-Express%20%2B%20Prisma-gray.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/Base%20de%20Datos-MySQL%208.0-4479A1.svg?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

---

## 📌 Descripción General
El **Sistema Integrado de Archivos Digitales (SAD)** es una solución tecnológica integral de gestión documental, foliado, preservación digital y firma electrónica desarrollada para la **Unidad de Archivo Central e Informática de la DISA Chincheros**.

El sistema opera bajo una arquitectura versátil:
1. **Solución de Escritorio Todo en Uno (All-in-One Desktop):** Ejecutable autocontenido (.exe) para estaciones de trabajo institucionales, permitiendo custodia autónoma de documentos, alta velocidad en loopback local y cero dependencia de conexiones externas.
2. **Servidor Institucional en Red Local (Web/Intranet):** Capacidad para ser desplegado centralizadamente permitiendo acceso a múltiples oficinas y dependencias del sector salud.

---

## 🚀 Características Principales

* 📄 **Digitalización y Procesamiento OCR:**
  - Extracción inteligente de texto de documentos escaneados mediante **Tesseract.js** con modelos entrenados en español (`spa.traineddata`).
  - Indexación de expedientes y búsqueda textual rápida por metadatos, emisor, fecha y contenido.

* ✍️ **Firma Digital con Firma Perú (PCM):**
  - Integración nativa con el software oficial de **Firma Perú (Agente ReFirma)** en el puerto local `48596`.
  - Soporte completo para DNI Electrónico (DNIe) y Tokens criptográficos institucionales.
  - Perfil de firma conforme a estándares PAdES y validación legal según la Ley N° 27269.

* 🔐 **Seguridad e Integridad Criptográfica:**
  - Cálculo automático de hash **SHA-256** por cada versión de documento y paquete de respaldo.
  - Control estricto de versiones con posibilidad de reversión de firmas y auditoría de cambios.
  - Módulo de respaldo y copias de seguridad de emergencia (`AuditLog` y paquetes ZIP cifrados).

* 🔄 **Sistema de Auto-Actualización en Línea (Auto-Updater):**
  - Módulo integrado en **Configuración $\rightarrow$ Actualizaciones**.
  - Detección automática de nuevas versiones publicadas en el canal oficial de GitHub Releases.
  - Descarga en segundo plano con barra de progreso en vivo (velocidad, porcentaje y tamaño).
  - Reemplazo y reinicio automático seguro del sistema garantizando la persistencia de la base de datos y expedientes.

* 🗂️ **Estructura Archivística Normativa (AGN):**
  - Cumple con la Directiva N° 001-2023-AGN/DDPA del **Archivo General de la Nación**.
  - Organización cronológica por Períodos y gestión de Archivadores Físicos (estantes, módulos, baldas).
  - Tipologías documentales homologadas: Resoluciones Directorales, Memorándums, Oficios, Informes Técnicos, etc.

---

## 🏗️ Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│               SAD - SISTEMA INTEGRADO DE ARCHIVOS DIGITALES            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  FRONTEND (Next.js 15 App Router + React 19 + Tailwind CSS)    │   │
│   │  • Interfaz moderna shadcn/ui y Zustand                        │   │
│   │  • Módulo de Configuración con Pestaña de Actualizaciones      │   │
│   │  • Tableros de control, carga masiva y visor de expedientes    │   │
│   └──────────────────────┬───────────────────▲─────────────────────┘   │
│                          │                   │                         │
│            HTTP / REST   │                   │ Eventos IPC / API       │
│            Puerto 5001   │                   │ (updater:status)        │
│                          ▼                   │                         │
│   ┌──────────────────────────────────────────┴─────────────────────┐   │
│   │  SHELL ESCRITORIO (Electron 33 + electron-updater)             │   │
│   │  • Splash screen institucional con carga concurrente           │   │
│   │  • Ciclo de vida y cierre seguro de puertos (taskkill sync)    │   │
│   │  • Auto-descarga e instalación limpia con NSIS                 │   │
│   └──────────────────────┬─────────────────────────────────────────┘   │
│                          │                                             │
│                          ▼                                             │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  BACKEND (Node.js + Express + Prisma ORM + TypeScript)         │   │
│   │  • API REST documental y motor de OCR Tesseract                │   │
│   │  • Integración Firma Perú (localhost:48596)                    │   │
│   │  • Base de datos MySQL 8.0 y almacenamiento local SHA-256      │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura del Repositorio

```
SAD/
├── .github/
│   └── workflows/
│       └── release-desktop.yml      # Pipeline CI/CD para compilar y publicar instaladores
├── backend/                         # Servidor API REST (Express, Prisma, MySQL)
│   ├── prisma/                      # Esquemas relacionales y migraciones
│   ├── src/                         # Controladores, rutas, middlewares y servicios
│   ├── uploads/                     # Almacenamiento local de documentos PDF
│   └── package.json
├── frontend/                        # Aplicación web (Next.js 15, Tailwind, shadcn/ui)
│   ├── app/                         # App Router (dashboard, configuración, expedientes)
│   ├── components/                  # Componentes modulares y pestañas de configuración
│   ├── hooks/                       # Hooks reactivos (useSystemUpdater, useDocuments)
│   ├── types/                       # Definiciones TypeScript y tipos de actualización
│   └── package.json
├── desktop/                         # Contenedor de escritorio (Electron + electron-builder)
│   ├── assets/                      # Iconos institucionales (.ico, .png)
│   ├── src/
│   │   ├── main.js                  # Proceso principal, AutoUpdater y control de puertos
│   │   ├── preload.js               # Puente de contexto seguro (electronAPI)
│   │   └── splash.html              # Pantalla de carga institucional
│   └── package.json                 # Configuración de compilación NSIS / Portable
├── installer/                       # Scripts de instalación con Inno Setup
│   └── sad-installer.iss
├── Iniciar-SAD-Escritorio.bat       # Script lanzador rápido para Windows
├── MANUAL-EJECUTABLE-ESCRITORIO.md  # Manual técnico y normativo para estaciones de custodia
└── README.md                        # Documentación general del proyecto
```

---

## ⚙️ Requisitos del Entorno

### Para Desarrollo y Compilación:
- **Sistema Operativo:** Windows 10 / 11 (64-bit).
- **Node.js:** Versión 18+ o 20 LTS.
- **Gestor de Paquetes:** npm 9+.
- **Base de Datos:** MySQL 8.0 o MariaDB 10.4+ (ejecutándose en puerto `3306`).
- **Git:** Para control de versiones y flujo de releases.

### Para la Estación de Trabajo del Usuario Final (Ejecutable):
- Computadora con Windows 10/11 x64.
- 4 GB de memoria RAM mínimo (8 GB recomendado).
- 2 GB de espacio libre en disco.
- Servicio MySQL local activo (WAMP, XAMPP o servicio de Windows `MySQL80`).
- Agente Firma Perú (PCM) instalado si se requiere firma con DNIe o Token.

---

## 🛠️ Puesta en Marcha (Modo Desarrollo)

### 1. Clonar el repositorio
```bash
git clone https://github.com/JoseLuisQL/SAD.git
cd SAD
```

### 2. Configurar y levantar el Backend
```bash
cd backend
npm install
cp .env.example .env    # Configure credenciales de MySQL y puertos
npx prisma generate
npx prisma migrate dev
npm run dev             # Servidor activo en http://localhost:5001
```

### 3. Configurar y levantar el Frontend
```bash
cd ../frontend
npm install
npm run dev             # Interfaz activa en http://localhost:3000
```

### 4. Probar el Ejecutable de Escritorio con Electron
```bash
cd ../desktop
npm install
npm start
```

---

## 📦 Compilación del Ejecutable de Escritorio (.exe)

Para generar el instalador instalable y la versión portable distribuibles para Windows:

```bash
cd desktop
npm install
npm run dist:all
```

Los instaladores se generarán en la carpeta `desktop/dist-installer/`:
* `SAD - Archivo Digital Setup 1.0.0.exe` (Instalador asistido con accesos directos).
* `SAD-Escritorio-Portable-v1.0.0.exe` (Versión portable para USB o discos externos).
* `latest.yml` (Metadatos criptográficos para la auto-actualización).

---

## 🔄 Cómo Funciona la Auto-Actualización

El sistema cuenta con un circuito automatizado de principio a fin:

1. **Búsqueda desde la Interfaz:**
   El usuario ingresa a **Configuración $\rightarrow$ Actualizaciones** y presiona **"Buscar Actualizaciones"**.
2. **Consulta al Canal Oficial:**
   El sistema verifica la última versión disponible en el repositorio de GitHub (`https://github.com/JoseLuisQL/SAD/releases`).
3. **Descarga en Segundo Plano:**
   Si existe una versión nueva, el usuario presiona **"Descargar e Instalar"**. Una barra de progreso muestra en tiempo real la velocidad de descarga y el porcentaje transferido mientras el usuario continúa operando el sistema.
4. **Instalación Segura y Reinicio:**
   Al presionar **"Reiniciar y Actualizar Ahora"**, el sistema:
   - Cierra síncronamente los procesos de backend y frontend.
   - Libera los puertos `3000` y `5001` para evitar bloqueos de archivos en Windows.
   - Aplica la actualización con el instalador NSIS y relanza SAD automáticamente.
   - **Garantía:** Los documentos en `backend/uploads/` y la base de datos MySQL nunca son modificados ni borrados.

---

## 📜 Marco Normativo y Cumplimiento Legal

| Norma / Disposición | Entidad Emisora | Cumplimiento en SAD |
| :--- | :--- | :--- |
| **Directiva N° 001-2023-AGN/DDPA** | Archivo General de la Nación (AGN) | Cuadros de clasificación, series documentales y foliación cronológica. |
| **Res. Jefatural N° 021-2019-AGN/J** | Archivo General de la Nación (AGN) | Metadatos normalizados e integridad criptográfica SHA-256. |
| **Ley N° 27269 y D.S. 052-2008-PCM** | Presidencia del Consejo de Ministros (PCM) | Perfiles de firma digital válidos con Firma Perú y validez jurídica equivalente a manuscrita. |
| **Directiva de Seguridad Digital** | Secretaría de Gobierno y Transformación Digital (SGTD) | Bitácora inmutable de auditoría (`AuditLog`) y respaldos de contingencia. |

---

## 👥 Créditos y Desarrollo Institucional

* **Institución:** Red de Salud Chincheros — Dirección Regional de Salud Apurímac.
* **Áreas Responsables:** Área de Informática y Telecomunicaciones & Unidad de Archivo Central.
* **Repositorio Oficial:** [https://github.com/JoseLuisQL/SAD](https://github.com/JoseLuisQL/SAD)

---
*Copyright © 2026 DISA Chincheros. Todos los derechos reservados.*
