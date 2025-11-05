# Guía de Implementación - Módulo de Copias de Seguridad Inteligente

## Resumen Ejecutivo

Este documento consolida el diseño arquitectónico del módulo de copias de seguridad inteligente para el Sistema Integrado de Archivos Digitales (SAD) y proporciona una hoja de ruta clara para su implementación.

---

## Documentos del Diseño Arquitectónico

El diseño completo se encuentra distribuido en los siguientes documentos:

1. **backup-module-architecture.md** - Documento principal con especificaciones completas
2. **backup-module-prisma-schema.prisma** - Modelos de datos Prisma
3. **backup-module-sequence-diagrams.md** - Diagramas de flujo y secuencia
4. **backup-module-types.ts** - Tipos y interfaces TypeScript

---

## Características Principales

### ✅ Respaldos Inteligentes
- **Respaldos completos (FULL)**: Incluyen toda la base de datos y archivos
- **Respaldos incrementales**: Solo cambios desde el último respaldo
- **Detección de cambios**: Basada en hashes SHA-256 y timestamps
- **Compresión ZIP**: Reduce tamaño ~50% usando DEFLATE
- **Manifest JSON**: Documentación completa de cada respaldo

### ✅ Integridad y Seguridad
- **Checksums SHA-256** en múltiples niveles (archivos, tablas, ZIP, manifest)
- **Validación pre-restauración** para detectar corrupción
- **Respaldo pre-restauración automático** como red de seguridad
- **Auditoría completa** de todas las operaciones
- **Encriptación opcional** AES-256 (planificado para futuro)

### ✅ Resiliencia
- **Sistema de checkpoints** para reanudar tras interrupciones
- **Reintentos con exponential backoff**
- **Locks de exclusión** para evitar conflictos
- **Verificación de espacio** antes de iniciar
- **Limpieza automática** de respaldos antiguos

### ✅ Configurabilidad
- **Ruta personalizable** (por defecto: `C:\SAD\backups`)
- **Retención configurable** (días, número máximo de respaldos)
- **Programación automática** con expresiones cron
- **Exclusiones** de tablas y archivos específicos
- **Notificaciones** personalizables

---

## Arquitectura de Alto Nivel

### Capas del Sistema

```
┌─────────────────────────────────────────┐
│         FRONTEND (Next.js)              │
│  - BackupList Page                      │
│  - BackupConfig Page                    │
│  - BackupDashboard Page                 │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│      BACKEND API (Express)              │
│  - Routes & Controllers                 │
│  - Auth & Authorization                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│     BUSINESS LOGIC (Services)           │
│  - BackupService                        │
│  - RestoreService                       │
│  - DatabaseExportService                │
│  - FileSystemService                    │
│  - CompressionService                   │
│  - ManifestService                      │
│  - ValidationService                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│    PERSISTENCE (MySQL + FileSystem)     │
│  - BackupSettings, BackupJob, BackupItem│
│  - C:\SAD\backups\                      │
└─────────────────────────────────────────┘
```

---

## Plan de Implementación por Fases

### 📦 FASE 1: Modelos y Configuración (PROMPT 036)

**Objetivo**: Establecer fundamentos de datos y configuración

**Tareas**:
1. Agregar modelos Prisma al schema:
   - BackupSettings
   - BackupJob
   - BackupItem
   - Actualizar User con relaciones

2. Crear y ejecutar migración:
   ```bash
   cd backend
   npx prisma migrate dev --name add_backup_module
   npx prisma generate
   ```

3. Implementar BackupSettings CRUD:
   - `backend/src/services/backup-settings.service.ts`
   - `backend/src/controllers/backup-settings.controller.ts`
   - `backend/src/routes/backup-settings.routes.ts`

4. Crear configuración inicial por defecto:
   - Seed script para BackupSettings
   - Valores por defecto según especificación

**Entregables**:
- ✅ Schema Prisma actualizado y migrado
- ✅ CRUD de BackupSettings funcional
- ✅ Tests de configuración básica

**Duración estimada**: 2-3 horas

---

### 📦 FASE 2: Core de Respaldo (PROMPT 037)

**Objetivo**: Implementar el motor de respaldos completos e incrementales

