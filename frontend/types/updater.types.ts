export interface UpdateInfo {
  version: string;
  files?: Array<{ url: string; size: number; sha512?: string }>;
  releaseDate?: string;
  releaseName?: string;
  releaseNotes?: string | Array<{ version: string; note: string }>;
}

export interface UpdateProgress {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdaterStatusPayload {
  status: UpdateStatus;
  info?: UpdateInfo | null;
  progress?: UpdateProgress | null;
  error?: string | null;
}

export interface AppDesktopInfo {
  isDesktop: boolean;
  appVersion: string;
  platform: string;
  arch: string;
  isPackaged: boolean;
}

export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
  size: number;
  content_type: string;
}

export interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  assets: GitHubReleaseAsset[];
}
