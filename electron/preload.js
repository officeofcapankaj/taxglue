/**
 * TaxGlue Desktop Preload Script
 * 
 * Provides secure bridge between renderer (web content) and main (Node.js) process.
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('taxglue', {
  // Get app info
  getInfo: () => ({
    version: '1.0.0',
    platform: process.platform,
    arch: process.arch
  }),
  
  // Data operations
  getDataPath: () => ipcRenderer.invoke('get-data-path'),
  
  // File operations
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  backupData: () => ipcRenderer.invoke('backup-data'),
  
  // Event listeners
  onExportData: (callback) => ipcRenderer.on('export-data', callback),
  onImportData: (callback) => ipcRenderer.on('import-data', callback),
  onBackupData: (callback) => ipcRenderer.on('backup-data', callback),
  onCheckUpdates: (callback) => ipcRenderer.on('check-updates', callback),
  onShowAbout: (callback) => ipcRenderer.on('show-about', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Expose file system access via the API
contextBridge.exposeInMainWorld('fs', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  writeFile: (path, data) => ipcRenderer.invoke('write-file', path, data)
});