**Tareas**:
1. Implementar servicios especializados:

   **DatabaseExportService** (`database-export.service.ts`):
   ```typescript
   - exportTables(): Exportar tablas a JSON
   - exportTable(): Exportar tabla individual
   - getTableSchema(): Obtener DDL de tabla
   ```

   **FileSystemService** (`filesystem.service.ts`):
   ```typescript
   - copyFiles(): Copiar archivos de uploads/
   - calculateFileHash(): Calcular SHA-256
   - getAllDocumentFiles(): Listar todos los PDFs
   - findOrphanedFiles(): Detectar archivos sin registro
   - checkDiskSpace(): Verificar espacio disponible
   ```

   **CompressionService** (`compression.service.ts`):
   ```typescript
   - createZip(): Comprimir directorio a ZIP
   - extractZip(): Extraer ZIP a directorio
   - calculateZipChecksum(): SHA-256 del ZIP
   ```

   **ManifestService** (`manifest.service.ts`):
   ```typescript
   - generateManifest(): Crear manifest.json
   - saveManifest(): Escribir manifest a archivo
   - loadManifest(): Parsear manifest desde JSON
   - validateManifest(): Validar estructura
   ```

2. Implementar BackupService principal:
   ```typescript
   - createBackup(): Crear job y agregar a cola
   - performBackup(): Ejecutar respaldo (FULL o INCREMENTAL)
   - estimateBackupSize(): Calcular tamaño estimado
   - cleanupOldBackups(): Eliminar respaldos antiguos
   ```

3. Extender QueueService:
   ```typescript
   - addToBackupQueue(): Cola de respaldos
   - processBackupQueue(): Procesamiento asíncrono
   ```

4. Crear endpoints API:
   - `POST /api/backups` - Crear respaldo
   - `GET /api/backups` - Listar respaldos
   - `GET /api/backups/:id` - Obtener detalles
   - `DELETE /api/backups/:id` - Eliminar respaldo

5. Integrar con AuditService y NotificationService

**Entregables**:
- ✅ Respaldo FULL funcional
- ✅ Respaldo INCREMENTAL funcional
- ✅ Generación de manifest
- ✅ Compresión ZIP
- ✅ API endpoints operativos

**Duración estimada**: 6-8 horas

---

### 📦 FASE 3: Restauración (PROMPT 038)

**Objetivo**: Implementar el proceso de restauración con validaciones

**Tareas**:
1. Implementar ValidationService:
   ```typescript
   - validateBackupIntegrity(): Verificar checksums
   - verifyFileIntegrity(): Verificar archivos individuales
   - validateManifest(): Validar estructura de manifest
   ```

2. Implementar DatabaseImportService:
   ```typescript
   - importTables(): Importar múltiples tablas
   - importTable(): Importar tabla individual
   - truncateTable(): Limpiar tabla
   ```

3. Implementar RestoreService:
   ```typescript
   - restoreBackup(): Orquestador de restauración
   - createPreRestoreBackup(): Respaldo automático pre-restauración
   - restoreDatabase(): Restaurar BD con transacciones
   - restoreFiles(): Restaurar archivos con verificación
   ```

4. Implementar sistema de checkpoints:
   ```typescript
   - saveCheckpoint(): Guardar progreso
   - loadCheckpoint(): Cargar checkpoint
   - resumeFromCheckpoint(): Reanudar restauración
   ```

5. Crear endpoints API:
   - `POST /api/backups/:id/restore` - Restaurar respaldo
   - `POST /api/backups/:id/verify` - Verificar integridad

**Entregables**:
- ✅ Restauración completa funcional
- ✅ Validación de integridad
- ✅ Respaldo pre-restauración automático
- ✅ Sistema de checkpoints
- ✅ API endpoints operativos

**Duración estimada**: 6-8 horas

---

### 📦 FASE 4: Frontend (PROMPT 039)

**Objetivo**: Crear interfaz de usuario completa

**Tareas**:
1. Crear Zustand store:
   ```typescript
   // frontend/src/stores/useBackupStore.ts
   - backups: BackupJob[]
   - settings: BackupSettings
   - statistics: BackupStatistics
   - createBackup()
   - restoreBackup()
   - loadBackups()
   - updateSettings()
   ```

