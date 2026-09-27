# AUDITORIA MAESTRA INTEGRAL DE ARQUITECTURA, SEGURIDAD, RENDIMIENTO Y CODIGO
## SISTEMA INTEGRADO DE ARCHIVOS DIGITALES (SAD) - DISA CHINCHEROS

**Rol:** Arquitecto Principal de Software y Auditor en Jefe de Sistemas  
**Entidad Beneficiaria:** Direccion de Salud (DISA) Chincheros  
**Fecha de Dictamen:** 27 de Septiembre de 2026  
**Clasificacion:** Informe Tecnico de Auditoria y Dictamen Pericial  

---

### 1. RESUMEN EJECUTIVO Y FICHA TECNICA DEL SISTEMA

#### 1.1 Proposito del Sistema
El Sistema Integrado de Archivos Digitales (SAD) es una plataforma gubernamental orientada a la gestion, digitalizacion, custodia, busqueda y firma digital de expedientes administrativos y resoluciones de la DISA Chincheros. Cumple funciones criticas de interoperabilidad documental conforme al Modelo de Gestion Documental (MGD - PCM/SGTD), la Ley N° 27269 (Ley de Firmas y Certificados Digitales) y sus reglamentos (D.S. 026-2016-PCM y D.S. 029-2021-PCM).

#### 1.2 Ficha Tecnica del Stack Tecnologico
* **Backend:** Node.js (>=18), Express 4.18, TypeScript 5.3, Prisma ORM 5.22.
* **Base de Datos:** MySQL 8.0 (Motor de almacenamiento InnoDB, UTF8mb4).
* **Frontend:** Next.js 15.5.4 (App Router), React 19.1.0, TypeScript 5.x, Tailwind CSS v4, Radix UI / shadcn/ui.
* **Gestion de Estado Client-Side:** Zustand 5.0.8, Axios 1.12.2, SWR 2.3.6, Zod 4.1.12, React Hook Form 7.65.0.
* **Seguridad y Criptografia:** JSON Web Tokens (jsonwebtoken 9.0), bcryptjs (factor 10), Helmet, Express Rate Limit, Integracion Agente Local Firma Peru (socket loopback TCP 48596).
* **Procesamiento de Archivos y OCR:** Multer, pdf-parse, Tesseract.js 6.0.1 (declarado), Archiver, Extract-zip.
* **Almacenamiento:** Sistema de archivos local (`backend/uploads/documents/`).

#### 1.3 Evaluacion Cuantitativa de Salud del Software (Escala 1 a 10)

| Dimension Evaluada | Puntuacion | Diagnostico Resumido |
|---|:---:|---|
| **Arquitectura de Software** | **4.5 / 10** | Degradacion severa: el backend acopla primitivas HTTP (`req: Request`) en servicios de negocio; el frontend Next.js 15 opera como una SPA tradicional (33 de 33 paginas marcadas con `'use client'`). Rutas parasitas y duplicadas. |
| **Seguridad de la Informacion** | **2.5 / 10** | **Nivel Inaceptable / Critico:** Endpoints publicos de descarga y carga de documentos firmados accesibles mediante un `sessionId` Base64 predecible sin HMAC; bypass de RBAC en descarga de versiones; defaults inseguros en `JWT_SECRET`; CORS wildcard en produccion; vulnerabilidad potencial de Zip Slip en restauracion. |
| **Rendimiento y Escalabilidad** | **3.5 / 10** | Operaciones síncronas bloqueantes (`fs.*Sync`) en el Event Loop de Node.js; computo analitico en memoria (descarga de todos los documentos en vez de `GROUP BY`); consultas N+1 en analitica de firmas; cola OCR volatil en memoria. |
| **Mantenibilidad y Calidad de Codigo** | **4.0 / 10** | 320 ocurrencias de `any` en backend; middleware global de errores inoperativo por captura manual en controladores; supresion de chequeos estrictos (`ignoreBuildErrors: true` en frontend); scripts de diagnostico mezclados en codigo fuente. |
| **Experiencia de Usuario (UX/UI) y A11y** | **5.0 / 10** | Colision critica entre Sonner y React-Hot-Toast (notificaciones invisibles en backups y reportes); botones de descarga y edicion desconectados; mezcla de tokens fijos con temas variables; excelente implementacion de modales Radix y formularios de login. |
| **Integridad de Datos y Persistencia** | **4.0 / 10** | Ausencia casi total de transacciones atomicas (`$transaction`) en firmas y versionado; columna `ocrContent` limitada a 64 KB (`TEXT`); desincronizacion historica de migraciones Prisma; multiples instancias no coordinadas de `PrismaClient`. |
| **PUNTUACION GLOBAL PONDERADA** | **3.9 / 10** | **ESTADO CRITICO:** El sistema posee un modelado relacional y una interfaz base prometedora, pero presenta fallas de seguridad que invalidan su validez legal y riesgos de denegacion de servicio bajo concurrencia moderada. Requiere intervencion inmediata antes de una liberacion definitiva. |

