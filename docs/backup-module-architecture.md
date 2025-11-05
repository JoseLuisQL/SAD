# Arquitectura del Módulo de Copias de Seguridad Inteligente - SAD

**Fecha:** 04 de noviembre de 2025  
**Sistema:** Sistema Integrado de Archivos Digitales (SAD)  
**Autor:** Equipo de Desarrollo  
**Versión:** 1.0

---

## 1. AUDITORÍA DE DOMINIOS EXISTENTES

### 1.1 Inventario de Tablas y Entidades

#### Dominio: Autenticación y Permisos
- **User** - Usuarios del sistema con credenciales y perfiles
- **Role** - Roles con permisos JSON

**Prioridad en backup:** CRÍTICA  
**Dependencias:** Role → User

#### Dominio: Catálogos y Configuración
- **Office** - Oficinas emisoras de documentos
- **DocumentType** - Tipos de documentos
- **Period** - Períodos fiscales/administrativos
- **Archivador** - Archivadores físicos y lógicos
- **Expediente** - Expedientes para agrupar documentos
- **SystemConfig** - Configuración global del sistema (branding, sellos)

**Prioridad en backup:** ALTA  
**Dependencias:** Period → Archivador; User → Archivador, Expediente

#### Dominio: Documentos y Archivos
- **Document** - Documentos digitalizados con metadata
- **DocumentVersion** - Historial de versiones de documentos

**Prioridad en backup:** CRÍTICA  
**Dependencias:** 
- Document → Archivador, DocumentType, Office, Expediente, User
- DocumentVersion → Document, User

**Archivos asociados:**
- `uploads/documents/*.pdf` - Documentos PDF (timestamp-uuid.pdf)
- `uploads/versions/*.pdf` - Versiones históricas de documentos

#### Dominio: Firmas Digitales
- **Signature** - Firmas digitales con validación Firma Perú
- **SignatureFlow** - Flujos de firma secuenciales

**Prioridad en backup:** CRÍTICA  
**Dependencias:**
- Signature → Document, DocumentVersion, User
- SignatureFlow → Document, User

#### Dominio: Auditoría y Trazabilidad
- **AuditLog** - Logs de todas las acciones del sistema

**Prioridad en backup:** ALTA  
**Dependencias:** AuditLog → User

#### Dominio: Notificaciones
- **Notification** - Notificaciones del sistema a usuarios

**Prioridad en backup:** MEDIA  
**Dependencias:** Notification → User

