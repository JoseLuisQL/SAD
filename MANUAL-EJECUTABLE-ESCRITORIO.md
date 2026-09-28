# 🖥️ MANUAL TÉCNICO Y NORMATIVO: SAD TODO EN UNO PARA ESCRITORIO (.EXE)
## Sistema Integrado de Archivos Digitales - DISA Chincheros

---

## 1. INTRODUCCIÓN Y ALCANCE
El presente documento detalla la arquitectura, modo de uso y validación jurídica del **Sistema Integrado de Archivos Digitales (SAD)** configurado como una **Solución de Escritorio Todo en Uno (All-in-One)** para Windows, permitiendo su ejecución autónoma y local en una sola computadora de la institución, sin depender de servidores externos, internet ni servicios en la nube.

---

## 2. ARQUITECTURA TÉCNICA "TODO EN UNO"

```
┌────────────────────────────────────────────────────────────────────────┐
│               COMPUTADORA DE ESCRITORIO / ESTACIÓN DE TRABAJO          │
│                                                                        │
│   [ ACCESO DIRECTO EN ESCRITORIO: SAD.exe / Iniciar-SAD-Escritorio ]   │
│                                    │                                   │
│                                    ▼                                   │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │  VENTANA NATIVA DE ESCRITORIO (Electron Shell)                 │   │
│   │  • Interfaz limpia sin barras de navegación ni pestañas        │   │
│   │  • Splash screen institucional de carga                        │   │
│   │  • Icono institucional y control de ciclo de vida              │   │
│   └───────────────┬────────────────────────────────┬───────────────┘   │
│                   │                                │                   │
│   ┌───────────────▼────────────────┐ ┌─────────────▼───────────────┐   │
│   │ Frontend Local (Next.js 15)    │ │ Backend Local (Express API) │   │
│   │ http://127.0.0.1:3000          │ │ http://127.0.0.1:5001       │   │
│   └────────────────────────────────┘ └─────────────┬───────────────┘   │
│                                                    │                   │
│                                      ┌─────────────▼───────────────┐   │
│                                      │ Base de Datos Local MySQL   │   │
│                                      │ localhost:3306              │   │
│                                      └─────────────┬───────────────┘   │
│                                                    │                   │
│   ┌────────────────────────────────┐ ┌─────────────▼───────────────┐   │
│   │ Componente Firma Perú (PCM)    │ │ Almacenamiento Local        │   │
│   │ localhost:48596 (DNIe / Token) │ │ Repositorio de PDFs (SHA256)│   │
│   └────────────────────────────────┘ └─────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Componentes Integrados:
1. **Lanzador de Escritorio (`desktop/src/main.js`):**
   - Controla el inicio y parada ordenada de los servicios.
   - Presenta un splash screen elegante con la barra de carga mientras los servicios locales se activan.
   - Maximiza la ventana y oculta las barras de herramientas innecesarias.
   - Evita la fuga de procesos al cerrar con la "X" mediante cierre seguro (`SIGTERM` / `taskkill`).
2. **Backend Local (Express + Prisma ORM):**
   - Ejecuta la API de control documental en `http://localhost:5001`.
   - Controla la numeración correlativa, foliado digital y registro de auditoría (`AuditLog`).
3. **Frontend Local (Next.js 15 App Router):**
   - Servidor local en `http://localhost:3000` con visualización inmediata de expedientes, reportes y tableros.
4. **Almacenamiento Local Autocontenido:**
   - Ubicación predeterminada: `backend/uploads/documents/`.
   - Cada PDF conserva su integridad mediante cálculo automático de hash SHA-256.

---

## 3. VALIDACIÓN CONFORME A LAS NORMATIVAS DEL ARCHIVO CENTRAL (ESTADO PERUANO)

El uso de un sistema en una sola computadora física dentro de una entidad pública está regulado por el **Archivo General de la Nación (AGN)** y la **Presidencia del Consejo de Ministros (PCM)**. Para que la estación de trabajo sea legalmente válida y no sea observada por el OCI (Órgano de Control Institucional), cumple con los siguientes principios:

### 3.1 Directiva N° 001-2023-AGN/DDPA ("Administración de Archivos en Entidades Públicas")
* **Designación Formal del Equipo:** La computadora donde se instala la solución debe estar designada oficialmente como la **Estación de Custodia y Digitalización del Archivo Central** o de la **Unidad de Archivo** de la DISA Chincheros.
* **Principio de Procedencia y Serie Documental:** El sistema SAD respeta la estructura archivística oficial:
  - **Períodos / Años de Gestión:** Agrupación cronológica conforme a la ley.
  - **Archivadores y Ubicación Física:** Mapea estantes, módulos, baldas y archivadores físicos vinculados a su gemelo digital.
  - **Tipos de Documento:** Resoluciones Directorales, Memorándums, Oficios, Informes Técnicos, etc.

### 3.2 Resolución Jefatural N° 021-2019-AGN/J ("Digitalización con Valor Legal")
* **Metadatos Obligatorios:** El sistema guarda el título, emisor, fecha del documento, foliación, notas y observaciones.
* **Integridad Criptográfica (Hash SHA-256):** Cada versión de documento y cada paquete de copia de seguridad genera su huella digital criptográfica inmutable.
* **Formato Estándar:** Compatibilidad con documentos PDF y preservación a largo plazo.