---

### 2. DIAGNOSTICO DETALLADO POR SUBSISTEMAS

#### 2.1 Backend y API REST
* **Patron Arquitectonico Controller-Service-Data Violado:**
  * En `documents.service.ts`, `expedientes.service.ts`, `users.service.ts`, `auth.service.ts` y `signature.service.ts`, los metodos de negocio reciben el objeto `req: Request` de Express para obtener la IP o el ID de usuario. Esto impide reutilizar la logica en procesos batch, workers de colas o pruebas unitarias aisladas.
  * En `documents.controller.ts` (lineas 433-464), el endpoint `getSignatures` importa `prisma` y consulta directamente a la base de datos sin pasar por ningun servicio.
  * En `security.routes.ts`, mas de 400 lineas contienen handlers HTTP inline sin ningun controlador asociado (`security.controller.ts` no existe).
* **Manejo de Errores Inoperativo:**
  * `errorHandler` registrado en `app.ts` (linea 196) es codigo muerto: ningun controlador invoca `next(error)` en su bloque `catch`. Todos devuelven `res.status(500).json(...)`.
  * Los codigos HTTP se deciden evaluando cadenas de texto (`error.message.includes('no existe')` -> 404, `error.message.includes('token')` -> 401). Una minima variacion tipografica rompe el contrato de la API.
* **Contrato de Respuestas Heterogeneo:**
  * Coexisten formatos con `pagination` como hermano de `data` (`documents.controller.ts`), `pagination` anidado dentro de `data` (`users.controller.ts`), y respuestas de texto plano en endpoints de firma (`firma.controller.ts`, linea 602). Las interfaces formales de `src/types/api-response.types.ts` son ignoradas.
* **Bloqueo del Event Loop (I/O Sincrono):**
  * `storage.service.ts`, `ocr.service.ts`, `firma.controller.ts` y `emergency-restore.service.ts` invocan `fs.readFileSync`, `fs.unlinkSync` y `fs.statSync`. Un documento de 40 MB detiene el procesamiento de todas las solicitudes concurrentes del servidor.

#### 2.2 Frontend y Experiencia de Usuario (Next.js 15 + React 19)
* **Degeneracion a SPA (Client-Only Rendering):**
  * Las 33 paginas de la aplicacion y el archivo `app/dashboard/layout.tsx` tienen forzada la directiva `'use client'`. Se descartan las capacidades de Server Components, streaming SSR y Server Actions, sobrecargando el bundle inicial del cliente (First Load JS).
* **Compilacion Permisiva e Insegura (`next.config.ts`):**
  * Las directivas `typescript.ignoreBuildErrors: true` y `eslint.ignoreDuringBuilds: true` permiten desplegar binarios con errores de tipos en tiempo de ejecucion (como interfaces con propiedades renombradas o no coincidentes).
* **Falla Critica de Retroalimentacion (Sonner vs React-Hot-Toast):**
  * `app/layout.tsx` monta exclusivamente el `<Toaster />` de Sonner.
  * `lib/toast.ts` delega internamente en `react-hot-toast`.
  * Los modulos de respaldos (`useBackups.ts`), restauracion (`useRestore.ts`) y reportes (`useReports.ts`) importan de `lib/toast.ts`: **el usuario nunca recibe retroalimentacion visual de exito o fracaso**.