#### Dominio: Archivos del Sistema
- **uploads/system-config/** - Logos y sellos corporativos
- **uploads/firma-assets/** - Activos de firma digital (sellos, plantillas)

**Prioridad en backup:** ALTA

### 1.2 Diagrama de Dependencias

```
Period
  └─> Archivador
        └─> Document
              ├─> DocumentVersion
              ├─> Signature
              └─> SignatureFlow

Role
  └─> User
        ├─> Document (creator)
        ├─> DocumentVersion (creator)
        ├─> Signature (signer)
        ├─> SignatureFlow (creator)
        ├─> Archivador (creator)
        ├─> Expediente (creator)
        ├─> AuditLog (actor)
        └─> Notification (recipient)

DocumentType
  └─> Document

Office
  └─> Document

Expediente
  └─> Document
```

### 1.3 Orden de Respaldo Recomendado

Para garantizar integridad referencial durante la restauración:

1. **Catálogos base** (sin dependencias): Role, Office, DocumentType, Period, SystemConfig
2. **Usuarios**: User
3. **Estructuras organizativas**: Archivador, Expediente
4. **Documentos principales**: Document
5. **Versiones y firmas**: DocumentVersion, Signature, SignatureFlow
6. **Trazabilidad**: AuditLog, Notification
7. **Archivos del sistema**: uploads/system-config, uploads/firma-assets
8. **Archivos de documentos**: uploads/documents, uploads/versions

---

## 2. DISEÑO DE ENTIDADES PRISMA

### 2.1 BackupSettings

Almacena la configuración global del módulo de respaldos.

```prisma
model BackupSettings {
  id                     String   @id @default(uuid())
  backupPath             String   @default("C:\\SAD\\backups") // Ruta destino en Windows
  retentionDays          Int      @default(30) // Días de retención de respaldos
  compressionEnabled     Boolean  @default(true) // Activar compresión ZIP
  encryptionEnabled      Boolean  @default(false) // Activar encriptación AES-256 (futuro)
  encryptionKey          String?  // Clave de encriptación (hashed)
  maxBackupsToKeep       Int      @default(10) // Máximo número de respaldos completos
  incrementalEnabled     Boolean  @default(true) // Activar respaldos incrementales
  scheduleEnabled        Boolean  @default(false) // Activar programación automática
  scheduleCron           String?  // Expresión cron para programación
  lastBackupAt           DateTime? // Fecha del último respaldo exitoso
  lastBackupJobId        String?  // ID del último trabajo de respaldo
  notifyOnSuccess        Boolean  @default(true) // Notificar respaldos exitosos
  notifyOnFailure        Boolean  @default(true) // Notificar respaldos fallidos
  notificationEmails     Json?    // Array de emails para notificaciones
  excludeTables          Json?    // Array de nombres de tablas a excluir
  excludeFilePatterns    Json?    // Array de patrones glob para excluir archivos
  createdAt              DateTime @default(now())
  updatedAt              DateTime @updatedAt
  updatedBy              String?

  updater                User?     @relation("BackupSettingsUpdater", fields: [updatedBy], references: [id])
  jobs                   BackupJob[]

  @@index([lastBackupAt])
  @@index([updatedBy])
  @@map("backup_settings")
}
```

### 2.2 BackupJob

Representa un trabajo de respaldo específico (completo o incremental).

```prisma
model BackupJob {
  id                  String    @id @default(uuid())
  settingsId          String    // Referencia a configuración vigente
  type                String    // FULL, INCREMENTAL
  status              String    @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED
  startedAt           DateTime  @default(now())
  completedAt         DateTime?
  backupPath          String    // Ruta completa del archivo de respaldo generado
  manifestPath        String?   // Ruta del archivo manifest.json
  totalSizeBytes      BigInt    @default(0) // Tamaño total del respaldo
  filesCount          Int       @default(0) // Número de archivos respaldados
  recordsCount        Int       @default(0) // Número de registros respaldados
  compressedSizeBytes BigInt?   // Tamaño después de compresión
  compressionRatio    Float?    // Ratio de compresión (%)
  errorMessage        String?   @db.Text // Mensaje de error si falla
  errorStack          String?   @db.Text // Stack trace del error
  createdBy           String
  cancelledBy         String?
  cancelledAt         DateTime?
  cancelReason        String?   @db.Text

  settings            BackupSettings @relation(fields: [settingsId], references: [id])
  creator             User           @relation("BackupJobCreator", fields: [createdBy], references: [id])
  canceller           User?          @relation("BackupJobCanceller", fields: [cancelledBy], references: [id])
  items               BackupItem[]

  @@index([status])
  @@index([type])
  @@index([startedAt])
  @@index([createdBy])
  @@index([settingsId])
  @@map("backup_jobs")
}
```

### 2.3 BackupItem

Registra cada archivo o registro respaldado dentro de un trabajo.

```prisma
model BackupItem {
  id             String   @id @default(uuid())
  jobId          String
  itemType       String   // FILE, TABLE_RECORD
  entityType     String   // Document, DocumentVersion, User, etc. o "FILE"
  entityId       String?  // UUID del registro (null para archivos huérfanos)
  filePath       String?  // Ruta original del archivo
  fileHash       String?  // SHA-256 del archivo
  fileSize       BigInt?  // Tamaño del archivo en bytes
  tableName      String?  // Nombre de la tabla (para registros)
  recordSnapshot Json?    // Snapshot JSON del registro (opcional)
  backupAction   String   @default("ADDED") // ADDED, UPDATED, UNCHANGED, DELETED
  createdAt      DateTime @default(now())

  job            BackupJob @relation(fields: [jobId], references: [id], onDelete: Cascade)

  @@index([jobId])
  @@index([entityType, entityId])
  @@index([fileHash])
  @@index([tableName])
  @@map("backup_items")
}
```

### 2.4 BackupManifest (Estructura JSON - No en BD)

El manifest es un archivo JSON generado junto con cada respaldo que documenta su contenido.

```typescript
interface BackupManifest {
  version: string; // Versión del formato del manifest (ej: "1.0.0")
  jobId: string;
  timestamp: string; // ISO 8601
  type: "FULL" | "INCREMENTAL";
  baseBackupJobId?: string; // Para incrementales, referencia al último completo
  
  database: {
    host: string;
    name: string;
    version: string; // Versión de MySQL
  };
  
  tables: {
    name: string;
    recordCount: number;
    exportPath: string; // Ruta relativa dentro del ZIP
    schema: string; // DDL de la tabla (CREATE TABLE)
  }[];
  
  files: {
    sourcePath: string;
    backupPath: string; // Ruta relativa dentro del ZIP
    hash: string; // SHA-256
    size: number;
    entityType: string; // Document, DocumentVersion, SystemConfig
    entityId?: string;
  }[];
  
  excludedTables: string[];
  excludedFilePatterns: string[];
  
  statistics: {
    totalFiles: number;
    totalRecords: number;
    totalSizeBytes: number;
    compressedSizeBytes?: number;
    compressionRatio?: number;
    durationSeconds: number;
  };
  
  errors: {
    message: string;
    entity: string;
    timestamp: string;
  }[];
  
  checksums: {
    manifest: string; // SHA-256 del manifest mismo
    backup: string; // SHA-256 del archivo ZIP completo
  };
}
```

### 2.5 Actualización del Schema User

Agregar relaciones a las nuevas entidades:

```prisma
model User {
  // ... campos existentes ...
  
  backupJobs          BackupJob[]        @relation("BackupJobCreator")
  cancelledBackupJobs BackupJob[]        @relation("BackupJobCanceller")
  backupSettings      BackupSettings[]   @relation("BackupSettingsUpdater")
}
```

---

## 3. ESTRATEGIA INCREMENTAL

### 3.1 Principios de Diseño

El sistema implementa respaldos incrementales para optimizar:
- **Tiempo de ejecución**: Solo procesar cambios desde el último respaldo
- **Espacio de almacenamiento**: Evitar duplicación de archivos inmutables
- **Transferencia de datos**: Minimizar operaciones de E/S

### 3.2 Detección de Cambios

#### Para Archivos (PDFs)
1. **Calcular hash SHA-256** de cada archivo en `uploads/documents`, `uploads/versions`, `uploads/system-config`
2. **Comparar con BackupItem.fileHash** del último respaldo exitoso
3. **Incluir si**:
   - El hash no existe en respaldos anteriores (archivo nuevo)
   - El hash cambió (archivo modificado - raro en PDFs inmutables)
   - La ruta `Document.filePath` cambió pero el hash es el mismo (renombrado - no debería ocurrir)

#### Para Registros de Base de Datos
1. **Usar campo `updatedAt`** de cada tabla para detectar cambios
2. **Comparar con `BackupSettings.lastBackupAt`**
3. **Incluir registro si**:
   - `updatedAt > lastBackupAt` (modificado)
   - `createdAt > lastBackupAt` (nuevo)
4. **Para tablas sin `updatedAt`** (ej: AuditLog solo tiene `createdAt`):
   - Comparar `createdAt > lastBackupAt`

### 3.3 Algoritmo de Respaldo Incremental

```typescript
async function performIncrementalBackup(jobId: string, settingsId: string) {
  const settings = await getBackupSettings(settingsId);
  const lastBackupAt = settings.lastBackupAt;
  
  if (!lastBackupAt) {
    throw new Error("Cannot perform incremental backup without a previous full backup");
  }
  
  const itemsToBackup: BackupItem[] = [];
  
  // 1. Detectar archivos modificados
  const documentFiles = await getAllDocumentFiles();
  for (const file of documentFiles) {
    const hash = await calculateSHA256(file.path);
    const previousBackup = await findBackupItemByHash(hash);
    
    if (!previousBackup) {
      itemsToBackup.push({
        jobId,
        itemType: "FILE",
        filePath: file.path,
        fileHash: hash,
        fileSize: file.size,
        backupAction: "ADDED"
      });
    }
  }
  
  // 2. Detectar registros modificados por tabla
  const tables = ["User", "Document", "DocumentVersion", "Signature", ...];
  for (const table of tables) {
    const modifiedRecords = await prisma[table].findMany({
      where: { updatedAt: { gt: lastBackupAt } }
    });
    
    for (const record of modifiedRecords) {
      itemsToBackup.push({
        jobId,
        itemType: "TABLE_RECORD",
        entityType: table,
        entityId: record.id,
        tableName: table,
        recordSnapshot: record,
        backupAction: "UPDATED"
      });
    }
  }
  
  // 3. Exportar y comprimir solo items detectados
  await exportBackupItems(jobId, itemsToBackup);
  await generateManifest(jobId, itemsToBackup);
  
  // 4. Actualizar lastBackupAt
  await updateBackupSettings(settingsId, { lastBackupAt: new Date() });
}
```

### 3.4 Restauración desde Respaldo Incremental

Para restaurar desde un respaldo incremental, se requiere:
1. **Restaurar el último respaldo FULL** (base)
2. **Aplicar todos los respaldos INCREMENTAL** en orden cronológico hasta el deseado
3. **Resolver conflictos** usando la regla "último cambio gana"

```typescript
async function restoreFromIncrementalBackup(targetJobId: string) {
  // 1. Encontrar el respaldo FULL base
  const incrementalJob = await getBackupJob(targetJobId);
  const fullBackupJob = await findBaseFullBackup(incrementalJob.startedAt);
  
  if (!fullBackupJob) {
    throw new Error("Base full backup not found");
  }
  
  // 2. Restaurar respaldo completo
  await restoreFullBackup(fullBackupJob.id);
  
  // 3. Obtener todos los incrementales entre FULL y target
  const incrementalJobs = await getIncrementalBackupsBetween(
    fullBackupJob.completedAt,
    incrementalJob.completedAt
  );
  
  // 4. Aplicar incrementales en orden
  for (const job of incrementalJobs) {
    await applyIncrementalBackup(job.id);
  }
}
```

---

## 4. RUTA Y PARÁMETROS CONFIGURABLES

### 4.1 Ruta Recomendada en Windows

**Ruta por defecto:** `C:\SAD\backups`

**Justificación:**
- Raíz `C:\` evita problemas de permisos en directorios de usuario
- Nombre corto `SAD` facilita acceso y navegación
- Carpeta `backups` explícita y reconocible
- Fuera del directorio del proyecto para evitar inclusión accidental en control de versiones

**Estructura de carpetas:**
```
C:\SAD\backups\
├── full\
│   ├── 2025-11-04_083015_abc123.zip
│   ├── 2025-11-04_083015_abc123_manifest.json
│   └── ...
├── incremental\
│   ├── 2025-11-04_120530_def456.zip
│   ├── 2025-11-04_120530_def456_manifest.json
│   └── ...
└── temp\  (archivos temporales durante generación)
```

### 4.2 Parámetros Configurables

| Parámetro | Tipo | Valor por Defecto | Descripción |
|-----------|------|-------------------|-------------|
| `backupPath` | string | `C:\SAD\backups` | Ruta destino de respaldos |
| `retentionDays` | number | 30 | Días de retención antes de eliminación automática |
| `maxBackupsToKeep` | number | 10 | Máximo número de respaldos completos a conservar |
| `compressionEnabled` | boolean | true | Activar compresión ZIP (algoritmo DEFLATE) |
| `encryptionEnabled` | boolean | false | Activar encriptación AES-256 (requiere clave) |
| `incrementalEnabled` | boolean | true | Permitir respaldos incrementales |
| `scheduleEnabled` | boolean | false | Activar programación automática con cron |
| `scheduleCron` | string | null | Expresión cron (ej: `0 2 * * *` = 2 AM diario) |
| `notifyOnSuccess` | boolean | true | Enviar notificación en respaldos exitosos |
| `notifyOnFailure` | boolean | true | Enviar notificación en fallos |
| `excludeTables` | string[] | `[]` | Tablas a excluir (ej: `["AuditLog"]`) |
| `excludeFilePatterns` | string[] | `["*.tmp", "*.log"]` | Patrones glob de archivos a excluir |

### 4.3 Validaciones de Configuración

- **backupPath**: Debe ser una ruta válida de Windows, debe tener permisos de escritura
- **retentionDays**: >= 1 y <= 365
- **maxBackupsToKeep**: >= 1 y <= 100
- **scheduleCron**: Expresión cron válida (validar con `cron-parser`)
- **encryptionKey**: Mínimo 32 caracteres si encryptionEnabled = true

---

## 5. ESTRUCTURA DEL MANIFIESTO

### 5.1 Contenido del Manifest JSON

Cada respaldo genera un archivo `{jobId}_manifest.json` con:

```json
{
  "version": "1.0.0",
  "jobId": "abc123-def456-...",
  "timestamp": "2025-11-04T08:30:15.000Z",
  "type": "FULL",
  "baseBackupJobId": null,
  
  "database": {
    "host": "localhost:3306",
    "name": "sad_db",
    "version": "8.0.35"
  },
  
  "tables": [
    {
      "name": "documents",
      "recordCount": 1523,
      "exportPath": "database/documents.json",
      "schema": "CREATE TABLE `documents` (..."
    },
    {
      "name": "users",
      "recordCount": 45,
      "exportPath": "database/users.json",
      "schema": "CREATE TABLE `users` (..."
    }
  ],
  
  "files": [
    {
      "sourcePath": "uploads/documents/1760183015261-7b211ce3.pdf",
      "backupPath": "files/documents/1760183015261-7b211ce3.pdf",
      "hash": "a3f5b89c7d...",
      "size": 9954270,
      "entityType": "Document",
      "entityId": "7b211ce3-9571-4735-a951-33a092ff35be"
    }
  ],
  
  "excludedTables": ["AuditLog"],
  "excludedFilePatterns": ["*.tmp", "*.log"],
  
  "statistics": {
    "totalFiles": 847,
    "totalRecords": 3421,
    "totalSizeBytes": 2147483648,
    "compressedSizeBytes": 1073741824,
    "compressionRatio": 50.0,
    "durationSeconds": 127
  },
  
  "errors": [
    {
      "message": "Failed to read file: permission denied",
      "entity": "uploads/documents/corrupted.pdf",
      "timestamp": "2025-11-04T08:32:45.000Z"
    }
  ],
  
  "checksums": {
    "manifest": "b2e9c3f1a4...",
    "backup": "e1d4a7b8c3..."
  }
}
```

### 5.2 Mapeo Documento → Archivo

El manifest incluye un mapeo explícito entre registros `Document` y archivos físicos:

```json
{
  "files": [
    {
      "entityType": "Document",
      "entityId": "uuid-del-documento",
      "filePath": "uploads/documents/timestamp-uuid.pdf",
      "fileHash": "sha256-hash",
      "size": 1024000,
      "metadata": {
        "documentNumber": "DOC-2025-001",
        "documentDate": "2025-11-04",
        "sender": "Ministerio de Ejemplo"
      }
    }
  ]
}
```

### 5.3 Logs de Exclusiones

Se registran todos los elementos excluidos con su razón:

```json
{
  "exclusions": [
    {
      "type": "TABLE",
      "name": "AuditLog",
      "reason": "Excluded by configuration",
      "recordCount": 50000
    },
    {
      "type": "FILE",
      "path": "uploads/documents/temp_processing.tmp",
      "reason": "Matches exclusion pattern: *.tmp"
    }
  ]
}
```

### 5.4 Métricas de Tamaños

```json
{
  "statistics": {
    "database": {
      "totalRecords": 3421,
      "sizeBytes": 52428800
    },
    "files": {
      "totalFiles": 847,
      "sizeBytes": 2095104000
    },
    "compression": {
      "originalSizeBytes": 2147532800,
      "compressedSizeBytes": 1073741824,
      "compressionRatio": 50.0,
      "algorithm": "DEFLATE"
    },
    "performance": {
      "startTime": "2025-11-04T08:30:15.000Z",
      "endTime": "2025-11-04T08:32:22.000Z",
      "durationSeconds": 127,
      "throughputMBps": 16.9
    }
  }
}
```

---

## 6. DIAGRAMAS DE SECUENCIA

### 6.1 Flujo: Generar Copia de Seguridad

```
Usuario (Admin) → Frontend → Backend API → BackupService → QueueService
                                                ↓
                                          FileSystemService
                                                ↓
                                          DatabaseService
                                                ↓
                                          CompressionService
                                                ↓
                                          AuditService
                                                ↓
                                          NotificationService
```

**Descripción detallada:**

1. **Usuario solicita respaldo**
   - Usuario admin navega a /backups y hace clic en "Generar Respaldo"
   - Frontend valida permisos (rol ADMIN)

2. **Frontend envía request**
   ```
   POST /api/backups
   Headers: Authorization: Bearer <token>
   Body: { type: "FULL" | "INCREMENTAL" }
   ```

3. **Backend valida request**
   - Middleware `authenticateToken` valida JWT
   - Middleware `authorize(['ADMIN'])` verifica permisos
   - Controller `backupController.createBackup(req, res)`

4. **BackupService crea BackupJob**
   ```typescript
   const job = await prisma.backupJob.create({
     data: {
       settingsId: settings.id,
       type: req.body.type,
       status: "PENDING",
       createdBy: req.user.id
     }
   });
   ```

5. **Agregar a cola de procesamiento**
   ```typescript
   await queueService.addToBackupQueue(job.id);
   ```
   - Evita bloquear la respuesta HTTP
   - Permite reintentos en caso de fallo

6. **QueueService procesa trabajo**
   - Cambia status a "IN_PROGRESS"
   - Ejecuta `BackupService.performBackup(job.id)`

7. **BackupService ejecuta respaldo**
   
   a. **Verificar espacio disponible**
   ```typescript
   const freeSpace = await checkDiskSpace(settings.backupPath);
   if (freeSpace < estimatedSize * 1.2) {
     throw new Error("Insufficient disk space");
   }
   ```
   
   b. **Crear directorio temporal**
   ```typescript
   const tempDir = path.join(settings.backupPath, 'temp', job.id);
   await fs.mkdir(tempDir, { recursive: true });
   ```
   
   c. **Exportar base de datos**
   ```typescript
   await DatabaseService.exportTables(tempDir, job);
   ```
   - Para cada tabla: `prisma.{table}.findMany()`
   - Serializar a JSON: `database/{table}.json`
   - Registrar en BackupItem
   
   d. **Copiar archivos**
   ```typescript
   await FileSystemService.copyFiles(tempDir, job);
   ```
   - Calcular hashes SHA-256
   - Comparar con respaldos anteriores (si incremental)
   - Copiar solo archivos nuevos/modificados
   - Registrar en BackupItem
   
   e. **Generar manifest**
   ```typescript
   const manifest = await BackupService.generateManifest(job);
   await fs.writeFile(
     path.join(tempDir, 'manifest.json'),
     JSON.stringify(manifest, null, 2)
   );
   ```
   
   f. **Comprimir respaldo**
   ```typescript
   const zipPath = await CompressionService.createZip(tempDir, job);
   ```
   - Usar librería `adm-zip` o `archiver`
   - Comprimir con DEFLATE
   - Calcular checksum del ZIP
   
   g. **Mover a destino final**
   ```typescript
   const finalPath = path.join(
     settings.backupPath,
     job.type.toLowerCase(),
     `${timestamp}_${job.id}.zip`
   );
   await fs.rename(zipPath, finalPath);
   ```
   
   h. **Limpiar temporales**
   ```typescript
   await fs.rm(tempDir, { recursive: true });
   ```
   
   i. **Actualizar BackupJob**
   ```typescript
   await prisma.backupJob.update({
     where: { id: job.id },
     data: {
       status: "COMPLETED",
       completedAt: new Date(),
       backupPath: finalPath,
       totalSizeBytes: stats.size,
       filesCount: items.filter(i => i.itemType === "FILE").length,
       recordsCount: items.filter(i => i.itemType === "TABLE_RECORD").length
     }
   });
   ```
   
   j. **Actualizar BackupSettings**
   ```typescript
   await prisma.backupSettings.update({
     where: { id: settings.id },
     data: {
       lastBackupAt: new Date(),
       lastBackupJobId: job.id
     }
   });
   ```

8. **Auditar acción**
   ```typescript
   await audit.service.log({
     userId: job.createdBy,
     action: "BACKUP_CREATED",
     module: "BACKUP",
     entityType: "BackupJob",
     entityId: job.id,
     newValue: { type: job.type, status: "COMPLETED", size: job.totalSizeBytes }
   });
   ```

9. **Notificar usuario**
   ```typescript
   await NotificationService.create({
     userId: job.createdBy,
     type: "BACKUP_SUCCESS",
     title: "Respaldo completado exitosamente",
     message: `Se generó un respaldo ${job.type} de ${formatBytes(job.totalSizeBytes)}`,
     priority: "NORMAL",
     actionUrl: `/backups/${job.id}`,
     actionLabel: "Ver detalles"
   });
   ```

10. **Respuesta al frontend**
    ```json
    {
      "success": true,
      "jobId": "abc123-...",
      "message": "Respaldo iniciado exitosamente. Recibirá una notificación al completar."
    }
    ```

### 6.2 Flujo: Restaurar Respaldo

```
Usuario (Admin) → Frontend → Backend API → RestoreService → QueueService
                                                ↓
                                          ValidationService
                                                ↓
                                          DatabaseService
                                                ↓
                                          FileSystemService
                                                ↓
                                          AuditService
                                                ↓
                                          NotificationService
```

**Descripción detallada:**

1. **Usuario solicita restauración**
   - Usuario admin navega a /backups/{jobId}
   - Frontend muestra advertencia: "Esta acción sobrescribirá datos actuales. ¿Continuar?"
   - Usuario confirma con contraseña

2. **Frontend envía request**
   ```
   POST /api/backups/{jobId}/restore
   Headers: Authorization: Bearer <token>
   Body: { 
     password: "********",
     overwriteExisting: true,
     restoreFiles: true,
     restoreDatabase: true
   }
   ```

3. **Backend valida request**
   - Verificar permisos de ADMIN
   - Verificar contraseña del usuario
   - Verificar que el respaldo existe y está COMPLETED

4. **RestoreService valida respaldo**
   
   a. **Verificar integridad del archivo**
   ```typescript
   const zipBuffer = await fs.readFile(job.backupPath);
   const actualChecksum = calculateSHA256(zipBuffer);
   
   if (actualChecksum !== manifest.checksums.backup) {
     throw new Error("Backup file corrupted: checksum mismatch");
   }
   ```
   
   b. **Validar manifest**
   ```typescript
   const manifest = await parseManifest(job.manifestPath);
   validateManifestSchema(manifest);
   ```
   
   c. **Verificar compatibilidad de versión**
   ```typescript
   if (manifest.version !== CURRENT_MANIFEST_VERSION) {
     throw new Error("Incompatible backup version");
   }
   ```

5. **Crear punto de restauración pre-restauración**
   ```typescript
   const preRestoreBackup = await BackupService.createBackup({
     type: "FULL",
     createdBy: req.user.id,
     reason: `Pre-restore checkpoint before restoring ${job.id}`
   });
   ```

6. **Extraer respaldo**
   ```typescript
   const extractDir = path.join(settings.backupPath, 'temp', `restore_${job.id}`);
   await CompressionService.extractZip(job.backupPath, extractDir);
   ```

7. **Restaurar base de datos**
   
   a. **Desactivar restricciones de FK**
   ```sql
   SET FOREIGN_KEY_CHECKS=0;
   ```
   
   b. **Truncar tablas en orden inverso**
   ```typescript
   for (const table of TABLES_IN_REVERSE_ORDER) {
     await prisma.$executeRaw`TRUNCATE TABLE ${table}`;
   }
   ```
   
   c. **Importar registros en orden**
   ```typescript
   for (const tableInfo of manifest.tables) {
     const records = await fs.readJSON(path.join(extractDir, tableInfo.exportPath));
     
     for (const record of records) {
       await prisma[tableInfo.name].create({ data: record });
     }
   }
   ```
   
   d. **Reactivar restricciones de FK**
   ```sql
   SET FOREIGN_KEY_CHECKS=1;
   ```

8. **Restaurar archivos**
   ```typescript
   for (const fileInfo of manifest.files) {
     const sourcePath = path.join(extractDir, fileInfo.backupPath);
     const destPath = path.join(process.cwd(), fileInfo.sourcePath);
     
     await fs.mkdir(path.dirname(destPath), { recursive: true });
     await fs.copyFile(sourcePath, destPath);
     
     // Verificar integridad
     const restoredHash = await calculateSHA256(destPath);
     if (restoredHash !== fileInfo.hash) {
       throw new Error(`File integrity check failed: ${destPath}`);
     }
   }
   ```

9. **Limpiar temporales**
   ```typescript
   await fs.rm(extractDir, { recursive: true });
   ```

10. **Registrar restauración**
    ```typescript
    await prisma.backupJob.update({
      where: { id: job.id },
      data: {
        restoredAt: new Date(),
        restoredBy: req.user.id
      }
    });
    ```

11. **Auditar acción**
    ```typescript
    await audit.service.log({
      userId: req.user.id,
      action: "BACKUP_RESTORED",
      module: "BACKUP",
      entityType: "BackupJob",
      entityId: job.id,
      oldValue: { preRestoreBackupId: preRestoreBackup.id }
    });
    ```

12. **Notificar usuario**
    ```typescript
    await NotificationService.create({
      userId: req.user.id,
      type: "BACKUP_RESTORED",
      title: "Respaldo restaurado exitosamente",
      message: `Se restauró el respaldo ${job.type} del ${formatDate(job.startedAt)}`,
      priority: "HIGH"
    });
    ```

13. **Respuesta al frontend**
    ```json
    {
      "success": true,
      "restoredRecords": 3421,
      "restoredFiles": 847,
      "preRestoreBackupId": "xyz789-...",
      "message": "Respaldo restaurado exitosamente"
    }
    ```

---

## 7. PLAN DE RIESGOS Y MITIGACIONES

### 7.1 Riesgo: Fallos de E/S

**Descripción:** Errores al leer/escribir archivos durante respaldo o restauración (disco lleno, permisos, corrupción).

**Probabilidad:** Media  
**Impacto:** Alto

**Mitigaciones:**

1. **Verificación de espacio pre-respaldo**
   ```typescript
   const freeSpace = await checkDiskSpace(backupPath);
   const estimatedSize = await estimateBackupSize();
   
   if (freeSpace < estimatedSize * 1.2) { // 20% buffer
     throw new BackupError("Insufficient disk space", "DISK_SPACE");
   }
   ```

2. **Manejo robusto de errores**
   ```typescript
   try {
     await fs.copyFile(source, dest);
   } catch (error) {
     if (error.code === 'ENOSPC') {
       await rollbackBackup(jobId);
       throw new BackupError("Disk full during backup", "DISK_SPACE");
     } else if (error.code === 'EACCES') {
       throw new BackupError("Permission denied", "PERMISSION");
     }
     throw error;
   }
   ```

3. **Verificación de integridad post-copia**
   ```typescript
   const originalHash = await calculateSHA256(sourcePath);
   const copiedHash = await calculateSHA256(destPath);
   
   if (originalHash !== copiedHash) {
     await fs.unlink(destPath);
     throw new BackupError("File integrity check failed", "INTEGRITY");
   }
   ```

4. **Logs detallados**
   ```typescript
   logger.error('Backup I/O error', {
     jobId,
     file: sourcePath,
     error: error.message,
     code: error.code,
     timestamp: new Date().toISOString()
   });
   ```

### 7.2 Riesgo: Espacio Insuficiente

**Descripción:** El disco destino se queda sin espacio durante el respaldo.

**Probabilidad:** Media  
**Impacto:** Alto

**Mitigaciones:**

1. **Estimación de tamaño pre-respaldo**
   ```typescript
   async function estimateBackupSize(type: "FULL" | "INCREMENTAL"): Promise<number> {
     let size = 0;
     
     // Tamaño de archivos
     const files = await getAllDocumentFiles();
     for (const file of files) {
       const stats = await fs.stat(file.path);
       size += stats.size;
     }
     
     // Tamaño estimado de BD (JSON serializado ~2x tamaño en memoria)
     const recordCounts = await getAllRecordCounts();
     size += recordCounts.total * 500; // ~500 bytes por registro promedio
     
     // Si es incremental, reducir estimación
     if (type === "INCREMENTAL" && lastBackupAt) {
       const changeRate = await estimateChangeRate();
       size *= changeRate; // ej: 0.1 = 10% de cambios
     }
     
     return size;
   }
   ```

2. **Compresión para ahorrar espacio**
   ```typescript
   await CompressionService.createZip(tempDir, job, {
     compressionLevel: 9, // Máxima compresión
     largFiles: true // Soporte para archivos >2GB
   });
   ```

3. **Limpieza automática de respaldos antiguos**
   ```typescript
   await cleanupOldBackups({
     retentionDays: settings.retentionDays,
     maxBackupsToKeep: settings.maxBackupsToKeep
   });
   ```

4. **Monitoreo de espacio en tiempo real**
   ```typescript
   setInterval(async () => {
     const freeSpace = await checkDiskSpace(backupPath);
     if (freeSpace < MINIMUM_REQUIRED_SPACE) {
       await NotificationService.notifyAdmins({
         type: "DISK_SPACE_WARNING",
         message: `Low disk space on backup drive: ${formatBytes(freeSpace)} remaining`
       });
     }
   }, 60000); // Cada minuto
   ```

### 7.3 Riesgo: Interrupciones (Corte de energía, Cierre de Servidor)

**Descripción:** El proceso de respaldo/restauración se interrumpe abruptamente.

**Probabilidad:** Baja  
**Impacto:** Alto

**Mitigaciones:**

1. **Sistema de checkpoints**
   ```typescript
   interface BackupCheckpoint {
     jobId: string;
     phase: "EXPORTING_DB" | "COPYING_FILES" | "COMPRESSING" | "FINALIZING";
     completedTables: string[];
     completedFiles: string[];
     timestamp: Date;
   }
   
   async function saveCheckpoint(checkpoint: BackupCheckpoint) {
     await fs.writeJSON(
       path.join(tempDir, 'checkpoint.json'),
       checkpoint
     );
   }
   
   async function resumeFromCheckpoint(jobId: string) {
     const checkpoint = await loadCheckpoint(jobId);
     
     switch (checkpoint.phase) {
       case "EXPORTING_DB":
         // Reanudar exportación de tablas faltantes
         const remainingTables = TABLES.filter(t => !checkpoint.completedTables.includes(t));
         await exportTables(remainingTables);
         break;
       
       case "COPYING_FILES":
         // Reanudar copia de archivos faltantes
         const remainingFiles = allFiles.filter(f => !checkpoint.completedFiles.includes(f));
         await copyFiles(remainingFiles);
         break;
       
       // ...
     }
   }
   ```

2. **Transacciones atómicas en restauración**
   ```typescript
   await prisma.$transaction(async (tx) => {
     // Todas las operaciones de BD dentro de la transacción
     // Si falla, rollback automático
     
     for (const table of tables) {
       await tx[table].createMany({ data: records[table] });
     }
   }, {
     maxWait: 600000, // 10 minutos
     timeout: 3600000 // 1 hora
   });
   ```

3. **Limpieza de respaldos parciales al iniciar**
   ```typescript
   async function cleanupOrphanedBackups() {
     const pendingJobs = await prisma.backupJob.findMany({
       where: { status: { in: ["PENDING", "IN_PROGRESS"] } }
     });
     
     for (const job of pendingJobs) {
       const jobAge = Date.now() - job.startedAt.getTime();
       
       if (jobAge > MAX_JOB_DURATION) {
         await prisma.backupJob.update({
           where: { id: job.id },
           data: { 
             status: "FAILED",
             errorMessage: "Job interrupted and exceeded max duration"
           }
         });
         
         // Limpiar archivos temporales
         const tempDir = path.join(backupPath, 'temp', job.id);
         if (await fs.pathExists(tempDir)) {
           await fs.rm(tempDir, { recursive: true });
         }
       }
     }
   }
   ```

4. **Respaldo incremental como red de seguridad**
   - Si un respaldo completo falla a mitad, el incremental anterior + respaldos previos siguen disponibles
   - No se elimina el respaldo anterior hasta que el nuevo esté COMPLETED

### 7.4 Riesgo: Corrupción de Datos

**Descripción:** Los datos respaldados o restaurados se corrompen (bit rot, bugs, ataques).

**Probabilidad:** Baja  
**Impacto:** Crítico

**Mitigaciones:**

1. **Checksums SHA-256 en múltiples niveles**
   - Por archivo individual
   - Por tabla exportada
   - Por archivo ZIP completo
   - Por manifest JSON

2. **Verificación post-respaldo**
   ```typescript
   async function verifyBackup(jobId: string): Promise<VerificationReport> {
     const job = await getBackupJob(jobId);
     const manifest = await parseManifest(job.manifestPath);
     const errors: string[] = [];
     
     // 1. Verificar integridad del ZIP
     const zipHash = await calculateSHA256(job.backupPath);
     if (zipHash !== manifest.checksums.backup) {
       errors.push("ZIP checksum mismatch");
     }
     
     // 2. Verificar integridad del manifest
     const manifestHash = await calculateSHA256(job.manifestPath);
     if (manifestHash !== manifest.checksums.manifest) {
       errors.push("Manifest checksum mismatch");
     }
     
     // 3. Extraer y verificar archivos internos
     const extractDir = await extractZipToTemp(job.backupPath);
     
     for (const file of manifest.files) {
       const filePath = path.join(extractDir, file.backupPath);
       const fileHash = await calculateSHA256(filePath);
       
       if (fileHash !== file.hash) {
         errors.push(`File corrupted: ${file.backupPath}`);
       }
     }
     
     await fs.rm(extractDir, { recursive: true });
     
     return {
       jobId,
       isValid: errors.length === 0,
       errors,
       timestamp: new Date()
     };
   }
   ```

3. **Verificación periódica de respaldos**
   ```typescript
   // Cron job que verifica un respaldo aleatorio cada semana
   cron.schedule('0 3 * * 0', async () => {
     const randomBackup = await getRandomCompletedBackup();
     const report = await verifyBackup(randomBackup.id);
     
     if (!report.isValid) {
       await NotificationService.notifyAdmins({
         type: "BACKUP_CORRUPTION_DETECTED",
         title: "Respaldo corrupto detectado",
         message: `Respaldo ${randomBackup.id} falló verificación de integridad`,
         priority: "HIGH"
       });
     }
   });
   ```

4. **Almacenamiento redundante (futuro)**
   - Copiar respaldos a segunda ubicación (NAS, nube)
   - Usar RAID para proteger contra fallos de disco

### 7.5 Riesgo: Errores de Sincronización (Race Conditions)

**Descripción:** Dos respaldos simultáneos o respaldo durante restauración causan inconsistencias.

**Probabilidad:** Baja  
**Impacto:** Alto

**Mitigaciones:**

1. **Lock de operaciones exclusivas**
   ```typescript
   class BackupLockService {
     private activeLock: string | null = null;
     
     async acquireLock(operation: "BACKUP" | "RESTORE"): Promise<string> {
       if (this.activeLock) {
         throw new BackupError(
           `Cannot ${operation}: ${this.activeLock} operation in progress`,
           "LOCK_CONFLICT"
         );
       }
       
       const lockId = uuidv4();
       this.activeLock = lockId;
       
       return lockId;
     }
     
     async releaseLock(lockId: string): Promise<void> {
       if (this.activeLock === lockId) {
         this.activeLock = null;
       }
     }
   }
   ```

2. **Validación en Frontend**
   ```typescript
   // Deshabilitar botón "Generar Respaldo" si hay uno en progreso
   const activeBackup = await checkActiveBackup();
   if (activeBackup) {
     return (
       <Button disabled>
         Respaldo en progreso... ({activeBackup.progress}%)
       </Button>
     );
   }
   ```

3. **Timeouts para locks huérfanos**
   ```typescript
   setInterval(async () => {
     const staleLocks = await findStaleBackupLocks();
     for (const lock of staleLocks) {
       await releaseLock(lock.id);
       logger.warn(`Released stale backup lock: ${lock.id}`);
     }
   }, 300000); // Cada 5 minutos
   ```

### 7.6 Riesgo: Pérdida de Archivos Huérfanos

**Descripción:** Archivos en `uploads/` que no tienen registro asociado en BD se pierden en respaldo.

**Probabilidad:** Media  
**Impacto:** Medio

**Mitigaciones:**

1. **Detectar archivos huérfanos durante respaldo**
   ```typescript
   async function findOrphanedFiles(): Promise<OrphanedFile[]> {
     const allFiles = await getAllFilesInUploads();
     const orphans: OrphanedFile[] = [];
     
     for (const file of allFiles) {
       const fileName = path.basename(file.path);
       
       // Buscar en Document
       const doc = await prisma.document.findFirst({
         where: { fileName }
       });
       
       // Buscar en DocumentVersion
       const version = await prisma.documentVersion.findFirst({
         where: { fileName }
       });
       
       if (!doc && !version) {
         orphans.push({
           path: file.path,
           size: file.size,
           modifiedAt: file.modifiedAt
         });
       }
     }
     
     return orphans;
   }
   ```

2. **Incluir huérfanos en respaldo con advertencia**
   ```typescript
   const orphans = await findOrphanedFiles();
   
   for (const orphan of orphans) {
     await BackupItem.create({
       jobId,
       itemType: "FILE",
       filePath: orphan.path,
       fileHash: await calculateSHA256(orphan.path),
       fileSize: orphan.size,
       entityType: "ORPHANED_FILE",
       entityId: null
     });
   }
   
   if (orphans.length > 0) {
     logger.warn(`Found ${orphans.length} orphaned files during backup`);
   }
   ```

3. **Reporte de huérfanos post-respaldo**
   ```typescript
   const report = {
     orphanedFiles: orphans.length,
     totalSize: orphans.reduce((sum, o) => sum + o.size, 0),
     files: orphans.map(o => ({
       path: o.path,
       size: formatBytes(o.size),
       lastModified: o.modifiedAt
     }))
   };
   
   await NotificationService.create({
     userId: job.createdBy,
     type: "BACKUP_ORPHANS_DETECTED",
     title: "Archivos huérfanos detectados",
     message: `Se encontraron ${orphans.length} archivos sin registro en BD`,
     data: report
   });
   ```

### 7.7 Plan de Reintentos

**Estrategia:** Exponential backoff con jitter

```typescript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        const jitter = Math.random() * 1000;
        
        logger.warn(`Retry ${attempt + 1}/${maxRetries} after ${delay + jitter}ms`, {
          error: error.message
        });
        
        await sleep(delay + jitter);
      }
    }
  }
  
  throw new BackupError(
    `Operation failed after ${maxRetries} retries: ${lastError.message}`,
    "MAX_RETRIES_EXCEEDED"
  );
}
```

---

## 8. SERVICIOS Y RESPONSABILIDADES

### 8.1 BackupService

**Responsabilidades:**
- Coordinar todo el proceso de respaldo y restauración
- Crear y actualizar BackupJob
- Orquestar llamadas a otros servicios
- Calcular estimaciones de tamaño
- Gestionar configuración (BackupSettings)

**Métodos principales:**
```typescript
class BackupService {
  async createBackup(type: "FULL" | "INCREMENTAL", userId: string): Promise<BackupJob>
  async performBackup(jobId: string): Promise<void>
  async restoreBackup(jobId: string, userId: string, options: RestoreOptions): Promise<void>
  async getBackupStatus(jobId: string): Promise<BackupStatus>
  async listBackups(filters: BackupFilters): Promise<PaginatedBackups>
  async deleteBackup(jobId: string, userId: string): Promise<void>
  async verifyBackup(jobId: string): Promise<VerificationReport>
  async estimateBackupSize(type: "FULL" | "INCREMENTAL"): Promise<number>
  async cleanupOldBackups(): Promise<number>
}
```

### 8.2 DatabaseExportService

**Responsabilidades:**
- Exportar tablas de Prisma a JSON
- Importar JSON a Prisma durante restauración
- Gestionar dependencias entre tablas
- Manejar transacciones

**Métodos principales:**
```typescript
class DatabaseExportService {
  async exportTables(tables: string[], outputDir: string): Promise<ExportResult>
  async exportTable(tableName: string, outputPath: string): Promise<number>
  async importTables(inputDir: string, tables: string[]): Promise<ImportResult>
  async importTable(tableName: string, inputPath: string): Promise<number>
  async getTableSchema(tableName: string): Promise<string>
  async truncateTable(tableName: string): Promise<void>
}
```

### 8.3 FileSystemService

**Responsabilidades:**
- Copiar archivos de uploads/
- Calcular hashes SHA-256
- Verificar integridad
- Gestionar directorios temporales

**Métodos principales:**
```typescript
class FileSystemService {
  async copyFiles(files: FileInfo[], destDir: string): Promise<CopyResult>
  async calculateFileHash(filePath: string): Promise<string>
  async verifyFileIntegrity(filePath: string, expectedHash: string): Promise<boolean>
  async getAllDocumentFiles(): Promise<FileInfo[]>
  async findOrphanedFiles(): Promise<OrphanedFile[]>
  async checkDiskSpace(path: string): Promise<number>
}
```

### 8.4 CompressionService

**Responsabilidades:**
- Comprimir directorios a ZIP
- Extraer ZIP a directorio
- Calcular checksum de ZIP

**Métodos principales:**
```typescript
class CompressionService {
  async createZip(sourceDir: string, outputPath: string, options?: CompressionOptions): Promise<string>
  async extractZip(zipPath: string, destDir: string): Promise<void>
  async calculateZipChecksum(zipPath: string): Promise<string>
  async getCompressionRatio(originalSize: number, compressedSize: number): Promise<number>
}
```

### 8.5 ManifestService

**Responsabilidades:**
- Generar manifest.json
- Validar estructura de manifest
- Parsear manifest desde JSON

**Métodos principales:**
```typescript
class ManifestService {
  async generateManifest(job: BackupJob, items: BackupItem[]): Promise<BackupManifest>
  async saveManifest(manifest: BackupManifest, outputPath: string): Promise<void>
  async loadManifest(manifestPath: string): Promise<BackupManifest>
  async validateManifest(manifest: BackupManifest): Promise<ValidationResult>
}
```

### 8.6 QueueService (Extender Existente)

**Responsabilidades:**
- Cola de trabajos de respaldo
- Cola de trabajos de restauración
- Gestión de reintentos

**Métodos a agregar:**
```typescript
// Agregar a queue.service.ts existente
async addToBackupQueue(jobId: string): Promise<void>
async addToRestoreQueue(jobId: string, options: RestoreOptions): Promise<void>
```

### 8.7 AuditService (Usar Existente)

Registrar todas las acciones de respaldo/restauración:
- BACKUP_CREATED
- BACKUP_COMPLETED
- BACKUP_FAILED
- BACKUP_RESTORED
- BACKUP_DELETED
- BACKUP_VERIFIED
- BACKUP_SETTINGS_UPDATED

### 8.8 NotificationService (Usar Existente)

Notificar eventos críticos:
- Respaldo completado exitosamente
- Respaldo fallido
- Restauración completada
- Espacio en disco bajo
- Respaldo corrupto detectado

---

## 9. DEPENDENCIAS Y TECNOLOGÍAS

### 9.1 Librerías Node.js

```json
{
  "dependencies": {
    "adm-zip": "^0.5.10",           // Compresión ZIP
    "archiver": "^6.0.1",            // Alternativa para compresión streaming
    "node-cron": "^3.0.3",           // Programación de respaldos
    "cron-parser": "^4.9.0",         // Validación de expresiones cron
    "check-disk-space": "^3.4.0",   // Verificar espacio disponible
    "crypto": "built-in"             // SHA-256 hashing
  }
}
```

### 9.2 Tipos TypeScript

```bash
npm install --save-dev @types/adm-zip @types/archiver @types/node-cron
```

### 9.3 Herramientas del Sistema

- **mysqldump** (opcional): Para exportación nativa de MySQL si Prisma JSON no es suficiente
- **7-Zip** (opcional): Para compresión más eficiente en Windows

---

## 10. POLÍTICAS DE OPERACIÓN

### 10.1 Frecuencia Recomendada

- **Respaldos completos (FULL)**: Semanal (domingo 2:00 AM)
- **Respaldos incrementales**: Diario (2:00 AM lunes-sábado)
- **Verificación de integridad**: Mensual (primer domingo del mes 3:00 AM)

### 10.2 Retención

- **Respaldos completos**: Conservar últimos 4 (1 mes)
- **Respaldos incrementales**: Conservar 7 días
- **Respaldos pre-restauración**: Conservar indefinidamente (hasta limpieza manual)

### 10.3 Permisos

- **Crear respaldo**: Solo rol ADMIN
- **Restaurar respaldo**: Solo rol ADMIN + confirmación de contraseña
- **Ver lista de respaldos**: Rol ADMIN
- **Eliminar respaldo**: Solo rol ADMIN + confirmación
- **Configurar parámetros**: Solo rol ADMIN

### 10.4 Notificaciones

- **Respaldo exitoso**: Notificación normal a usuario creador
- **Respaldo fallido**: Notificación alta prioridad a todos los ADMIN
- **Restauración completada**: Notificación alta prioridad a todos los ADMIN
- **Espacio bajo**: Email inmediato a administradores

---

## 11. MÉTRICAS Y MONITOREO

### 11.1 KPIs del Módulo

- **Tasa de éxito de respaldos**: Target 99%
- **Tiempo promedio de respaldo completo**: Target <5 minutos
- **Tiempo promedio de respaldo incremental**: Target <2 minutos
- **Ratio de compresión promedio**: Target ~50%
- **Espacio total utilizado**: Monitorear <80% del disco

### 11.2 Dashboard

El frontend debe mostrar:
- Último respaldo exitoso (fecha, tipo, tamaño)
- Próximo respaldo programado
- Lista de respaldos recientes (10 últimos)
- Gráfico de tendencia de tamaño de respaldos
- Estado del espacio en disco
- Tasa de éxito últimos 30 días

---

## 12. FASES DE IMPLEMENTACIÓN

### Fase 1: Modelos y Configuración (PROMPT 036)
- Crear nuevas entidades Prisma
- Migrar base de datos
- Implementar BackupSettings CRUD
- Configurar valores por defecto

### Fase 2: Core de Respaldo (PROMPT 037)
- Implementar BackupService.createBackup()
- Implementar DatabaseExportService
- Implementar FileSystemService
- Implementar CompressionService
- Implementar ManifestService
- Integrar con QueueService

### Fase 3: Restauración (PROMPT 038)
- Implementar BackupService.restoreBackup()
- Implementar validaciones de integridad
- Implementar checkpoints
- Crear respaldo pre-restauración automático

### Fase 4: Frontend (PROMPT 039)
- Crear página /backups
- Formulario de configuración
- Lista de respaldos con filtros
- Botones de acciones (crear, restaurar, eliminar, verificar)
- Dashboard de métricas

### Fase 5: Programación y Automatización (PROMPT 040)
- Implementar scheduler con node-cron
- Limpieza automática de respaldos antiguos
- Verificación periódica de integridad
- Notificaciones automáticas

---

## 13. CONSIDERACIONES DE SEGURIDAD

### 13.1 Encriptación (Futuro)

Cuando se implemente `encryptionEnabled`:
- Usar algoritmo AES-256-GCM
- Derivar clave de encriptación con PBKDF2 (100,000 iteraciones)
- Almacenar IV (Initialization Vector) en el manifest
- Nunca almacenar la clave en texto plano

### 13.2 Permisos de Archivos

- Respaldos deben ser de solo lectura para usuarios normales
- Solo proceso del servidor debe tener escritura en backupPath
- Manifest contiene información sensible (estructura de BD)

### 13.3 Auditoría

Todas las operaciones deben auditarse:
- Quién creó el respaldo
- Cuándo se creó
- Quién restauró un respaldo
- Qué datos se restauraron

---

## RESUMEN EJECUTIVO

Este documento define la arquitectura completa del módulo de copias de seguridad inteligente para el SAD:

**Características clave:**
- Respaldos completos e incrementales con hashes SHA-256
- Detección automática de cambios en archivos y registros
- Compresión ZIP con ratios ~50%
- Manifest JSON detallado con checksums
- Sistema de checkpoints para resiliencia ante interrupciones
- Validación de integridad pre/post operaciones
- Integración con auditoría y notificaciones
- Configuración flexible con valores por defecto optimizados

**Prioridades de respaldo:**
1. Documentos y archivos (CRÍTICO)
2. Firmas digitales (CRÍTICO)
3. Usuarios y autenticación (CRÍTICO)
4. Catálogos y configuración (ALTO)
5. Auditoría (ALTO)
6. Notificaciones (MEDIO)

**Próximos pasos:**
Proceder con **PROMPT 036** para implementar el backend del motor de copias de seguridad basado en esta arquitectura.

---

**Fin del Documento de Arquitectura**
