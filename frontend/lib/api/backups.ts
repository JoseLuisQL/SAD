import api from '../api';
import {
  BackupJob,
  RestoreLog,
  BackupSummary,
  BackupsResponse,
  RestoresResponse,
  BackupFilters,
  RestoreFilters,
  CreateBackupResponse,
  RestoreBackupResponse
} from '@/types/backup.types';

export const backupsApi = {
  createBackup: () => {
    return api.post<CreateBackupResponse>('/security/backups');
  },

  getBackups: (params: BackupFilters = {}) => {
    return api.get<{ status: string; data: BackupsResponse }>('/security/backups', { params });
  },

  getBackupById: (id: string) => {
    return api.get<{ status: string; data: { backup: BackupJob } }>(`/security/backups/${id}`);
  },

  getSummary: () => {
    return api.get<{ status: string; data: BackupSummary }>('/security/backups/summary');
  },

  downloadBackup: (id: string) => {
    return `/api/security/backups/${id}/download`;
  },

  restoreBackup: (id: string) => {
    return api.post<RestoreBackupResponse>(`/security/backups/${id}/restore`);
  },

  getRestores: (params: RestoreFilters = {}) => {
    return api.get<{ status: string; data: RestoresResponse }>('/security/restores', { params });
  },

  getRestoreById: (id: string) => {
    return api.get<{ status: string; data: { restore: RestoreLog } }>(`/security/restores/${id}`);
  }
};