* **Acciones Desconectadas en UI:**
  * `DocumentsTable.tsx` no desestructura el prop `onEdit`, inhabilitando el boton de edicion.
  * `app/dashboard/firma/validar/page.tsx` evalua `document?.fileUrl`, pero la entidad solo posee `filePath`, dejando el boton de descarga inerte.
* **Rutas Huerfanas y Gemelas:**
  * Existen archivos obsoletos dentro del enrutador (`page-new.tsx`, `page-old.tsx`, `layout-metadata.tsx`).
  * Rutas duplicadas: `app/firma/flujo/[id]` y `app/firma/flujos/[id]` duplican codigo identico y estan fuera del matcher del middleware de autenticacion.

#### 2.3 Nucleo de Firma Digital (Firma Peru) y Versionamiento
* **Bypass de Autenticacion en Descarga y Subida de Archivos Firmados:**
  * En `firma.controller.ts` y `firma.routes.ts`, los endpoints `GET /api/firma/document/:documentId/download` y `POST /api/firma/document/:documentId/upload-signed` no validan tokens JWT ni secretos criptograficos. Confian en un parametro `session` consistente en `documentId:userId:timestamp` codificado en Base64 plano. Cualquier usuario que altere el string puede descargar o suplantar la firma de cualquier documento de la institucion.
* **Incumplimiento Normativo de Firma Digital (Ley 27269 / ETSI PAdES):**
  * Parametrizacion en `firma-peru.service.ts`: `signatureLevel: 'B'`, sin sellado de tiempo TSA (`webTsa: ''`), y `certificateFilter: '.*'`.
  * Incumple los estandares de archivo digital de largo plazo (debe ser al menos PAdES-T con Time-Stamp RFC 3161 y validacion contra la IOFE).
  * Coordenadas de estampado visual fijas en `(20, 20)` en pagina 1, generando solapamiento ilegible en flujos multifirma.
* **Error Logico de Estados (`PARTIALLY_SIGNED` Inalcanzable):**
  * En `signature-status.service.ts`, la condicion `hasActiveFlows` asigna `IN_FLOW` inmediatamente. El bloque `else if` que calcula `PARTIALLY_SIGNED` jamas se ejecuta.
* **Degradacion Insegura de Validacion:**
  * Si el servicio de validacion de PCM esta offline, el bloque `catch` asigna `signatureStatus: 'SIGNED'`, asumiendo como valido un documento cuya integridad criptografica no fue verificada.
* **Ruptura Transaccional:**
  * `updateDocumentSignedFile` en `documents.service.ts` ejecuta la creacion de version, actualizacion de documento y registro de firma en sentencias separadas sin `$transaction`. Un fallo a mitad del proceso corrompe el repositorio.

#### 2.4 Motor OCR y Busqueda
* **Dependencia Fantasma de OCR:**
  * `package.json` incluye `"tesseract.js": "^6.0.1"` y el repositorio almacena archivos pesados de entrenamiento (`spa.traineddata` y `eng.traineddata` sumando 8.58 MB en la raiz).
  * `ocr.service.ts` **nunca ejecuta Tesseract.js**. Solo lee texto nativo con `pdf-parse` y, si el PDF es escaneado, escribe la cadena literal: `"[Documento escaneado - Se requiere OCR para extraer el contenido]"`. No existe extraccion optica de caracteres real.
* **Cola de Procesamiento Volatil en Memoria:**
  * `queue.service.ts` mantiene un array en RAM (`private queue: QueueItem[] = []`). Si el servidor se reinicia, se pierden todos los trabajos pendientes y los documentos quedan en `PENDING` permanentemente. No escala horizontalmente.
* **Estrategia FULLTEXT Comprometida en Base de Datos:**
  * En `search.service.ts`, la consulta SQL mezcla `MATCH(...) AGAINST(...)` con `OR annotations LIKE '%...%'` y `OR ocrContent LIKE '%...%'`. Esto fuerza a MySQL a escanear linealmente las columnas `TEXT` de toda la tabla, anulando el indice inverted index. Ademas, el score de relevancia calculado se descarta antes de entregar el resultado al frontend.

