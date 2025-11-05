# Diagramas de Secuencia - Módulo de Copias de Seguridad

## 1. Diagrama de Secuencia: Generar Copia de Seguridad

```mermaid
sequenceDiagram
    actor Admin as Admin User
    participant FE as Frontend
    participant API as Backend API
    participant Auth as Auth Middleware
    participant BC as BackupController
    participant BS as BackupService
    participant Q as QueueService
    participant DES as DatabaseExportService
    participant FSS as FileSystemService
    participant CS as CompressionService
    participant MS as ManifestService
    participant AS as AuditService
    participant NS as NotificationService
    participant DB as Database
    participant FS as File System

    Admin->>FE: Click "Generar Respaldo"
    FE->>Admin: Mostrar opciones (FULL/INCREMENTAL)
    Admin->>FE: Confirmar tipo de respaldo
    
    FE->>API: POST /api/backups<br/>{type: "FULL"}
    API->>Auth: Verificar token JWT
    Auth->>API: Token válido + permisos ADMIN
    
    API->>BC: createBackup(req, res)
    BC->>BS: createBackup(type, userId)
    
    BS->>DB: Obtener BackupSettings
    DB-->>BS: Settings actuales
    
    BS->>FSS: checkDiskSpace(backupPath)
    FSS->>FS: Verificar espacio disponible
    FS-->>FSS: X GB libres
    FSS-->>BS: Espacio suficiente
    
    BS->>DB: Crear BackupJob<br/>{type, status: "PENDING", createdBy}
    DB-->>BS: BackupJob creado (jobId)
    
    BS->>Q: addToBackupQueue(jobId)
    Q-->>BS: Agregado a cola
    
    BS-->>BC: {success: true, jobId}
    BC-->>API: 202 Accepted
    API-->>FE: Response recibida
    FE->>Admin: "Respaldo iniciado"
    
    Note over Q,BS: Procesamiento asíncrono
    Q->>BS: processBackupQueue()
    BS->>DB: Actualizar status: "IN_PROGRESS"
    
    BS->>FS: Crear directorio temporal<br/>C:\SAD\backups\temp\{jobId}
    FS-->>BS: Directorio creado
    
    BS->>DES: exportTables(tempDir, tables)
    loop Para cada tabla
        DES->>DB: prisma.{table}.findMany()
        DB-->>DES: Registros de tabla
        DES->>FS: Escribir database/{table}.json
        DES->>DB: Crear BackupItem<br/>{itemType: "TABLE_RECORD"}
    end
    DES-->>BS: Exportación completa
    
    BS->>FSS: copyFiles(tempDir, uploadDirs)
    loop Para cada archivo en uploads/
        FSS->>FS: Leer archivo
        FS-->>FSS: Buffer del archivo
        FSS->>FSS: Calcular SHA-256 hash
        
        alt Respaldo INCREMENTAL
            FSS->>DB: Buscar BackupItem con hash
            alt Hash no existe
                FSS->>FS: Copiar archivo a tempDir
                FSS->>DB: Crear BackupItem<br/>{itemType: "FILE", backupAction: "ADDED"}
            else Hash existe
                Note over FSS: Archivo sin cambios, omitir
            end
        else Respaldo FULL
            FSS->>FS: Copiar archivo a tempDir
            FSS->>DB: Crear BackupItem<br/>{itemType: "FILE"}
        end
    end
    FSS-->>BS: Archivos copiados
    
    BS->>DB: Obtener todos BackupItems del job
    DB-->>BS: Lista de items
    
    BS->>MS: generateManifest(job, items)
    MS->>DB: Obtener metadatos adicionales
    DB-->>MS: Metadata de BD
    MS->>MS: Construir manifest JSON
    MS->>FS: Escribir manifest.json
    MS-->>BS: Manifest generado
    
    BS->>CS: createZip(tempDir, outputPath)
    CS->>FS: Crear archivo ZIP
    loop Para cada archivo en tempDir
        CS->>FS: Agregar archivo al ZIP
    end
    CS->>CS: Calcular checksum ZIP
    CS->>FS: Finalizar ZIP
    CS-->>BS: ZIP creado (path, size)
    
    BS->>FS: Mover ZIP a destino final<br/>C:\SAD\backups\full\{timestamp}_{jobId}.zip
    BS->>FS: Eliminar directorio temporal
    
    BS->>DB: Actualizar BackupJob<br/>{status: "COMPLETED", completedAt, backupPath, totalSizeBytes}
    BS->>DB: Actualizar BackupSettings<br/>{lastBackupAt, lastBackupJobId}
    
    BS->>AS: log(BACKUP_CREATED)
    AS->>DB: Crear AuditLog
    
    BS->>NS: create(BACKUP_SUCCESS notification)
    NS->>DB: Crear Notification
    NS->>FE: WebSocket push notification
    FE->>Admin: Toast "Respaldo completado"
    
    alt Error en cualquier paso
        BS->>DB: Actualizar BackupJob<br/>{status: "FAILED", errorMessage}
        BS->>FS: Limpiar archivos temporales
        BS->>NS: create(BACKUP_FAILURE notification)
        NS->>FE: Notificación de error
        FE->>Admin: Toast "Error en respaldo"
    end
```

