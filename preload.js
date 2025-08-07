const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  saveTasksCSV: (tasksData) => ipcRenderer.invoke('save-tasks-csv', tasksData),
  loadTasksCSV: () => ipcRenderer.invoke('load-tasks-csv'),
  
  // Listen for save requests from main process
  onRequestSave: (callback) => ipcRenderer.on('request-save-data', callback),
  onRequestFinalSave: (callback) => ipcRenderer.on('request-final-save', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

window.addEventListener('DOMContentLoaded', () => {
  // Safe exposure of APIs if needed
});