#### 2.5 Seguridad, Control de Acceso (RBAC) y Trazabilidad (AuditLog)
* **Bypass de Permisos en Descarga Directa:**
  * Mientras `versions.routes.ts` exige `requirePermission('versions', 'download')`, la ruta duplicada en `versions-direct.routes.ts` carece de verificacion de permisos, exponiendo cualquier version historica a cualquier usuario logueado.
* **Configuracion Insegura de CORS en Produccion:**
  * `app.ts` valida `origin.endsWith('.vercel.app')` con `credentials: true`. Cualquier usuario con una cuenta gratuita en Vercel puede desplegar un sitio malicioso y realizar peticiones autenticadas contra la API.
* **Secretos Criptograficos Hardcodeados:**
  * `JWT_SECRET` y `FIRMA_PERU_ONE_TIME_TOKEN_SECRET` tienen fallbacks predeterminados en texto plano (`'your-secret-key-here'`).
* **Vulnerabilidad de Zip Slip en Restauracion:**
  * `emergency-restore.service.ts` utiliza `extract-zip` sin sanitizar los paths internos de las entradas, permitiendo escrituras arbitrarias fuera del directorio destino mediante secuencias `../`.
* **Destruccion de Evidencia Forense en Auditoria:**
  * `audit.service.ts` filtra explicitamente `userId: { in: existingUserIds }`. Si un usuario corrupto es eliminado de la base de datos, toda su bitacora historica desaparece de la vista del auditor.
* **Falla en Auditoria de Intentos Fallidos:**
  * Al intentar registrar `userId: 'unknown'`, MySQL rechaza la insercion por clave foranea. El error es silenciado y los ataques de fuerza bruta quedan sin registrar.

#### 2.6 Base de Datos y Modelo Relacional (Prisma + MySQL 8.0)
* **Riesgo de Truncamiento en `ocrContent`:**
  * Declarado como `@db.Text` (limite maximo de 65,535 bytes). Resoluciones o expedientes de mas de 15 paginas causan `ERROR 1406 (22001): Data too long for column 'ocrContent'` bajo `STRICT_TRANS_TABLES`.
* **Inversion Cronologica Critica de Migraciones:**
  * `20251105000000_add_favicon...` intenta alterar la tabla `system_config` que recien es creada por la migracion `20251224000000_create_system_config`. Un despliegue limpio de CI/CD fallara fatalmente.
* **Tablas Huerfanas no Versionadas:**
  * `BackupJob`, `BackupItem` y campos de control de bloqueo de usuarios se crearon mediante `db push` manual sin registrarse en `prisma/migrations`.
* **Computo Analitico Catastrofico en Memoria Node.js:**
  * `analytics.service.ts` ejecuta `prisma.document.findMany` trayendo **todos los registros del sistema a memoria** para sumarlos e iterarlos en bucles JavaScript, en lugar de utilizar `GROUP BY` y `SUM` en MySQL. Con 100,000 folios esto provocara un colapso por `Heap Out Of Memory`.
* **Consultas N+1 Severas:**
  * `signature-analytics.service.ts` ejecuta 91 consultas individuales para calcular metricas de 30 firmantes.
* **Fuga de Conexiones por Multiples Clientes Prisma:**
  * Se detectaron 3 llamadas independientes a `new PrismaClient()` (`database.ts`, `signature-analytics.service.ts`, `signature-status.service.ts`), saturando el pool de conexiones de MySQL.

#### 2.7 Sistema de Respaldo y Recuperacion (Disaster Recovery)
* **Puntos Fuertes:** Generacion de hashes SHA-256 por archivo e indices JSONL estructurados.
* **Debilidades:**
  * Los paquetes `.zip` generados en `uploads/backups/` se almacenan en texto plano sin cifrado (AES-256), conteniendo volcados integrales de datos sensibles y hashes de contraseñas.
  * La restauracion en `emergency-restore.service.ts` no se ejecuta bajo una transaccion atomica global. Un error parcial deja la base de datos en estado corrupto e irrecuperable.

---

### 3. MATRIZ CONSOLIDADA DE HALLAZGOS Y VULNERABILIDADES