---

## 2. Diagrama de Secuencia: Restaurar Respaldo

```mermaid
sequenceDiagram
    actor Admin as Admin User
    participant FE as Frontend
    participant API as Backend API
    participant Auth as Auth Middleware
    participant BC as BackupController
    participant RS as RestoreService
    participant BS as BackupService
    participant VS as ValidationService
    participant CS as CompressionService
    participant DIS as DatabaseImportService
    participant FSS as FileSystemService
    participant AS as AuditService
    participant NS as NotificationService
    participant DB as Database
    participant FS as File System

    Admin->>FE: Navegar a /backups/{jobId}
    FE->>API: GET /api/backups/{jobId}
    API-->>FE: Detalles del respaldo
    FE->>Admin: Mostrar información del respaldo
    
    Admin->>FE: Click "Restaurar"
    FE->>Admin: Mostrar advertencia crítica<br/>"¡Sobrescribirá datos actuales!"
    Admin->>FE: Ingresar contraseña y confirmar
    
    FE->>API: POST /api/backups/{jobId}/restore<br/>{password, options}
    API->>Auth: Verificar token JWT + rol ADMIN
    Auth->>API: Autorizado
    
    API->>BC: restoreBackup(req, res)
    BC->>Auth: Verificar contraseña del usuario
    Auth-->>BC: Contraseña válida
    
    BC->>RS: restoreBackup(jobId, userId, options)
    
    RS->>DB: Obtener BackupJob
    DB-->>RS: Job details
    
    alt Job no existe o status != COMPLETED
        RS-->>BC: Error "Respaldo no válido"
        BC-->>API: 400 Bad Request
        API-->>FE: Error response
        FE->>Admin: Toast "Respaldo no disponible"
    end
    
    RS->>VS: validateBackupIntegrity(job)
    VS->>FS: Verificar que archivo ZIP existe
    FS-->>VS: Archivo existe
    
    VS->>FS: Leer manifest.json
    FS-->>VS: Manifest content
    VS->>VS: Validar schema del manifest
    
    VS->>FS: Calcular SHA-256 del ZIP
    FS-->>VS: Checksum actual
    VS->>VS: Comparar con manifest.checksums.backup
    
    alt Checksum no coincide
        VS-->>RS: Error "Archivo corrupto"
        RS->>NS: create(BACKUP_CORRUPTION notification)
        RS-->>BC: Error response
        BC-->>API: 500 Internal Error
        API-->>FE: Error response
        FE->>Admin: Toast "Respaldo corrupto"
    end
    VS-->>RS: Validación exitosa
    
    RS->>BS: createBackup("FULL", userId)<br/>reason: "Pre-restore checkpoint"
    BS->>DB: Crear BackupJob pre-restauración
    BS-->>RS: Pre-restore backup creado (preBackupId)
    
    RS->>FS: Crear directorio de extracción<br/>C:\SAD\backups\temp\restore_{jobId}
    FS-->>RS: Directorio creado
    
    RS->>CS: extractZip(job.backupPath, extractDir)
    CS->>FS: Extraer contenido del ZIP
    loop Para cada archivo en ZIP
        CS->>FS: Escribir archivo en extractDir
    end
    CS-->>RS: Extracción completa
    
    RS->>FS: Leer manifest.json extraído
    FS-->>RS: Manifest content
    
    Note over RS,DB: Iniciar restauración de BD
    RS->>DB: BEGIN TRANSACTION
    RS->>DB: SET FOREIGN_KEY_CHECKS=0
    
    loop Para cada tabla en orden inverso
        RS->>DIS: truncateTable(tableName)
        DIS->>DB: TRUNCATE TABLE {tableName}
    end
    
    loop Para cada tabla en orden de dependencias
        RS->>FS: Leer database/{table}.json
        FS-->>RS: Registros de tabla
        
        RS->>DIS: importTable(tableName, records)
        loop Para cada registro
            DIS->>DB: prisma.{table}.create({data})
        end
        DIS-->>RS: Tabla importada (count)
    end
    
    RS->>DB: SET FOREIGN_KEY_CHECKS=1
    RS->>DB: COMMIT TRANSACTION
    
    Note over RS,FS: Restaurar archivos
    loop Para cada file en manifest.files
        RS->>FSS: restoreFile(fileInfo)
        FSS->>FS: Leer archivo de extractDir
        FS-->>FSS: Buffer del archivo
        
        FSS->>FSS: Calcular SHA-256 hash
        FSS->>FSS: Verificar hash == fileInfo.hash
        
        alt Hash no coincide
            FSS-->>RS: Error "Archivo corrupto"
            Note over RS: Abortar restauración
        end
        
        FSS->>FS: Crear directorios destino si no existen
        FSS->>FS: Escribir archivo en destino<br/>(uploads/documents/...)
        FSS-->>RS: Archivo restaurado
    end
    
    RS->>FS: Eliminar directorio de extracción
    FS-->>RS: Limpieza completa
    
    RS->>DB: Actualizar BackupJob<br/>{restoredAt, restoredBy}
    
    RS->>AS: log(BACKUP_RESTORED)
    AS->>DB: Crear AuditLog<br/>{action: "BACKUP_RESTORED", oldValue: {preBackupId}}
    
    RS->>NS: create(BACKUP_RESTORE_SUCCESS)
    NS->>DB: Crear Notification<br/>{priority: "HIGH"}
    NS->>FE: WebSocket push notification
    FE->>Admin: Toast "Restauración completa"
    
    RS-->>BC: {success: true, stats}
    BC-->>API: 200 OK
    API-->>FE: Response
    FE->>Admin: Mostrar estadísticas de restauración
    
    alt Error durante restauración
        RS->>DB: ROLLBACK TRANSACTION
        RS->>FS: Limpiar archivos parciales
        
        RS->>BS: restoreBackup(preBackupId)<br/>Restaurar checkpoint
        BS->>RS: Sistema revertido
        
        RS->>NS: create(BACKUP_RESTORE_FAILED)
        NS->>FE: Notificación de error crítico
        FE->>Admin: Toast "Error: Sistema revertido"
    end
```

