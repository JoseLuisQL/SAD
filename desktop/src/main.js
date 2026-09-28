const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { spawn, exec, execSync } = require('child_process');
const fs = require('fs');

// 1. Bloqueo de instancia única: Evita que dos copias de la app se ejecuten a la vez
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3000;
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`;
const BACKEND_HEALTH_URL = `http://127.0.0.1:${BACKEND_PORT}/api/health`;

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
let frontendProcess = null;
let isQuitting = false;

// Directorio de logs de ejecución
const logDir = path.join(app.getPath('userData'), 'logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (_) {}

function writeLog(filename, text) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(path.join(logDir, filename), `[${timestamp}] ${text}\n`);
  } catch (_) {}
}

// 2. Liberación síncrona de puertos en Windows para eliminar procesos huérfanos/zombies
function freePortSync(port) {
  if (process.platform !== 'win32') return;
  try {
    const output = execSync(`netstat -ano | findstr /R ":${port} "`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      timeout: 3000
    });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const state = parts[3];
      const pid = parts[parts.length - 1];
      if (pid && pid !== '0' && (state === 'LISTENING' || state === 'ESTABLISHED')) {
        try {
          execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore', timeout: 3000 });
          writeLog('system.log', `Puerto ${port} liberado (PID anterior: ${pid})`);
        } catch (_) {}
      }
    }
  } catch (_) {
    // Puerto ya disponible
  }
}

// 3. Matar árbol de procesos síncronamente
function killProcessTreeSync(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore', timeout: 4000 });
    } else {
      proc.kill('SIGKILL');
    }
  } catch (_) {}
}

// 4. Actualizar texto de progreso en el Splash Screen
function updateSplashStatus(message) {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents
      .executeJavaScript(`
        const el = document.getElementById('statusMessage');
        if (el) el.textContent = ${JSON.stringify(message)};
      `)
      .catch(() => {});
  }
}

// 5. Verificar servicio de MySQL local en Windows
function ensureDatabaseService() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve();

    exec('netstat -ano | findstr /R ":3306 "', { timeout: 2500 }, (err, stdout) => {
      if (stdout && stdout.trim().length > 0) {
        return resolve();
      }

      updateSplashStatus('Iniciando servicio local de base de datos MySQL...');
      exec('sc start wampmysqld64 || sc start wampmariadb64 || sc start MySQL80 || sc start mysql', { timeout: 4000 }, () => {
        setTimeout(resolve, 1500);
      });
    });
  });
}

// 6. Verificar si un endpoint HTTP responde
function checkEndpoint(url, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

// 7. Iniciar el Backend
async function ensureBackendRunning() {
  const isRunning = await checkEndpoint(BACKEND_HEALTH_URL, 800);
  if (isRunning) {
    writeLog('system.log', 'Backend ya activo en puerto ' + BACKEND_PORT);
    return;
  }

  updateSplashStatus('Iniciando servicios y motor documental...');

  const backendDir = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(process.resourcesPath, 'backend');

  const distServer = path.join(backendDir, 'dist/server.js');
  const nodeBinary = app.isPackaged ? process.execPath : 'node';

  const env = {
    ...process.env,
    PORT: BACKEND_PORT.toString(),
    HOST: '127.0.0.1',
    NODE_ENV: 'production',
    ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {})
  };

  if (fs.existsSync(distServer)) {
    backendProcess = spawn(nodeBinary, [distServer], {
      cwd: backendDir,
      env,
      stdio: 'pipe',
      windowsHide: true,
      shell: false
    });
  } else {
    // Modo desarrollo
    backendProcess = spawn('npm.cmd', ['run', 'dev'], {
      cwd: backendDir,
      env,
      stdio: 'pipe',
      windowsHide: false,
      shell: true
    });
  }

  backendProcess.stdout?.on('data', (d) => writeLog('backend.log', d.toString()));
  backendProcess.stderr?.on('data', (d) => writeLog('backend-error.log', d.toString()));

  backendProcess.on('exit', (code) => {
    writeLog('system.log', `Backend finalizó con código: ${code}`);
    if (!isQuitting && code !== 0) {
      console.error('El backend terminó inesperadamente:', code);
    }
  });
}