| ID | Componente / Archivo | Descripcion del Hallazgo | Severidad | Impacto Potencial | Remediacion Recomendada |
|---|---|---|:---:|---|---|
| **VUL-01** | `backend/src/routes/firma.routes.ts`<br>`backend/src/controllers/firma.controller.ts` | Endpoints publicos de descarga y carga de documentos firmados basados en `sessionId` Base64 sin firma HMAC. | **CRITICA** | Descarga no autorizada y suplantacion de documentos firmados digitalmente. | Implementar tokens HMAC-SHA256 con tiempo de expiracion (`generateSecureSessionId`). |
| **VUL-02** | `backend/src/services/emergency-restore.service.ts` | Descompresion con `extract-zip` sin sanitizar rutas relativas (Zip Slip). | **CRITICA** | Sobrescritura de archivos arbitrarios en el servidor y ejecucion remota de codigo. | Validar que cada `entry.fileName` resuelto este contenido dentro del directorio destino. |
| **VUL-03** | `backend/src/utils/jwt.utils.ts`<br>`backend/src/config/firma-peru.ts` | Secretos de cifrado con valores por defecto en codigo (`'your-secret-key-here'`). | **CRITICA** | Falsificacion de credenciales de administracion si falta la variable `.env`. | Abortar el arranque del servidor (`process.exit(1)`) si falta `JWT_SECRET`. |
| **VUL-04** | `backend/src/services/documents.service.ts`<br>`backend/src/services/versions.service.ts` | Operaciones de firma y reversion fuera de bloques `$transaction`. | **CRITICA** | Corrupcion de estado relacional y firmas huerfanas ante fallos concurrentes. | Envolver mutaciones de documento, version y firma en `prisma.$transaction`. |
| **VUL-05** | `backend/prisma/migrations` | Inversion cronologica de migraciones (`system_config` alterada antes de ser creada). | **CRITICA** | Falla catastrofica en despliegues automatizados y nuevos entornos de base de datos. | Corregir los prefijos de fecha de las migraciones para respetar el orden causal. |
| **VUL-06** | `backend/src/routes/versions-direct.routes.ts` | Omision de middleware `requirePermission('versions', 'download')`. | **ALTA** | Fuga de documentos historicos por usuarios autenticados sin privilegios. | Anadir `requirePermission('versions', 'download')` o eliminar la ruta directa redundante. |
| **VUL-07** | `backend/src/app.ts` | Politica de CORS permite cualquier subdominio `*.vercel.app` con credenciales. | **ALTA** | Ataques Cross-Origin autenticados y robo de informacion confidencial. | Restringir el origen exclusivamente a la lista blanca de dominios en `FRONTEND_URL`. |
| **VUL-08** | `frontend/store/authStore.ts` | Almacenamiento de tokens JWT en cookies no `HttpOnly` (`js-cookie`). | **ALTA** | Robo de sesion de usuario ante vectores de Cross-Site Scripting (XSS). | Migrar la gestion de cookies a flags `HttpOnly`, `Secure` y `SameSite` desde el backend. |
| **VUL-09** | `frontend/next.config.ts` | Verificaciones de TypeScript y ESLint ignoradas durante el build de produccion. | **ALTA** | Compilacion y despliegue de codigo roto con errores de tipos en runtime. | Remover `ignoreBuildErrors: true` e `ignoreDuringBuilds: true` y resolver errores tipograficos. |
| **VUL-10** | `frontend/lib/toast.ts`<br>`frontend/app/layout.tsx` | Discrepancia entre contenedor Sonner e invocaciones a React-Hot-Toast. | **ALTA** | Silenciamiento de mensajes de error y exito en backups, reportes y restauracion. | Estandarizar toda la aplicacion en Sonner y eliminar `react-hot-toast`. |
| **VUL-11** | `frontend/app/api/favicon/route.ts` | Fetch server-side de URLs sin validacion de esquemas ni rangos IP (SSRF). | **ALTA** | Escaneo de red interna institucional y acceso a metadatos de infraestructura. | Implementar lista blanca de dominios y bloquear IPs privadas / de loopback. |
| **VUL-12** | `backend/src/services/firma-peru.service.ts` | Filtro de certificados abierto (`.*`) y omision de sellado de tiempo TSA (PAdES-B). | **ALTA** | Invalidez pericial y no repudio a largo plazo de documentos de archivo estatal. | Configurar PAdES-T con TSA oficial y restringir el filtro a la IOFE. |
| **VUL-13** | `backend/src/services/storage.service.ts`<br>`backend/src/config/multer.config.ts` | Validacion de tipo de archivo dependiente unicamente del header `mimetype`. | **ALTA** | Inyeccion de binarios maliciosos o scripts bajo extension `.pdf`. | Inspeccionar los Magic Bytes del encabezado del archivo (`0x25 0x50 0x44 0x46`). |
| **VUL-14** | `backend/prisma/schema.prisma` | Campo `ocrContent` definido como `TEXT` (64 KB). | **MEDIA** | Fallo en insercion SQL al procesar documentos medianos o extensos (>15 paginas). | Modificar el tipo de dato a `@db.MediumText` (hasta 16 MB). |
| **VUL-15** | `backend/src/services/analytics.service.ts` | Descarga masiva de tablas completas a memoria RAM para agregaciones JS. | **MEDIA** | Colapso por Heap Out Of Memory (`OOM`) del backend bajo volumen real de datos. | Reemplazar bucles en Node.js por agregaciones SQL nativas (`GROUP BY`, `SUM`). |
| **VUL-16** | `backend/src/services/audit.service.ts` | Exclusion automatica de registros de auditoria de usuarios eliminados. | **MEDIA** | Destruccion involuntaria del rastro de auditoria forense. | Eliminar la clausula `userId: { in: existingUserIds }` en las consultas de logs. |
| **VUL-17** | `backend/src/services/queue.service.ts` | Cola de tareas OCR residente en memoria volatil. | **MEDIA** | Perdida irreversible de trabajos encolados al reiniciar la aplicacion. | Migrar a colas transaccionales en MySQL o Redis con BullMQ. |
| **VUL-18** | `frontend/app/dashboard/firma/validar` | Boton de descarga apunta a propiedad inexistente `document.fileUrl`. | **MEDIA** | Funcionalidad esencial de la interfaz completamente inoperativa para el usuario. | Corregir la referencia para consumir el endpoint `/api/documents/:id/download`. |
| **VUL-19** | `backend/src/services/signature-status.service.ts` | Error de logica booleana imposibilita alcanzar el estado `PARTIALLY_SIGNED`. | **MEDIA** | Estados de multifirma inconsistentes en los tableros de control. | Reordenar la jerarquia condicional evaluando primero `activeSignatures > 0`. |
| **VUL-20** | `backend/src/services/signature-analytics.service.ts` | Inicializacion multiple de `PrismaClient` y consultas N+1 en bucles. | **MEDIA** | Agotamiento del pool de conexiones MySQL y alta latencia. | Reutilizar la instancia singleton de `database.ts` y aplicar `JOIN`/`GROUP BY`. |