2. Crear páginas:

   **BackupList** (`/backups`):
   - Tabla de respaldos con filtros (tipo, estado, fecha)
   - Botón "Generar Respaldo" (FULL/INCREMENTAL)
   - Acciones por fila: Ver detalles, Restaurar, Eliminar, Verificar
   - Paginación

   **BackupDetails** (`/backups/:id`):
   - Información del job (tipo, estado, tamaños, duración)
   - Contenido del manifest (tablas, archivos)
   - Botón "Restaurar" con modal de confirmación
   - Logs de errores si los hay

   **BackupConfig** (`/backups/settings`):
   - Formulario de configuración (BackupSettings)
   - Validación con Zod
   - Botón "Guardar Configuración"

   **BackupDashboard** (`/dashboard` - sección):
   - Widget de último respaldo
   - Gráfico de tamaño de respaldos (últimos 30 días)
   - Indicador de espacio en disco
   - Próximo respaldo programado

3. Crear componentes:
   - `<BackupJobCard />` - Tarjeta de respaldo
   - `<BackupStatusBadge />` - Badge de estado
   - `<CreateBackupDialog />` - Modal para crear respaldo
   - `<RestoreBackupDialog />` - Modal para restaurar (requiere contraseña)
   - `<BackupManifestViewer />` - Visor de manifest JSON

4. Integrar notificaciones:
   - Toast para inicio de respaldo
   - Toast para respaldo completado/fallido
   - Toast para restauración completada/fallida

**Entregables**:
- ✅ Store de Zustand funcional
- ✅ Páginas completas y responsive
- ✅ Componentes reutilizables
- ✅ Integración con API
- ✅ Notificaciones en tiempo real

**Duración estimada**: 8-10 horas

---

### 📦 FASE 5: Programación y Automatización (PROMPT 040)

**Objetivo**: Automatizar respaldos y mantenimiento

**Tareas**:
1. Implementar SchedulerService:
   ```typescript
   - scheduleBackup(): Programar con cron
   - cancelScheduledBackup(): Cancelar programación
   - getScheduledBackups(): Listar programados
   ```

2. Implementar tareas automáticas:
   ```typescript
   // Respaldos programados
   cron.schedule(settings.scheduleCron, async () => {
     await BackupService.createBackup("INCREMENTAL", "system");
   });

   // Limpieza de respaldos antiguos (diario 3 AM)
   cron.schedule("0 3 * * *", async () => {
     await BackupService.cleanupOldBackups();
   });

   // Verificación de integridad (semanal)
   cron.schedule("0 4 * * 0", async () => {
     const randomBackup = await getRandomBackup();
     await ValidationService.verifyBackup(randomBackup.id);
   });

   // Monitoreo de espacio en disco (cada hora)
   cron.schedule("0 * * * *", async () => {
     const freeSpace = await checkDiskSpace();
     if (freeSpace < THRESHOLD) {
       await notifyAdmins("Low disk space");
     }
   });
   ```

3. Implementar notificaciones por email:
   - Integrar con servicio de email (Nodemailer)
   - Plantillas de emails para respaldos
   - Enviar a notificationEmails de BackupSettings

4. Implementar cleanup automático:
   ```typescript
   - cleanupOldBackups(): Eliminar respaldos según retención
   - cleanupOrphanedBackups(): Limpiar jobs huérfanos
   - cleanupTempFiles(): Limpiar archivos temporales
   ```

5. Agregar frontend para programación:
   - Formulario de expresión cron con validación
   - Preview de próximas ejecuciones
   - Toggle para activar/desactivar

**Entregables**:
- ✅ Scheduler funcional con node-cron
- ✅ Respaldos automáticos programados
- ✅ Limpieza automática
- ✅ Verificación periódica
- ✅ Notificaciones por email
- ✅ UI de programación

**Duración estimada**: 4-6 horas

---

## Dependencias y Tecnologías

### Backend - Nuevas Dependencias

```bash
cd backend
npm install adm-zip archiver node-cron cron-parser check-disk-space
npm install --save-dev @types/adm-zip @types/archiver @types/node-cron
```

### Frontend - Sin nuevas dependencias

Todo se puede hacer con las librerías actuales (React, Zustand, shadcn/ui).

---

## Estructura de Archivos

### Backend