### 3.3 Ley N° 27269 y D.S. N° 052-2008-PCM (Ley de Firmas y Certificados Digitales)
* **Ventaja Crítica de la Solución Local:**
  - Al estar todo en la misma máquina (`localhost`), la comunicación con el software oficial de **Firma Perú (Agente ReFirma)** en el puerto `48596` se realiza en el loopback local sin latencia de red, sin requerir internet para la transferencia interna del archivo y con detección inmediata de lectores USB de DNI Electrónico (DNIe) o Tokens criptográficos.
  - Cumple con los perfiles de firma digital PAdES reconocidos por la Infraestructura Oficial de Firma Electrónica (IOFE).

### 3.4 Plan de Contingencia y Seguridad de la Información (Obligatorio AGN / ISO 27001)
* **Riesgo:** Al ser un único computador, una falla de disco duro, virus o daño físico pondría en riesgo el patrimonio documental.
* **Medida de Mitigación Incluida en SAD:**
  - El sistema incorpora el módulo de **Copias de Seguridad y Respaldo de Emergencia** (`backend/src/services/security-backup.service.ts`).
  - **Protocolo de Cumplimiento:** El responsable del archivo debe utilizar la función **"Crear Copia de Seguridad"** periódicamente (semanal / mensual) y almacenar el paquete ZIP resultante en un **medio externo seguro** (Disco duro externo USB o unidad de red protegida).

---

## 4. GUÍA DE USO RÁPIDO

### 4.1 Iniciar la Aplicación en el Escritorio
1. Haga doble clic en el archivo:
   `Iniciar-SAD-Escritorio.bat` (o el acceso directo generado en el escritorio).
2. Se abrirá la pantalla de presentación (*Splash Screen*) con el logo de la DISA Chincheros mientras se inician los servicios locales.
3. Se abrirá automáticamente la ventana de pantalla completa del sistema.
4. Ingrese con sus credenciales institucionales:
   - **Usuario:** `admin`
   - **Contraseña:** `Admin123!` (o la configurada en la instalación).

### 4.2 Cierre Seguro de la Aplicación
1. Al terminar su jornada laboral, simplemente haga clic en la "X" superior derecha de la ventana.
2. Confirme el mensaje de salida: el sistema detendrá de forma limpia el backend y frontend en memoria.

---

## 5. CÓMO GENERAR EL INSTALADOR FINAL .EXE

Se disponen de dos métodos para generar el instalador distribuible:

### Método A: Instalador Rápido con Inno Setup (Recomendado para TI)
1. Instale [Inno Setup](https://jrsoftware.org/isdl.php) (software gratuito y estándar en Windows).
2. Abra el archivo `installer/sad-installer.iss`.
3. Haga clic en **Build $\rightarrow$ Compile** (o presione `F9`).
4. Se generará el archivo `dist-installer/Instalador-SAD-Escritorio-v1.0.exe`, el cual puede llevarse en un USB e instalarse con asistente tipo "Siguiente $\rightarrow$ Siguiente $\rightarrow$ Finalizar".

### Método B: Empaquetador Electron Builder
1. Desde la carpeta `desktop/`, ejecute:
   ```cmd
   npm install
   npm run dist
   ```
2. El instalador ejecutable `.exe` y la versión portable se crearán en `desktop/dist-installer/`.

---

## 6. SISTEMA DE ACTUALIZACIÓN AUTOMÁTICA EN LÍNEA (AUTO-UPDATER)

El sistema SAD incorpora un mecanismo profesional de auto-actualización que permite a los usuarios del Archivo Central y administradores mantener el software al día sin necesidad de reinstalaciones manuales complejas:

### 6.1 Cómo Buscar y Aplicar Actualizaciones desde el Sistema:
1. Ingrese al sistema y diríjase al módulo de **Configuración** (`/dashboard/configuracion`).
2. Haga clic en la pestaña **"Actualizaciones"** (identificada con el icono de destellos).
3. Presione el botón **"Buscar Actualizaciones"**. El sistema consultará el canal oficial de la DISA Chincheros en GitHub Releases.
4. Si existe una nueva versión:
   - Se presentará un panel con el número de versión (`v1.X.X`), fecha de lanzamiento y la lista detallada de **Novedades y Mejoras**.
   - Haga clic en **"Descargar e Instalar"**. Se mostrará una barra de progreso en tiempo real con el porcentaje, velocidad de descarga y tamaño transferido.
   - Una vez finalizada la descarga, presione **"Reiniciar y Actualizar Ahora"**.
5. El sistema cerrará de forma segura los servicios locales (liberando los puertos 3000 y 5001) y el instalador aplicará la nueva versión automáticamente en pocos segundos, reabriendo SAD con todos sus documentos, expedientes y base de datos intactos.

### 6.2 Integridad y Seguridad Normativa:
* **Firma Criptográfica SHA-512 (`latest.yml`):** Cada versión publicada genera un resumen hash inmutable. Si el archivo descargado no coincide con el hash original, la actualización se rechaza automáticamente para proteger la estación de trabajo institucional.
* **Preservación Documental:** Los repositorios locales de documentos (`backend/uploads/documents/`) y la base de datos MySQL local nunca son sobreescritos durante la actualización.