---

### 4. ANALISIS DE DEUDA TECNICA Y BUENAS PRACTICAS

#### 4.1 Fortalezas y Aciertos Destacados en la Base de Codigo
1. **Modelado Relacional Solido en Prisma (`schema.prisma`):**
   * Coherencia estructural de entidades del dominio (documentos, expedientes, oficinas, roles, tipos documentales).
   * Uso sistematico de claves UUID, restricciones de integridad referencial con cascadas logicas (`onDelete: Cascade` en versiones y firmas) y mapeo explicito de tablas con `@@map`.
2. **Sistema de Permisos Declarativo y Granular:**
   * El middleware `requirePermission(module, action)` proporciona una autorizacion flexible basada en capacidades JSON, superando con creces los esquemas rigidos basados unicamente en nombres de rol.
3. **Pistas de Auditoria Exhaustivas (`audit.service.ts`):**
   * Cobertura de mas de 65 acciones del sistema (`AuditAction`), capturando usuario, entidad, valores previos y nuevos (`oldValue`/`newValue`), direccion IP y metadatos de sesion.
4. **Validaciones Estrictas en Capa de Datos:**
   * Amplia definicion de esquemas Joi en el backend y Zod en el frontend con mensajes de retroalimentacion contextualizados en español.
5. **Componentes Accesibles en Frontend:**
   * Correcta implementacion de primitivas Radix UI garantizando gestion de foco (Focus Trapping), atajos de teclado accesibles y Skip Links semanticos en layouts principales.