```
backend/
├── prisma/
│   └── schema.prisma (actualizado con BackupSettings, BackupJob, BackupItem)
├── src/
│   ├── controllers/
│   │   ├── backup.controller.ts
│   │   ├── backup-settings.controller.ts
│   │   └── restore.controller.ts
│   ├── services/
│   │   ├── backup.service.ts (orquestador principal)
│   │   ├── backup-settings.service.ts
│   │   ├── restore.service.ts
│   │   ├── database-export.service.ts
│   │   ├── database-import.service.ts
│   │   ├── filesystem.service.ts (extender existente)
│   │   ├── compression.service.ts
│   │   ├── manifest.service.ts
│   │   ├── validation.service.ts
│   │   ├── scheduler.service.ts
│   │   └── queue.service.ts (extender existente)
│   ├── routes/
│   │   ├── backup.routes.ts
│   │   └── backup-settings.routes.ts
│   ├── types/
│   │   └── backup.types.ts
│   └── utils/
│       ├── backup-lock.util.ts
│       └── hash.util.ts
```

### Frontend

```
frontend/
├── src/
│   ├── app/
│   │   └── backups/
│   │       ├── page.tsx (lista)
│   │       ├── [id]/
│   │       │   └── page.tsx (detalles)
│   │       └── settings/
│   │           └── page.tsx (configuración)
│   ├── components/
│   │   └── backups/
│   │       ├── BackupJobCard.tsx
│   │       ├── BackupStatusBadge.tsx
│   │       ├── CreateBackupDialog.tsx
│   │       ├── RestoreBackupDialog.tsx
│   │       ├── BackupManifestViewer.tsx
│   │       ├── BackupConfigForm.tsx
│   │       └── BackupDashboardWidget.tsx
│   ├── stores/
│   │   └── useBackupStore.ts
│   ├── lib/
│   │   └── api/
│   │       └── backup.api.ts
│   └── types/
│       └── backup.types.ts
```

---

## Configuración Inicial

### 1. Crear directorio de respaldos

```powershell
New-Item -Path "C:\SAD\backups" -ItemType Directory
New-Item -Path "C:\SAD\backups\full" -ItemType Directory
New-Item -Path "C:\SAD\backups\incremental" -ItemType Directory
New-Item -Path "C:\SAD\backups\temp" -ItemType Directory
```

### 2. Configurar permisos

El usuario que ejecuta el servidor Node.js debe tener:
- Lectura/escritura en `C:\SAD\backups`
- Lectura en `backend/uploads`
- Lectura en base de datos MySQL

### 3. Seed de configuración inicial

```typescript
// backend/prisma/seeds/backup-settings.seed.ts
await prisma.backupSettings.create({
  data: {
    backupPath: "C:\\SAD\\backups",
    retentionDays: 30,
    compressionEnabled: true,
    encryptionEnabled: false,
    maxBackupsToKeep: 10,
    incrementalEnabled: true,
    scheduleEnabled: false,
    notifyOnSuccess: true,
    notifyOnFailure: true,
    excludeFilePatterns: ["*.tmp", "*.log", "*.temp"]
  }
});
```

---

## Testing

### Tests Unitarios

Crear tests para servicios críticos:

```typescript
// backend/src/services/__tests__/backup.service.test.ts
describe("BackupService", () => {
  test("should create FULL backup", async () => {
    const job = await BackupService.createBackup("FULL", testUserId);
    expect(job.type).toBe("FULL");
    expect(job.status).toBe("PENDING");
  });

  test("should detect file changes for INCREMENTAL", async () => {
    const changes = await BackupService.detectFileChanges(lastBackupAt);
    expect(changes.length).toBeGreaterThan(0);
  });

  test("should estimate backup size correctly", async () => {
    const size = await BackupService.estimateBackupSize("FULL");
    expect(size).toBeGreaterThan(0);
  });
});
```

### Tests de Integración

```typescript
// backend/src/services/__tests__/backup-integration.test.ts
describe("Backup Integration", () => {
  test("should create and restore backup successfully", async () => {
    // Crear respaldo
    const backupJob = await BackupService.createBackup("FULL", testUserId);
    await waitForJobCompletion(backupJob.id);

    // Modificar datos
    await modifyTestData();

    // Restaurar
    await RestoreService.restoreBackup(backupJob.id, testUserId);

    // Verificar
    const restoredData = await getTestData();
    expect(restoredData).toEqual(originalData);
  });
});
```

---

## Monitoreo y Métricas

### KPIs a Monitorear

