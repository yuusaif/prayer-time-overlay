const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getPrayerTimes: () => ipcRenderer.invoke('get-prayer-times'),
  savePrayerTimes: (times) => ipcRenderer.invoke('save-prayer-times', times),
  getAutoStart: () => ipcRenderer.invoke('get-auto-start'),
  setAutoStart: (enabled) => ipcRenderer.invoke('set-auto-start', enabled),
  isAdmin: () => ipcRenderer.invoke('is-admin'),
  broadcastMessage: (message) => ipcRenderer.invoke('broadcast-message', message),
  closeOverlay: () => ipcRenderer.send('close-overlay')
});