#### 4.2 Antipatrones e Inconsistencias a Erradicar
1. **Contaminacion del Arbol Fuente (`src/`):**
   * Presencia de 12 scripts de migracion de un solo uso en `backend/src/scripts/` que se compilan innecesariamente en produccion (`dist/scripts/`).
   * Archivos JavaScript compilados (`database.js`, `jwt.utils.js`) y archivos `.bak` huerfanos comprometidos en el repositorio de TypeScript.
2. **Abuso del Tipo `any` (Escape Hatches):**
   * 320 ocurrencias de `any` en el backend, principalmente en filtros dinamicos de Prisma (`const where: any = {}`), desactivando la verificacion estricta del compilador.
3. **Manejo de Errores por Coincidencia de Cadenas de Texto:**
   * Control de flujo basado en `error.message.includes(...)` en controladores y middlewares, generando fragilidad extrema ante minimos cambios de redaccion.
4. **Monkey-Patching de Primitivas del Framework:**
   * En `signature-status-updater.middleware.ts`, se sobreescribe `res.json` para disparar promesas asincronas desacopladas en segundo plano ("Floating Promises").
5. **Estrategia Hibrida Rota de Formularios:**
   * Coexistencia de React Hook Form + Zod con formularios imperativos manuales basados en multiples `useState` y switch-cases (`CreateSignatureFlowForm.tsx`).

---

### 5. PLAN DE ACCION Y HOJA DE RUTA PRIORIZADA (ROADMAP)

#### Fase 1: Inmediata / Urgente (Parches de Seguridad y Estabilidad - Semana 1 y 2)
1. **Cerrar Brechas de Seguridad en Firma Peru (VUL-01):**
   * Reemplazar el `sessionId` en Base64 plano por un token firmado con HMAC-SHA256 (`generateSecureSessionId`) que verifique firma, expiracion (10 minutos) y correspondencia de documento.
2. **Corregir Politica de CORS (VUL-07):**
   * Eliminar la regla wildcard de `.vercel.app` en `app.ts` y exigir coincidencia estricta con la variable `ALLOWED_ORIGINS`.
3. **Blindar Descarga de Versiones (VUL-06):**
   * Añadir `requirePermission('versions', 'download')` en `versions-direct.routes.ts` o eliminar el archivo y unificar el enrutador en `versions.routes.ts`.
4. **Asegurar Secretos de Entorno (VUL-03):**
   * Forzar la terminacion del proceso en `server.ts` si `JWT_SECRET` o `DATABASE_URL` no estan definidos o mantienen valores por defecto.
5. **Prevenir Zip Slip en Restauracion (VUL-02):**
   * Implementar la validacion canonica de rutas en `emergency-restore.service.ts` antes de descomprimir paquetes de respaldo.
6. **Estandarizar Notificaciones en Frontend (VUL-10):**
   * Reemplazar las llamadas a `react-hot-toast` en `lib/toast.ts` por Sonner y desinstalar la libreria redundante.
7. **Activar Tipado Estricto en Build de Frontend (VUL-09):**
   * Remover `ignoreBuildErrors: true` e `ignoreDuringBuilds: true` de `next.config.ts` y resolver los errores de compilacion en interfaces.
8. **Corregir Acciones Inertes en UI (VUL-18):**
   * Desestructurar `onEdit` en `DocumentsTable.tsx` y corregir la descarga en `validar/page.tsx`.

#### Fase 2: Mediano Plazo (Refactorizacion, Resiliencia y Datos - Mes 1)
1. **Transaccionalidad Atomica en Gestion Documental (VUL-04):**
   * Envolver los flujos de firma, creacion de versiones y reversion en bloques `prisma.$transaction` con bloqueos pesimistas (`SELECT ... FOR UPDATE`) para evitar condiciones de carrera.
2. **Reorganizacion de Migraciones e Indices Prisma (VUL-05, VUL-14):**
   * Corregir el orden cronologico de las migraciones de `system_config`.
   * Ampliar `ocrContent` a `MediumText`.
   * Unificar instancias de `PrismaClient` e incorporar los indices de analitica en `schema.prisma`.