1. **Tasa de éxito de respaldos**: >= 99%
2. **Tiempo promedio de respaldo FULL**: <= 5 minutos
3. **Tiempo promedio de respaldo INCREMENTAL**: <= 2 minutos
4. **Ratio de compresión**: ~50%
5. **Espacio utilizado en disco**: <= 80%

### Dashboard de Métricas

Agregar sección en frontend para mostrar:
- Gráfico de tendencia de tamaños (últimos 30 días)
- Historial de éxitos/fallos (últimos 30 días)
- Espacio en disco disponible
- Tiempo promedio por tipo de respaldo
- Próximo respaldo programado

---

## Políticas de Operación Recomendadas

### Frecuencia de Respaldos

- **Respaldos completos**: Semanal (domingo 2:00 AM)
- **Respaldos incrementales**: Diario (lunes-sábado 2:00 AM)
- **Verificación de integridad**: Mensual (primer domingo 3:00 AM)

### Retención

- **Respaldos completos**: Conservar últimos 4 (1 mes)
- **Respaldos incrementales**: Conservar 7 días
- **Respaldos pre-restauración**: Conservar indefinidamente

### Notificaciones

- **Respaldo exitoso**: Notificación normal
- **Respaldo fallido**: Email inmediato a admins
- **Espacio bajo (<10%)**: Email inmediato a admins
- **Corrupción detectada**: Email inmediato + ticket de soporte

---

## Consideraciones de Seguridad

### Permisos

- Solo rol **ADMIN** puede:
  - Crear respaldos
  - Restaurar respaldos
  - Eliminar respaldos
  - Modificar configuración
  - Verificar integridad

### Auditoría

Todas las operaciones se auditan en AuditLog:
- BACKUP_CREATED
- BACKUP_COMPLETED
- BACKUP_FAILED
- BACKUP_RESTORED
- BACKUP_DELETED
- BACKUP_VERIFIED
- BACKUP_SETTINGS_UPDATED

### Protección de Datos

- Respaldos contienen datos sensibles (documentos, usuarios, firmas)
- Almacenar en ubicación segura con permisos restrictivos
- Considerar encriptación para respaldos transportados fuera del servidor
- No exponer rutas de respaldo en logs o respuestas API

---

## Troubleshooting

### Problema: Respaldo falla por espacio insuficiente

**Solución**:
1. Verificar espacio con: `Get-PSDrive C | Select-Object Free`
2. Ejecutar limpieza de respaldos antiguos: `DELETE /api/backups/cleanup`
3. Ajustar `retentionDays` o `maxBackupsToKeep` en configuración
4. Considerar mover `backupPath` a otro disco

### Problema: Restauración falla con error de FK

**Solución**:
1. Verificar que el orden de importación de tablas es correcto (TABLES_IN_DEPENDENCY_ORDER)
2. Asegurar que `SET FOREIGN_KEY_CHECKS=0` se ejecuta antes de truncar
3. Revisar que todas las tablas referenciadas existen en el respaldo

### Problema: Archivos corruptos después de restauración

**Solución**:
1. Verificar checksums en manifest
2. Ejecutar `POST /api/backups/:id/verify` para diagnosticar
3. Si el respaldo está corrupto, usar el respaldo anterior
4. Revisar logs de E/S del sistema operativo

---

## Próximos Pasos

Con este diseño arquitectónico completo, el siguiente paso es:

### ✅ Ejecutar PROMPT 036: Implementación Backend - Fase 1

Comenzar la implementación del backend siguiendo el plan de fases descrito en este documento.

**Recursos disponibles**:
- ✅ Arquitectura completa documentada
- ✅ Modelos Prisma diseñados
- ✅ Diagramas de secuencia definidos
- ✅ Tipos TypeScript especificados
- ✅ Plan de implementación detallado

---

## Conclusión

El módulo de copias de seguridad inteligente proporcionará:
- **Protección de datos críticos** con respaldos automáticos
- **Recuperación ante desastres** con restauración validada
- **Eficiencia de almacenamiento** con respaldos incrementales
- **Integridad garantizada** con checksums multinivel
- **Operación autónoma** con programación y limpieza automática

Este diseño balances:
- Simplicidad de uso para administradores
- Robustez técnica para resiliencia
- Eficiencia de recursos (tiempo, espacio, CPU)
- Seguridad y auditoría completa

**Duración total estimada de implementación**: 20-30 horas

---

**Fin de la Guía de Implementación**