---

## 3. Diagrama de Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐         │
│  │ BackupList │  │ BackupConfig │  │ BackupDashboard │         │
│  │   Page     │  │    Page      │  │      Page       │         │
│  └────────────┘  └──────────────┘  └─────────────────┘         │
│         │               │                    │                   │
│         └───────────────┴────────────────────┘                   │
│                         │                                        │
│                 ┌───────▼────────┐                               │
│                 │  Backup Store  │ (Zustand)                     │
│                 │  (State Mgmt)  │                               │
│                 └───────┬────────┘                               │
│                         │                                        │
│                 ┌───────▼────────┐                               │
│                 │   API Client   │                               │
│                 └───────┬────────┘                               │
└─────────────────────────┼───────────────────────────────────────┘
                          │ HTTP/WebSocket
┌─────────────────────────▼───────────────────────────────────────┐
│                      BACKEND API                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Express Routes & Controllers               │     │
│  │  /api/backups                                          │     │
│  │  /api/backups/:id                                      │     │
│  │  /api/backups/:id/restore                             │     │
│  │  /api/backups/settings                                │     │
│  └────────────────────┬───────────────────────────────────┘     │
│                       │                                          │
│  ┌────────────────────▼───────────────────────────────────┐     │
│  │                 BackupService                           │     │
│  │  - createBackup()    - restoreBackup()                 │     │
│  │  - listBackups()     - deleteBackup()                  │     │
│  │  - verifyBackup()    - cleanupOld()                    │     │
│  └────────┬─────────────────────────┬─────────────────────┘     │
│           │                         │                            │
│  ┌────────▼────────┐      ┌────────▼─────────┐                 │
│  │ QueueService    │      │ ValidationService│                 │
│  │ - addToQueue()  │      │ - validateIntegrity()               │
│  │ - processQueue()│      │ - verifyChecksums()                │
│  └────────┬────────┘      └──────────────────┘                 │
│           │                                                      │
│  ┌────────▼───────────────────────────────────────────────┐    │
│  │           Specialized Services Layer                    │    │
│  ├─────────────────┬──────────────┬──────────────────────┤    │
│  │DatabaseExport   │ FileSystem   │ Compression          │    │
│  │Service          │ Service      │ Service              │    │
│  │                 │              │                      │    │
│  │- exportTables() │- copyFiles() │- createZip()         │    │
│  │- importTables() │- calcHash()  │- extractZip()        │    │
│  └─────────────────┴──────────────┴──────────────────────┘    │
│           │                │                │                   │
│  ┌────────▼────────┐  ┌───▼────┐   ┌──────▼────────┐          │
│  │ ManifestService │  │ Audit  │   │ Notification  │          │
│  │ - generate()    │  │Service │   │  Service      │          │
│  │ - validate()    │  └────────┘   └───────────────┘          │
│  └─────────────────┘                                           │
│           │                                                     │
└───────────┼─────────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                             │
│  ┌──────────────┐           ┌─────────────────────────┐         │
│  │   MySQL DB   │           │      File System        │         │
│  │              │           │                         │         │
│  │ - BackupJob  │           │ C:\SAD\backups\         │         │
│  │ - BackupItem │           │   ├─ full\              │         │
│  │ - Settings   │           │   ├─ incremental\       │         │
│  │ - All tables │           │   └─ temp\              │         │
│  │              │           │                         │         │
│  └──────────────┘           │ uploads\                │         │
│                             │   ├─ documents\         │         │
│                             │   ├─ versions\          │         │
│                             │   └─ system-config\     │         │
│                             └─────────────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Flujo de Decisión: Tipo de Respaldo