3. **Migracion de I/O a Asincrono:**
   * Sustituir todas las llamadas `fs.*Sync` por `fs.promises.*` en servicios de almacenamiento, OCR y controladores de firma.
4. **Centralizacion de Errores y Validacion:**
   * Implementar la jerarquia de clases `AppError` (`NotFoundError`, `BadRequestError`, etc.), delegando con `next(error)` y activando el middleware `errorHandler`.
   * Mover las validaciones Joi de los controladores a middlewares de ruta (`validateBody`, `validateQuery`).
5. **Optimizacion de Consultas Analiticas (VUL-15):**
   * Reemplazar la descarga masiva de registros en `analytics.service.ts` por consultas SQL agregadas (`groupBy` y `aggregate`).
6. **Desacoplamiento de Servicios Backend:**
   * Retirar el objeto `req: Request` de la firma de metodos de negocio y sustituirlo por un objeto de contexto `ExecutionContext { userId, ipAddress, userAgent }`.
7. **Saneamiento del Repositorio:**
   * Eliminar archivos `.bak`, `.js` huérfanos y trasladar `src/scripts/` a una carpeta de herramientas externa.

#### Fase 3: Largo Plazo (Escalabilidad, Arquitectura y Madurez Operativa - Mes 2 a 3)
1. **Implementacion Real de Motor OCR y Colas Persistentes (VUL-17):**
   * Integrar Tesseract.js de forma efectiva mediante trabajadores en segundo plano administrados con **BullMQ** y **Redis**, garantizando persistencia ante reinicios y paralelismo controlado.
2. **Almacenamiento de Objetos S3 / MinIO:**
   * Migrar la persistencia de archivos desde el sistema de archivos local (`uploads/`) hacia un almacenamiento compatible con S3 (MinIO en infraestructura propia o servicio cloud), desacoplando el estado de los nodos de aplicacion.
3. **Cookies Seguras `HttpOnly` y Arquitectura BFF (VUL-08):**
   * Configurar el backend para emitir tokens en cookies con banderas `HttpOnly`, `Secure` y `SameSite=Strict`, o implementar Route Handlers de Next.js como Proxy BFF para eliminar por completo la exposicion de JWT al JavaScript del cliente.
4. **Adopcion Progresiva de React Server Components (RSC):**
   * Refactorizar las paginas del dashboard para que el fetching inicial de datos se ejecute en el servidor mediante Server Components, reservando `'use client'` unicamente para componentes de interaccion y formularios.
5. **Pipeline de Calidad y Pruebas Automatizadas:**
   * Configurar suite de pruebas unitarias y de integracion con Jest / Vitest en backend y React Testing Library en frontend, incorporando linters y analisis de seguridad estatico (SAST) en un flujo de CI/CD.

---

### 6. CONCLUSION Y VEREDICTO FINAL DEL ARQUITECTO

El Sistema Integrado de Archivos Digitales (SAD) de la DISA Chincheros cuenta con una base de ingenieria relevante: un modelo relacional bien estructurado en Prisma, una cobertura amplia de eventos de auditoria y una interfaz construida sobre estandares modernos de UI.

Sin embargo, el sistema presenta en su estado actual **vulnerabilidades de seguridad criticas** en su modulo central de Firma Digital y gestion de respaldos, fallas en la integridad transaccional del versionado y riesgos severos de saturacion de memoria bajo cargas moderadas. Asimismo, la funcionalidad de OCR promocionada en la documentacion es inexistente en el codigo ejecutable.

**Veredicto Final:**  
El sistema se califica como **NO APTO PARA PRODUCCION EN SU ESTADO ACTUAL**. Se aprueba su continuidad tecnica condicionada a la ejecucion obligatoria e inmediata de la **Fase 1 del Roadmap**, enfocada en parchar los vectores de suplantacion criptografica y violacion de control de acceso antes de permitir el procesamiento de documentos oficiales con validez legal. Con la ejecucion metódica del plan de remediacion propuesto, el proyecto alcanzara los estandares de resiliencia, seguridad y cumplimiento normativo exigidos por la administracion publica.