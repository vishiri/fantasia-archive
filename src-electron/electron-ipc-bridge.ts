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
export const FA_APP_STYLING_IPC = {
  getAsync: 'fa-app-styling-get-async',
  setAsync: 'fa-app-styling-set-async'
} as const

/** App noteboard text + frame ('electron-store' in main): preload uses async invoke; main uses handle. */
export const FA_APP_NOTEBOARD_IPC = {
  getAsync: 'fa-app-noteboard-get-async',
  setAsync: 'fa-app-noteboard-set-async'
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

/** App configuration bundle (.faconfig) — async invoke/handle. */
export const FA_APP_CONFIG_IPC = {
  exportToFileAsync: 'fa-app-config-export-to-file-async',
  prepareImportAsync: 'fa-app-config-prepare-import-async',
  applyImportAsync: 'fa-app-config-apply-import-async',
  disposeImportSessionAsync: 'fa-app-config-dispose-import-session-async'
} as const

/** Project database (.faproject) — async invoke/handle. */
export const FA_PROJECT_MANAGEMENT_IPC = {
  createProjectAsync: 'fa-project-management-create-project-async',
  getRecentProjectsAsync: 'fa-project-management-get-recent-projects-async',
  resolveRecentProjectMruHeadForOpenAsync:
    'fa-project-management-resolve-recent-project-mru-head-for-open-async',
  getProjectNoteboardAsync: 'fa-project-management-get-project-noteboard-async',
  getProjectSettingsAsync: 'fa-project-management-get-project-settings-async',
  getProjectStylingAsync: 'fa-project-management-get-project-styling-async',
  openProjectAsync: 'fa-project-management-open-project-async',
  setProjectNoteboardPatchAsync:
    'fa-project-management-set-project-noteboard-patch-async',
  setProjectSettingsPatchAsync:
    'fa-project-management-set-project-settings-patch-async',
  setProjectStylingPatchAsync:
    'fa-project-management-set-project-styling-patch-async'
} as const

/** Active '.faproject' worldbuilding content tables — async invoke/handle. */
export const FA_PROJECT_CONTENT_IPC = {
  createDocumentAsync: 'fa-project-content-create-document-async',
  createDocumentTemplateAsync: 'fa-project-content-create-document-template-async',
  createMediaAsync: 'fa-project-content-create-media-async',
  createWorldAsync: 'fa-project-content-create-world-async',
  deleteDocumentAsync: 'fa-project-content-delete-document-async',
  deleteDocumentTemplateAsync: 'fa-project-content-delete-document-template-async',
  deleteMediaAsync: 'fa-project-content-delete-media-async',
  deleteWorldAsync: 'fa-project-content-delete-world-async',
  getDocumentByIdAsync: 'fa-project-content-get-document-by-id-async',
  getDocumentTemplateByIdAsync: 'fa-project-content-get-document-template-by-id-async',
  getMediaByIdAsync: 'fa-project-content-get-media-by-id-async',
  getWorldByIdAsync: 'fa-project-content-get-world-by-id-async',
  linkDocumentMediaAsync: 'fa-project-content-link-document-media-async',
  linkWorldDocumentTemplateAsync: 'fa-project-content-link-world-document-template-async',
  listDocumentMediaAsync: 'fa-project-content-list-document-media-async',
  listDocumentTemplatesForWorldAsync: 'fa-project-content-list-document-templates-for-world-async',
  listDocumentsAsync: 'fa-project-content-list-documents-async',
  listDocumentTemplatesAsync: 'fa-project-content-list-document-templates-async',
  listMediaAsync: 'fa-project-content-list-media-async',
  listWorldsAsync: 'fa-project-content-list-worlds-async',
  listWorldsForProjectSettingsAsync: 'fa-project-content-list-worlds-for-project-settings-async',
  listWorldsForDocumentTemplateAsync: 'fa-project-content-list-worlds-for-document-template-async',
  saveWorldsSnapshotAsync: 'fa-project-content-save-worlds-snapshot-async',
  setDocumentTemplateAsync: 'fa-project-content-set-document-template-async',
  setDocumentWorldAsync: 'fa-project-content-set-document-world-async',
  unlinkDocumentMediaAsync: 'fa-project-content-unlink-document-media-async',
  unlinkWorldDocumentTemplateAsync: 'fa-project-content-unlink-world-document-template-async',
  updateDocumentAsync: 'fa-project-content-update-document-async',
  updateDocumentTemplateAsync: 'fa-project-content-update-document-template-async',
  updateMediaAsync: 'fa-project-content-update-media-async',
  updateWorldAsync: 'fa-project-content-update-world-async'
} as const

/**
 * Main ↔ renderer failsafe: when main lost the mirrored path but the renderer still has an active project path.
 */
export const FA_PROJECT_FAILSAFE_IPC = {
  /** Main → renderer: string correlation id */
  requestActiveProjectPathFromRenderer: 'fa-project-failsafe-request-active-path',
  /** Renderer → main: payload '{ correlationId: string, filePath: string | null }' */
  replyActiveProjectPathToMain: 'fa-project-failsafe-reply-active-path'
} as const

/**
 * OS file-open → renderer: main 'webContents.send'; renderer boot 'ipcRenderer.send' when listeners are wired.
 */
export const FA_PROJECT_OS_OPEN_IPC = {
  openFromOsToRenderer: 'fa-project-os-open-from-os-to-renderer',
  rendererReadyToMain: 'fa-project-os-open-renderer-ready-to-main'
} as const

/**
 * Chromium-reserved Ctrl+Shift chords: main 'webContents.send' after 'before-input-event' preventDefault.
 */
export const FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_IPC = {
  forwardKeyChordToRenderer: 'fa-chromium-ctrl-shift-forward-key-chord'
} as const