// 8. Iniciar el Frontend
async function ensureFrontendRunning() {
  const isRunning = await checkEndpoint(FRONTEND_URL, 800);
  if (isRunning) {
    writeLog('system.log', 'Frontend ya activo en puerto ' + FRONTEND_PORT);
    return;
  }

  updateSplashStatus('Cargando interfaz de Archivo Digital...');

  const frontendDir = isDev
    ? path.join(__dirname, '../../frontend')
    : path.join(process.resourcesPath, 'frontend');

  const possibleStandaloneServers = [
    path.join(frontendDir, 'server.js'),
    path.join(frontendDir, '.next/standalone/server.js')
  ];

  const standaloneServer = possibleStandaloneServers.find(p => fs.existsSync(p));
  const nodeBinary = app.isPackaged ? process.execPath : 'node';

  const env = {
    ...process.env,
    PORT: FRONTEND_PORT.toString(),
    HOSTNAME: '127.0.0.1',
    NODE_ENV: 'production',
    ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {})
  };

  if (standaloneServer) {
    frontendProcess = spawn(nodeBinary, [standaloneServer], {
      cwd: path.dirname(standaloneServer),
      env,
      stdio: 'pipe',
      windowsHide: true,
      shell: false
    });
  } else {
    // Modo desarrollo
    frontendProcess = spawn('npm.cmd', ['run', 'dev'], {
      cwd: frontendDir,
      env: { ...process.env, PORT: FRONTEND_PORT.toString() },
      stdio: 'pipe',
      windowsHide: false,
      shell: true
    });
  }

  frontendProcess.stdout?.on('data', (d) => writeLog('frontend.log', d.toString()));
  frontendProcess.stderr?.on('data', (d) => writeLog('frontend-error.log', d.toString()));

  frontendProcess.on('exit', (code) => {
    writeLog('system.log', `Frontend finalizó con código: ${code}`);
  });
}

// 9. Crear ventana Splash Screen
function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 520,
    height: 380,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

