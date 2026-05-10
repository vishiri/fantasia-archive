/**
 * App configuration bundle (.faconfig) — names and size limits shared by main, IPC, and Zod.
 */

/** Maximum size of a picked .faconfig file or total uncompressed JSON payload (bytes). */
export const FA_APP_CONFIG_MAX_FILE_BYTES = 3 * 1024 * 1024

/**
 * Basenames inside the ZIP, matching 'electron-store' JSON file names in userData.
 * Only these may appear in a valid archive.
 */
export const FA_APP_CONFIG_INNER = {
  keybinds: 'faKeybinds.json',
  appNoteboard: 'faAppNoteboard.json',
  appStyling: 'faAppStyling.json',
  userSettings: 'faUserSettings.json'
} as const

export type T_faAppConfigInnerKey = keyof typeof FA_APP_CONFIG_INNER

/**
 * Staged import session validity window (ms) before the main process drops cached data.
 */
export const FA_APP_CONFIG_IMPORT_SESSION_TTL_MS = 30 * 60 * 1000
