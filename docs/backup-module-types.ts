// TypeScript types and interfaces for Backup Module
// File: backend/src/types/backup.types.ts

export type BackupType = "FULL" | "INCREMENTAL";

export type BackupStatus = 
  | "PENDING" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "FAILED" 
  | "CANCELLED";

export type BackupItemType = "FILE" | "TABLE_RECORD";

export type BackupAction = 
  | "ADDED" 
  | "UPDATED" 
  | "UNCHANGED" 
  | "DELETED";

export interface BackupSettings {
  id: string;
  backupPath: string;
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  encryptionKey?: string;
  maxBackupsToKeep: number;
  incrementalEnabled: boolean;
  scheduleEnabled: boolean;
  scheduleCron?: string;
  lastBackupAt?: Date;
  lastBackupJobId?: string;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  notificationEmails?: string[];
  excludeTables?: string[];
  excludeFilePatterns?: string[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy?: string;
}

export interface BackupJob {
  id: string;
  settingsId: string;
  type: BackupType;
  status: BackupStatus;
  startedAt: Date;
  completedAt?: Date;
  backupPath?: string;
  manifestPath?: string;
  totalSizeBytes: bigint;
  filesCount: number;
  recordsCount: number;
  compressedSizeBytes?: bigint;
  compressionRatio?: number;
  errorMessage?: string;
  errorStack?: string;
  createdBy: string;
  cancelledBy?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  restoredAt?: Date;
  restoredBy?: string;
}

export interface BackupItem {
  id: string;
  jobId: string;
  itemType: BackupItemType;
  entityType: string;
  entityId?: string;
  filePath?: string;
  fileHash?: string;
  fileSize?: bigint;
  tableName?: string;
  recordSnapshot?: any;
  backupAction: BackupAction;
  createdAt: Date;
}

export interface BackupManifest {
  version: string;
  jobId: string;
  timestamp: string;
  type: BackupType;
  baseBackupJobId?: string;
  
  database: {
    host: string;
    name: string;
    version: string;
  };
  
  tables: {
    name: string;
    recordCount: number;
    exportPath: string;
    schema: string;
  }[];
  
  files: {
    sourcePath: string;
    backupPath: string;
    hash: string;
    size: number;
    entityType: string;
    entityId?: string;
    metadata?: {
      documentNumber?: string;
      documentDate?: string;
      sender?: string;
    };
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
    database: {
      totalRecords: number;
      sizeBytes: number;
    };
    files: {
      totalFiles: number;
      sizeBytes: number;
    };
    performance: {
      startTime: string;
      endTime: string;
      durationSeconds: number;
      throughputMBps: number;
    };
  };
  
  exclusions?: {
    type: "TABLE" | "FILE";
    name: string;
    reason: string;
    recordCount?: number;
  }[];
  
  errors: {
    message: string;
    entity: string;
    timestamp: string;
  }[];
  
  checksums: {
    manifest: string;
    backup: string;
  };
}

export interface CreateBackupRequest {
  type: BackupType;
}

export interface RestoreBackupRequest {
  password: string;
  overwriteExisting?: boolean;
  restoreFiles?: boolean;
  restoreDatabase?: boolean;
}

export interface RestoreBackupResponse {
  success: boolean;
  restoredRecords: number;
  restoredFiles: number;
  preRestoreBackupId: string;
  message: string;
  statistics?: {
    durationSeconds: number;
    tablesRestored: number;
    filesRestored: number;
  };
}

export interface BackupJobResponse {
  success: boolean;
  jobId: string;
  message: string;
  estimatedDuration?: number;
}

export interface BackupListFilters {
  page?: number;
  limit?: number;
  type?: BackupType;
  status?: BackupStatus;
  dateFrom?: Date;
  dateTo?: Date;
  createdBy?: string;
}

export interface PaginatedBackups {
  backups: BackupJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BackupStatistics {
  totalBackups: number;
  successRate: number;
  lastFullBackup?: Date;
  lastIncrementalBackup?: Date;
  totalSizeBytes: bigint;
  averageDurationSeconds: number;
  averageCompressionRatio: number;
  diskSpaceUsed: bigint;
  diskSpaceAvailable: bigint;
  oldestBackup?: Date;
  newestBackup?: Date;
}

export interface VerificationReport {
  jobId: string;
  isValid: boolean;
  errors: string[];
  warnings?: string[];
  timestamp: Date;
  checksums: {
    zip: {
      expected: string;
      actual: string;
      match: boolean;
    };
    manifest: {
      expected: string;
      actual: string;
      match: boolean;
    };
  };
  filesVerified: number;
  filesCorrupted: number;
}

export interface BackupCheckpoint {
  jobId: string;
  phase: "EXPORTING_DB" | "COPYING_FILES" | "COMPRESSING" | "FINALIZING";
  completedTables: string[];
  completedFiles: string[];
  timestamp: Date;
  progress: number;
}

export interface FileInfo {
  path: string;
  size: number;
  hash?: string;
  modifiedAt: Date;
  entityType?: string;
  entityId?: string;
}

export interface OrphanedFile {
  path: string;
  size: number;
  modifiedAt: Date;
  reason: string;
}

export interface ExportResult {
  totalTables: number;
  totalRecords: number;
  totalSizeBytes: number;
  durationSeconds: number;
  errors: string[];
}

export interface ImportResult {
  totalTables: number;
  totalRecords: number;
  durationSeconds: number;
  errors: string[];
}

export interface CopyResult {
  totalFiles: number;
  totalSizeBytes: number;
  copiedFiles: number;
  skippedFiles: number;
  errors: string[];
}

export interface CompressionOptions {
  compressionLevel?: number;
  largeFiles?: boolean;
  password?: string;
}

export interface RestoreOptions {
  overwriteExisting: boolean;
  restoreFiles: boolean;
  restoreDatabase: boolean;
  targetDate?: Date;
}

export class BackupError extends Error {
  constructor(
    message: string,
    public code: 
      | "DISK_SPACE"
      | "PERMISSION"
      | "INTEGRITY"
      | "LOCK_CONFLICT"
      | "VALIDATION"
      | "CORRUPTION"
      | "MAX_RETRIES_EXCEEDED"
      | "NOT_FOUND"
      | "INVALID_TYPE"
  ) {
    super(message);
    this.name = "BackupError";
  }
}

export const TABLES_IN_DEPENDENCY_ORDER = [
  "Role",
  "User",
  "Office",
  "DocumentType",
  "Period",
  "Archivador",
  "Expediente",
  "SystemConfig",
  "Document",
  "DocumentVersion",
  "Signature",
  "SignatureFlow",
  "AuditLog",
  "Notification",
  "BackupSettings",
  "BackupJob",
  "BackupItem"
];

export const TABLES_IN_REVERSE_ORDER = [...TABLES_IN_DEPENDENCY_ORDER].reverse();

export const MANIFEST_VERSION = "1.0.0";
export const MAX_JOB_DURATION = 3600000; // 1 hora en ms
export const MINIMUM_REQUIRED_SPACE = 1073741824; // 1 GB en bytes
export const DEFAULT_COMPRESSION_LEVEL = 9;
export const HASH_ALGORITHM = "sha256";