// 10. Crear ventana principal optimizada
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    center: true,
    title: 'SAD - Sistema Integrado de Archivos Digitales | DISA Chincheros',
    icon: path.join(__dirname, '../assets/icon.ico'),
    backgroundColor: '#0f172a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      spellcheck: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  // Manejo de caídas o bloqueos de renderizado
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    writeLog('system.log', `Renderer process gone: ${JSON.stringify(details)}`);
    if (details.reason !== 'clean-exit') {
      mainWindow.reload();
    }
  });

  mainWindow.on('unresponsive', () => {
    writeLog('system.log', 'Ventana principal no responde');
  });

  mainWindow.loadURL(FRONTEND_URL);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.maximize();
    mainWindow.show();
    mainWindow.focus();

    // Inicializar el servicio de actualización automática
    setupAutoUpdater();
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      dialog.showMessageBox(mainWindow, {
        type: 'question',
        buttons: ['Sí, Salir', 'Cancelar'],
        defaultId: 0,
        cancelId: 1,
        title: 'Cerrar Sistema SAD',
        message: '¿Está seguro de que desea salir del Sistema Integrado de Archivos Digitales?',
        detail: 'Todos los servicios locales se detendrán y los puertos quedarán liberados.'
      }).then(({ response }) => {
        if (response === 0) {
          isQuitting = true;
          cleanupAndQuit();
        }
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 11. Controladores IPC y Actualizador Automático (AutoUpdater)
let autoUpdaterInstance = null;
let currentUpdateInfo = null;

function notifyRendererUpdater(payload) {
  if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
    mainWindow.webContents.send('updater:status', payload);
  }
}

function setupAutoUpdater() {
  let autoUpdaterModule = null;
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdaterModule = autoUpdater;
    autoUpdaterInstance = autoUpdater;
  } catch (err) {
    writeLog('updater.log', `electron-updater no disponible en este entorno: ${err.message}`);
    return;
  }

  autoUpdaterModule.autoDownload = false;
  autoUpdaterModule.autoInstallOnAppQuit = true;
  autoUpdaterModule.allowPrerelease = false;

  autoUpdaterModule.logger = {
    info: (msg) => writeLog('updater.log', `[INFO] ${msg}`),
    warn: (msg) => writeLog('updater.log', `[WARN] ${msg}`),
    error: (msg) => writeLog('updater.log', `[ERROR] ${msg}`)
  };

  autoUpdaterModule.on('checking-for-update', () => {
    writeLog('updater.log', 'Buscando nuevas actualizaciones en GitHub Releases...');
    notifyRendererUpdater({ status: 'checking' });
  });

  autoUpdaterModule.on('update-available', (info) => {
    writeLog('updater.log', `Nueva versión disponible encontrada: ${info.version}`);
    currentUpdateInfo = info;
    notifyRendererUpdater({
      status: 'available',
      info: {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes,
        releaseName: info.releaseName
      }
    });
  });

  autoUpdaterModule.on('update-not-available', (info) => {
    const currentVer = app.getVersion();
    writeLog('updater.log', `El sistema está al día con la última versión (${info?.version || currentVer})`);
    notifyRendererUpdater({
      status: 'not-available',
      info: {
        version: info?.version || currentVer
      }
    });
  });

  autoUpdaterModule.on('error', (err) => {
    const errText = err ? (err.message || String(err)) : 'Error desconocido al comprobar actualizaciones';
    writeLog('updater.log', `Error durante comprobación o descarga: ${errText}`);
    notifyRendererUpdater({
      status: 'error',
      error: errText
    });
  });

  autoUpdaterModule.on('download-progress', (progressObj) => {
    notifyRendererUpdater({
      status: 'downloading',
      info: currentUpdateInfo ? {
        version: currentUpdateInfo.version,
        releaseDate: currentUpdateInfo.releaseDate,
        releaseNotes: currentUpdateInfo.releaseNotes
      } : null,
      progress: {
        percent: Math.round(progressObj.percent || 0),
        bytesPerSecond: progressObj.bytesPerSecond || 0,
        total: progressObj.total || 0,
        transferred: progressObj.transferred || 0
      }
    });
  });

  autoUpdaterModule.on('update-downloaded', (info) => {
    writeLog('updater.log', `Paquete de actualización v${info.version} descargado y listo para instalar.`);
    notifyRendererUpdater({
      status: 'downloaded',
      info: {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes
      }
    });
  });
}

