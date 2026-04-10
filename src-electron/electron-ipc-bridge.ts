/**
 * Canonical main ↔ preload IPC channel registry for Fantasia Archive.
 * - Preload (contentBridgeAPIs) and main (mainScripts/ipcManagement/register*Ipc) import from this module so channel strings stay aligned.
 * - Add new channel groups here as 'export const' objects.
 */

/** DevTools: preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_DEVTOOLS_IPC = {
  statusAsync: 'fa-devtools-status-async',
  toggleAsync: 'fa-devtools-toggle-async',
  openAsync: 'fa-devtools-open-async',
  closeAsync: 'fa-devtools-close-async'
} as const

/** User settings ('electron-store' in main): preload uses async 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_USER_SETTINGS_IPC = {
  getAsync: 'fa-user-settings-get-async',
  setAsync: 'fa-user-settings-set-async'
} as const

/** Window chrome: preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_WINDOW_CONTROL_IPC = {
  checkMaximizedAsync: 'fa-window-control-check-maximized-async',
  minimizeAsync: 'fa-window-control-minimize-async',
  maximizeAsync: 'fa-window-control-maximize-async',
  resizeToggleAsync: 'fa-window-control-resize-toggle-async',
  closeAsync: 'fa-window-control-close-async'
} as const

/** App metadata: preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_APP_DETAILS_IPC = {
  getVersionAsync: 'fa-app-details-get-version-async'
} as const

/** Harness and path snapshot: preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_EXTRA_ENV_IPC = {
  snapshotAsync: 'fa-extra-env-snapshot-async'
} as const

/** Open external URLs in the system browser (async): preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_EXTERNAL_LINKS_IPC = {
  openExternalAsync: 'fa-external-links-open-external-async'
} as const