```
┌─────────────────────────┐
│ Usuario inicia respaldo │
└───────────┬─────────────┘
            │
            ▼
┌───────────────────────────┐
│ ¿Existe respaldo previo?  │
└───────┬───────────────────┘
        │
    ┌───┴───┐
    │ NO    │ SÍ
    ▼       ▼
┌────────┐  ┌─────────────────────────────┐
│ FULL   │  │ ¿incrementalEnabled = true? │
│ backup │  └───────┬─────────────────────┘
└────────┘          │
                ┌───┴───┐
                │ NO    │ SÍ
                ▼       ▼
            ┌────────┐  ┌─────────────────────────────┐
            │ FULL   │  │ ¿lastBackupAt < 7 días?     │
            │ backup │  └───────┬─────────────────────┘
            └────────┘          │
                            ┌───┴───┐
                            │ NO    │ SÍ
                            ▼       ▼
                        ┌────────┐  ┌─────────────┐
                        │ FULL   │  │ INCREMENTAL │
                        │ backup │  │   backup    │
                        └────────┘  └─────────────┘
```

---

## 5. Diagrama de Estados: BackupJob

```
                    ┌─────────┐
                    │ PENDING │ (inicial)
                    └────┬────┘
                         │ Queue picks up job
                         ▼
                  ┌──────────────┐
            ┌─────│ IN_PROGRESS  │─────┐
            │     └──────────────┘     │
            │                          │
    ┌───────▼──────┐         ┌────────▼─────┐
    │  COMPLETED   │         │    FAILED    │
    └───────┬──────┘         └──────────────┘
            │                        ▲
            │ Restore action         │ Error
            ▼                        │
    ┌──────────────┐                │
    │  RESTORED    │                │
    └──────────────┘                │
                                    │
    ┌──────────────┐                │
    │  CANCELLED   │◄───────────────┘
    └──────────────┘   User cancels
```

---

## 6. Diagrama de Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  React Components + Zustand State + shadcn/ui               │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP REST API
┌───────────────────────▼─────────────────────────────────────┐
│                     API LAYER                                │
│  Express Routes + Controllers + Auth Middleware             │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  BUSINESS LOGIC LAYER                        │
│  Services (Backup, Restore, Export, Import, Validation)    │
└───────┬─────────────────────────┬───────────────────────────┘
        │                         │
        │                         │
┌───────▼─────────────┐   ┌───────▼──────────────┐
│  ORCHESTRATION      │   │   INFRASTRUCTURE     │
│  - QueueService     │   │   - Compression      │
│  - ManifestService  │   │   - FileSystem       │
│                     │   │   - Hashing          │
└─────────────────────┘   └──────────────────────┘
        │                         │
        │                         │
┌───────▼─────────────────────────▼───────────────────────────┐
│                    DATA ACCESS LAYER                         │
│  Prisma ORM + Raw SQL queries                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                  PERSISTENCE LAYER                           │
│  MySQL Database + File System (uploads/, backups/)          │
└─────────────────────────────────────────────────────────────┘
```

