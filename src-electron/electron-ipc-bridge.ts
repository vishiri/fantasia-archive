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

/** Keybind overrides ('electron-store' in main): preload uses async 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_KEYBINDS_IPC = {
  getAsync: 'fa-keybinds-get-async',
  setAsync: 'fa-keybinds-set-async'
} as const

/** User-defined custom CSS ('electron-store' in main): preload uses async 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_PROGRAM_STYLING_IPC = {
  getAsync: 'fa-program-styling-get-async',
  setAsync: 'fa-program-styling-set-async'
} as const

/** Window chrome: preload uses 'ipcRenderer.invoke'; main uses 'ipcMain.handle'. */
export const FA_WINDOW_CONTROL_IPC = {
  checkMaximizedAsync: 'fa-window-control-check-maximized-async',
  minimizeAsync: 'fa-window-control-minimize-async',
  maximizeAsync: 'fa-window-control-maximize-async',
  resizeToggleAsync: 'fa-window-control-resize-toggle-async',
  closeAsync: 'fa-window-control-close-async',
  refreshWebContentsAsync: 'fa-window-control-refresh-web-contents-async'
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

/** Program config bundle (.faconfig) — async invoke/handle. */
export const FA_PROGRAM_CONFIG_IPC = {
  exportToFileAsync: 'fa-program-config-export-to-file-async',
  prepareImportAsync: 'fa-program-config-prepare-import-async',
  applyImportAsync: 'fa-program-config-apply-import-async',
  disposeImportSessionAsync: 'fa-program-config-dispose-import-session-async'
} as const

/** Project database (.faproject) — async invoke/handle. */
export const FA_PROJECT_MANAGEMENT_IPC = {
  createProjectAsync: 'fa-project-management-create-project-async'
} as const
