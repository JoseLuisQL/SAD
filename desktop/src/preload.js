const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  appVersion: '1.0.0',
  platform: process.platform,
  closeApp: () => ipcRenderer.send('app:close'),
  minimizeApp: () => ipcRenderer.send('app:minimize'),
  maximizeApp: () => ipcRenderer.send('app:maximize')
});
