const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const http = require('http');
const { spawn, exec } = require('child_process');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const BACKEND_PORT = 5001;
const FRONTEND_PORT = 3000;
const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;
const BACKEND_HEALTH_URL = `http://localhost:${BACKEND_PORT}/api/health`;

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
let frontendProcess = null;
let isQuitting = false;

// 1. Directorio para logs de ejecución
const logDir = path.join(app.getPath('userData'), 'logs');
try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (e) {
  // Ignorar error al crear directorio de logs
}

function writeLog(filename, text) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(path.join(logDir, filename), `[${timestamp}] ${text}\n`);
  } catch (e) {
    // Silencio si falla el log
  }
}

// 2. Verificar servicio local de base de datos MySQL en Windows
function ensureDatabaseService() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve();

    exec('netstat -ano | findstr /R ":3306 "', (err, stdout) => {
      if (stdout && stdout.trim().length > 0) {
        console.log('✅ Base de datos local activa en puerto 3306');
        return resolve();
      }

      console.log('ℹ️ Intentando iniciar servicio de Base de Datos local...');
      exec('sc start wampmysqld64 || sc start wampmariadb64 || sc start MySQL80 || sc start mysql', () => {
        setTimeout(resolve, 2500);
      });
    });
  });
}

// 3. Verificar si un puerto HTTP está respondiendo
function checkEndpoint(url, timeoutMs = 2000) {
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

// 4. Iniciar el Backend si no está corriendo
async function ensureBackendRunning() {
  const isRunning = await checkEndpoint(BACKEND_HEALTH_URL);
  if (isRunning) {
    console.log('✅ Backend ya está activo en puerto ' + BACKEND_PORT);
    return;
  }

  console.log('🚀 Iniciando servicio Backend SAD...');
  const backendDir = isDev
    ? path.join(__dirname, '../../backend')
    : path.join(process.resourcesPath, 'backend');

  const env = {
    ...process.env,
    PORT: BACKEND_PORT.toString(),
    NODE_ENV: 'production'
  };

  const distServer = path.join(backendDir, 'dist/server.js');
  const nodeBinary = app.isPackaged ? process.execPath : 'node';

  if (fs.existsSync(distServer)) {
    const spawnEnv = {
      ...env,
      ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {})
    };

    backendProcess = spawn(nodeBinary, [distServer], {
      cwd: backendDir,
      env: spawnEnv,
      stdio: 'pipe',
      windowsHide: true,
      shell: !app.isPackaged
    });
  } else {
    // Modo desarrollo con ts-node
    backendProcess = spawn('npm.cmd', ['run', 'dev'], {
      cwd: backendDir,
      env,
      stdio: 'pipe',
      windowsHide: false,
      shell: true
    });
  }

  backendProcess.stdout?.on('data', (d) => {
    const str = d.toString();
    console.log(`[Backend] ${str}`);
    writeLog('backend.log', str);
  });
  backendProcess.stderr?.on('data', (d) => {
    const str = d.toString();
    console.error(`[Backend Error] ${str}`);
    writeLog('backend-error.log', str);
  });
}

// 5. Iniciar el Frontend si no está corriendo
async function ensureFrontendRunning() {
  const isRunning = await checkEndpoint(FRONTEND_URL);
  if (isRunning) {
    console.log('✅ Frontend ya está activo en puerto ' + FRONTEND_PORT);
    return;
  }

  console.log('🚀 Iniciando interfaz de usuario SAD...');
  const frontendDir = isDev
    ? path.join(__dirname, '../../frontend')
    : path.join(process.resourcesPath, 'frontend');

  const possibleStandaloneServers = [
    path.join(frontendDir, 'server.js'),
    path.join(frontendDir, '.next/standalone/server.js')
  ];

  const standaloneServer = possibleStandaloneServers.find(p => fs.existsSync(p));
  const nodeBinary = app.isPackaged ? process.execPath : 'node';

  if (standaloneServer) {
    const spawnEnv = {
      ...process.env,
      ...(app.isPackaged ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
      PORT: FRONTEND_PORT.toString(),
      NODE_ENV: 'production'
    };

    frontendProcess = spawn(nodeBinary, [standaloneServer], {
      cwd: path.dirname(standaloneServer),
      env: spawnEnv,
      stdio: 'pipe',
      windowsHide: true,
      shell: !app.isPackaged
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

  frontendProcess.stdout?.on('data', (d) => {
    const str = d.toString();
    console.log(`[Frontend] ${str}`);
    writeLog('frontend.log', str);
  });
  frontendProcess.stderr?.on('data', (d) => {
    const str = d.toString();
    console.error(`[Frontend Error] ${str}`);
    writeLog('frontend-error.log', str);
  });
}

// 6. Crear ventana Splash Screen
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

// 7. Crear ventana principal
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    center: true,
    title: 'SAD - Sistema Integrado de Archivos Digitales | DISA Chincheros',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();

  mainWindow.loadURL(FRONTEND_URL);

  mainWindow.once('ready-to-show', () => {
    if (splashWindow) {
      splashWindow.close();
    }
    mainWindow.show();
    mainWindow.focus();
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
        detail: 'Todos los servicios locales y procesos en memoria se detendrán de forma segura.'
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

// 8. Controladores IPC expuestos al Frontend
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

// 9. Limpieza y cierre seguro de procesos
function cleanupAndQuit() {
  console.log('🛑 Cerrando subprocesos locales...');

  if (backendProcess && !backendProcess.killed) {
    try {
      if (process.platform === 'win32' && backendProcess.pid) {
        exec(`taskkill /pid ${backendProcess.pid} /T /F`);
      } else {
        backendProcess.kill('SIGTERM');
      }
    } catch (err) {
      console.error('Error al cerrar backend:', err);
    }
  }

  if (frontendProcess && !frontendProcess.killed) {
    try {
      if (process.platform === 'win32' && frontendProcess.pid) {
        exec(`taskkill /pid ${frontendProcess.pid} /T /F`);
      } else {
        frontendProcess.kill('SIGTERM');
      }
    } catch (err) {
      console.error('Error al cerrar frontend:', err);
    }
  }

  app.quit();
}

// 10. Ciclo de vida de la aplicación
app.whenReady().then(async () => {
  createSplashWindow();

  try {
    await ensureDatabaseService();
    await ensureBackendRunning();
    await ensureFrontendRunning();

    // Esperar a que el frontend esté listo
    let ready = false;
    let attempts = 0;
    const maxAttempts = 60; // 30 segundos máx

    while (!ready && attempts < maxAttempts) {
      await new Promise((r) => setTimeout(r, 500));
      ready = await checkEndpoint(FRONTEND_URL);
      attempts++;
    }

    if (!ready) {
      if (splashWindow) splashWindow.close();
      dialog.showErrorBox(
        'Error de Inicio',
        'No se pudo conectar con el servidor local del SAD en el tiempo esperado. Verifique que el servicio MySQL esté iniciado (puerto 3306).'
      );
      app.quit();
      return;
    }

    createMainWindow();
  } catch (err) {
    console.error('Error crítico al iniciar aplicación:', err);
    if (splashWindow) splashWindow.close();
    dialog.showErrorBox(
      'Error Crítico',
      `Ocurrió un error inesperado al iniciar los servicios de SAD:\n${err.message}`
    );
    app.quit();
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
