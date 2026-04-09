/**
 * Canonical main ↔ preload IPC channel registry for Fantasia Archive.
 * - Preload (contentBridgeAPIs) and main (mainScripts/ipcManagement/register*Ipc) import from this module so channel strings stay aligned.
 * - Add new channel groups here as 'export const' objects.
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

/** Window chrome (sync): preload uses 'ipcRenderer.sendSync'; main uses 'ipcMain.on' with 'returnValue'. */
export const FA_WINDOW_CONTROL_IPC = {
  checkMaximizedSync: 'fa-window-control-check-maximized-sync',
  minimizeSync: 'fa-window-control-minimize-sync',
  maximizeSync: 'fa-window-control-maximize-sync',
  resizeToggleSync: 'fa-window-control-resize-toggle-sync',
  closeSync: 'fa-window-control-close-sync'
} as const

/** App metadata (sync): preload uses 'ipcRenderer.sendSync'; main uses 'ipcMain.on' with 'returnValue'. */
export const FA_APP_DETAILS_IPC = {
  getVersionSync: 'fa-app-details-get-version-sync'
} as const
