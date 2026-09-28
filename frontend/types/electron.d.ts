import { UpdaterStatusPayload, AppDesktopInfo } from './updater.types';

export interface ElectronAPI {
  isDesktop: boolean;
  appVersion: string;
  platform: string;
  closeApp: () => void;
  minimizeApp: () => void;
  maximizeApp: () => void;
  getAppInfo?: () => Promise<AppDesktopInfo>;
  checkForUpdates?: () => Promise<{ status: string; error?: string; updateCheckResult?: any }>;
  downloadUpdate?: () => Promise<{ success: boolean }>;
  installUpdate?: () => Promise<{ success: boolean }>;
  onUpdateStatus?: (callback: (payload: UpdaterStatusPayload) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
