'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  UpdateStatus,
  UpdateInfo,
  UpdateProgress,
  UpdaterStatusPayload,
  GitHubRelease,
} from '@/types/updater.types';

const LAST_CHECK_KEY = 'sad_last_update_check';
const CURRENT_WEB_VERSION = '1.0.0';

export function useSystemUpdater() {
  const [isDesktop, setIsDesktop] = useState<boolean>(false);
  const [currentVersion, setCurrentVersion] = useState<string>(CURRENT_WEB_VERSION);
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<UpdateProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [manualDownloadUrl, setManualDownloadUrl] = useState<string | null>(null);

  // Inicialización de entorno y suscripción IPC de Electron
  useEffect(() => {
    // 1. Cargar última verificación desde almacenamiento local
    try {
      const savedDate = localStorage.getItem(LAST_CHECK_KEY);
      if (savedDate) {
        setLastChecked(new Date(savedDate));
      }
    } catch (_) {}

    // 2. Comprobar si se ejecuta en Electron
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop) {
      setIsDesktop(true);

      // Obtener versión e información de la app
      if (window.electronAPI.getAppInfo) {
        window.electronAPI.getAppInfo().then((info) => {
          if (info?.appVersion) {
            setCurrentVersion(info.appVersion);
          }
        }).catch(() => {
          if (window.electronAPI?.appVersion) {
            setCurrentVersion(window.electronAPI.appVersion);
          }
        });
      } else if (window.electronAPI.appVersion) {
        setCurrentVersion(window.electronAPI.appVersion);
      }

      // 3. Suscribirse a eventos del AutoUpdater nativo
      if (window.electronAPI.onUpdateStatus) {
        const unsubscribe = window.electronAPI.onUpdateStatus((payload: UpdaterStatusPayload) => {
          if (!payload) return;

          setStatus(payload.status);

          if (payload.status === 'checking') {
            setErrorMessage(null);
          } else if (payload.status === 'available') {
            setUpdateInfo(payload.info || null);
            setErrorMessage(null);
            const now = new Date();
            setLastChecked(now);
            try { localStorage.setItem(LAST_CHECK_KEY, now.toISOString()); } catch (_) {}
          } else if (payload.status === 'not-available') {
            setErrorMessage(null);
            const now = new Date();
            setLastChecked(now);
            try { localStorage.setItem(LAST_CHECK_KEY, now.toISOString()); } catch (_) {}
          } else if (payload.status === 'downloading') {
            if (payload.progress) setProgress(payload.progress);
            if (payload.info) setUpdateInfo(payload.info);
          } else if (payload.status === 'downloaded') {
            if (payload.info) setUpdateInfo(payload.info);
            setProgress({ percent: 100, bytesPerSecond: 0, total: 100, transferred: 100 });
          } else if (payload.status === 'error') {
            setErrorMessage(payload.error || 'Ocurrió un error al verificar actualizaciones.');
          }
        });

        return () => {
          if (typeof unsubscribe === 'function') unsubscribe();
        };
      }
    } else {
      setIsDesktop(false);
      setCurrentVersion(CURRENT_WEB_VERSION);
    }
  }, []);

  // Comparador de versiones semánticas básico (v1.1.0 vs v1.0.0)
  const isVersionNewer = (latest: string, current: string): boolean => {
    const cleanLatest = latest.replace(/^v/, '').trim();
    const cleanCurrent = current.replace(/^v/, '').trim();
    if (cleanLatest === cleanCurrent) return false;

    const latestParts = cleanLatest.split('.').map(p => parseInt(p, 10) || 0);
    const currentParts = cleanCurrent.split('.').map(p => parseInt(p, 10) || 0);

    for (let i = 0; i < Math.max(latestParts.length, currentParts.length); i++) {
      const l = latestParts[i] || 0;
      const c = currentParts[i] || 0;
      if (l > c) return true;
      if (l < c) return false;
    }
    return false;
  };

  // Función para buscar actualizaciones
  const checkForUpdates = useCallback(async () => {
    setStatus('checking');
    setErrorMessage(null);
    setProgress(null);

    // Caso A: Entorno Desktop con Electron
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop && window.electronAPI.checkForUpdates) {
      try {
        const res = await window.electronAPI.checkForUpdates();
        if (res?.status === 'error') {
          setStatus('error');
          setErrorMessage(res.error || 'No se pudo conectar al servicio de actualizaciones.');
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'Error de comunicación con el motor de escritorio.');
      }
      return;
    }

    // Caso B: Entorno Web / Servidor (Consulta directa a GitHub Releases API)
    try {
      const response = await fetch('https://api.github.com/repos/JoseLuisQL/SAD/releases/latest', {
        headers: { Accept: 'application/vnd.github.v3+json' },
      });

      const now = new Date();
      setLastChecked(now);
      try { localStorage.setItem(LAST_CHECK_KEY, now.toISOString()); } catch (_) {}

      if (!response.ok) {
        if (response.status === 404) {
          // No hay releases publicados aún
          setStatus('not-available');
          return;
        }
        throw new Error(`Servidor de GitHub respondió con código ${response.status}`);
      }

      const release: GitHubRelease = await response.json();
      const latestTag = release.tag_name || release.name || '';
      const hasNewVersion = isVersionNewer(latestTag, currentVersion);

      // Buscar el archivo instalador .exe en los assets
      const exeAsset = release.assets?.find(a => a.name.endsWith('.exe') && !a.name.includes('Portable'))
        || release.assets?.find(a => a.name.endsWith('.exe'));

      if (exeAsset) {
        setManualDownloadUrl(exeAsset.browser_download_url);
      } else {
        setManualDownloadUrl(release.html_url);
      }

      if (hasNewVersion) {
        setStatus('available');
        setUpdateInfo({
          version: latestTag.replace(/^v/, ''),
          releaseName: release.name || latestTag,
          releaseDate: release.published_at,
          releaseNotes: release.body || 'Correcciones y mejoras de rendimiento del sistema.',
        });
      } else {
        setStatus('not-available');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(
        err?.message || 'No fue posible verificar actualizaciones. Compruebe su conexión a internet.'
      );
    }
  }, [currentVersion]);

  // Función para iniciar descarga de actualización
  const downloadUpdate = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop && window.electronAPI.downloadUpdate) {
      try {
        setStatus('downloading');
        setProgress({ percent: 0, bytesPerSecond: 0, total: 100, transferred: 0 });
        await window.electronAPI.downloadUpdate();
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'Error al descargar la actualización.');
      }
    } else {
      // Modo web: abrir descarga del asset o página de release
      if (manualDownloadUrl) {
        window.open(manualDownloadUrl, '_blank');
      } else {
        window.open('https://github.com/JoseLuisQL/SAD/releases/latest', '_blank');
      }
    }
  }, [manualDownloadUrl]);

  // Función para reiniciar e instalar
  const installUpdate = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electronAPI?.isDesktop && window.electronAPI.installUpdate) {
      try {
        await window.electronAPI.installUpdate();
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'Error al ejecutar la instalación de la actualización.');
      }
    }
  }, []);

  return {
    isDesktop,
    currentVersion,
    status,
    updateInfo,
    progress,
    errorMessage,
    lastChecked,
    manualDownloadUrl,
    checkForUpdates,
    downloadUpdate,
    installUpdate,
  };
}
