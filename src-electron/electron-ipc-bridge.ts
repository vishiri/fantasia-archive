/**
 * Canonical main ↔ preload IPC channel registry for Fantasia Archive.
 * Preload (contentBridgeAPIs) and main (mainScripts/register*Ipc) import from this module
 * so channel strings stay aligned. Add new channel groups here as 'export const' objects.
 */

/** DevTools (sync): preload uses 'ipcRenderer.sendSync'; main uses 'ipcMain.on' with 'returnValue'. */
export const FA_DEVTOOLS_IPC = {
  statusSync: 'fa-devtools-status-sync',
  toggleSync: 'fa-devtools-toggle-sync',
  openSync: 'fa-devtools-open-sync',
  closeSync: 'fa-devtools-close-sync'
} as const

/** User settings ('electron-store' in main): preload uses async 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_USER_SETTINGS_IPC = {
  getAsync: 'fa-user-settings-get-async',
  setAsync: 'fa-user-settings-set-async'
} as const