ipcMain.on('app:close', () => {
  if (mainWindow) mainWindow.close();
});
ipcMain.on('app:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on('app:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

// IPC Handlers de Actualización
ipcMain.handle('updater:get-app-info', () => {
  return {
    isDesktop: true,
    appVersion: app.getVersion(),
    platform: process.platform,
    arch: process.arch,
    isPackaged: app.isPackaged
  };
});

ipcMain.handle('updater:check', async () => {
  writeLog('updater.log', 'Petición de usuario: Buscar actualizaciones...');
  if (!autoUpdaterInstance) {
    // Si electron-updater no está en node_modules o es modo dev sin empaquetar
    if (!app.isPackaged) {
      return {
        status: 'not-available',
        info: {
          version: app.getVersion() + ' (Modo Desarrollo)'
        }
      };
    }
    return {
      status: 'error',
      error: 'El servicio de actualización automática no está disponible en este entorno.'
    };
  }

  try {
    const result = await autoUpdaterInstance.checkForUpdates();
    return {
      status: 'checking',
      updateCheckResult: result ? result.updateInfo : null
    };
  } catch (err) {
    writeLog('updater.log', `Error al buscar actualizaciones: ${err.message}`);
    return {
      status: 'error',
      error: err.message || 'No se pudo conectar con el servidor de actualizaciones en GitHub.'
    };
  }
});

ipcMain.handle('updater:download', async () => {
  writeLog('updater.log', 'Petición de usuario: Descargar actualización...');
  if (!autoUpdaterInstance) {
    throw new Error('El actualizador no se encuentra inicializado.');
  }
  try {
    await autoUpdaterInstance.downloadUpdate();
    return { success: true };
  } catch (err) {
    writeLog('updater.log', `Error al descargar paquete: ${err.message}`);
    throw err;
  }
});

ipcMain.handle('updater:install', async () => {
  writeLog('updater.log', 'Petición de usuario: Reiniciar e instalar actualización...');
  if (!autoUpdaterInstance) {
    throw new Error('El actualizador no se encuentra inicializado.');
  }

  isQuitting = true;

  // 1. Detener procesos locales de Backend y Frontend para desbloquear archivos en Windows
  killProcessTreeSync(backendProcess);
  killProcessTreeSync(frontendProcess);

  // 2. Liberar puertos
  freePortSync(BACKEND_PORT);
  freePortSync(FRONTEND_PORT);

  writeLog('updater.log', 'Subprocesos detenidos y puertos liberados. Ejecutando quitAndInstall...');

  // 3. Ejecutar el instalador y reiniciar
  setTimeout(() => {
    autoUpdaterInstance.quitAndInstall(false, true);
  }, 400);

  return { success: true };
});

// 12. Cierre y limpieza síncrona
function cleanupAndQuit() {
  console.log('🛑 Cerrando subprocesos locales...');

  // Matar subprocesos hijos directamente
  killProcessTreeSync(backendProcess);
  killProcessTreeSync(frontendProcess);

  // Garantizar que los puertos queden 100% libres
  freePortSync(BACKEND_PORT);
  freePortSync(FRONTEND_PORT);

  writeLog('system.log', 'Cierre seguro completado con puertos liberados.');

  setTimeout(() => {
    app.exit(0);
  }, 300);
}

// 13. Restaurar ventana si se abre una segunda instancia
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// 14. Ciclo de vida principal
app.whenReady().then(async () => {
  // 1. Limpiar puertos de ejecuciones previas incompletas
  freePortSync(BACKEND_PORT);
  freePortSync(FRONTEND_PORT);

  createSplashWindow();

  try {
    // 2. Verificar MySQL e iniciar Backend y Frontend concurrentemente
    await ensureDatabaseService();
    await Promise.all([
      ensureBackendRunning(),
      ensureFrontendRunning()
    ]);

    // 3. Polling adaptativo rápido (cada 300ms)
    let ready = false;
    let attempts = 0;
    const maxAttempts = 60; // 18 segundos máx

    while (!ready && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 300));
      ready = await checkEndpoint(FRONTEND_URL, 600);
      attempts++;
    }

    if (!ready) {
      if (splashWindow) splashWindow.close();
      dialog.showErrorBox(
        'Error de Inicio',
        'No se pudo conectar con el servidor local del SAD en el tiempo esperado.\n\nPor favor verifique que su servicio de base de datos MySQL/MariaDB esté activo en el puerto 3306.'
      );
      cleanupAndQuit();
      return;
    }

    createMainWindow();
  } catch (err) {
    console.error('Error crítico al iniciar aplicación:', err);
    writeLog('system.log', `Error crítico: ${err.message}`);
    if (splashWindow) splashWindow.close();
    dialog.showErrorBox(
      'Error Crítico',
      `Ocurrió un error inesperado al iniciar los servicios de SAD:\n${err.message}`
    );
    cleanupAndQuit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    cleanupAndQuit();
  }
});

app.on('before-quit', () => {
  cleanupAndQuit();
});
