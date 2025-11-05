export type BackupStatus = 
  | 'PENDING'
  | 'COLLECTING_DATA'
  | 'PACKAGING'
  | 'COMPLETED'
  | 'FAILED';

export type RestoreStatus = 
  | 'PENDING'
  | 'VALIDATING'
  | 'RESTORING_DB'
  | 'RESTORING_FILES'
  | 'COMPLETED'
  | 'FAILED';

export interface BackupJob {
  id: string;
  status: BackupStatus;
  type: string;
  totalDocuments: number;
  totalVersions: number;
  totalSignatures: number;
  totalFiles: number;
  totalSize: number;
  packagePath: string | null;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
    fullName: string;
  };
}

export interface RestoreLog {
  id: string;
  backupJobId: string;
  status: RestoreStatus;
  totalRecords: number;
  restoredRecords: number;
  totalFiles: number;
  restoredFiles: number;
  skippedFiles: number;
  validationLog: any;
  restoreLog: any;
  errorMessage: string | null;
  startedAt: Date;
  completedAt: Date | null;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  ipAddress: string | null;
  userAgent: string | null;
  creator?: {
    id: string;
    username: string;
    fullName: string;
  };
  backupJob?: BackupJob;
}

export interface BackupSummary {
  lastBackup: BackupJob | null;
  pendingDocuments: number;
  pendingVersions: number;
  pendingSignatures: number;
  recommendedPath: string;
  totalPendingSize: number;
  lastSuccessfulBackup: BackupJob | null;
}

export interface BackupsResponse {
  backups: BackupJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RestoresResponse {
  restores: RestoreLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BackupFilters {
  page?: number;
  limit?: number;
  status?: BackupStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface RestoreFilters {
  page?: number;
  limit?: number;
  status?: RestoreStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateBackupResponse {
  status: string;
  message: string;
  data: {
    backupJob: {
      id: string;
      status: BackupStatus;
      createdAt: Date;
      creator: {
        id: string;
        username: string;
        fullName: string;
      };
    };
  };
}

export interface RestoreBackupResponse {
  status: string;
  message: string;
  data: {
    restoreLog: {
      id: string;
      backupJobId: string;
      status: RestoreStatus;
      createdAt: Date;
      creator: {
        id: string;
        username: string;
        fullName: string;
      };
    };
  };
}
