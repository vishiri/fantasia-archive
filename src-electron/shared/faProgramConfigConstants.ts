/**
 * Program configuration bundle (.faconfig) — names and size limits shared by main, IPC, and Zod.
 */

/** Maximum size of a picked .faconfig file or total uncompressed JSON payload (bytes). */
export const FA_PROGRAM_CONFIG_MAX_FILE_BYTES = 3 * 1024 * 1024

/**
 * Basenames inside the ZIP, matching 'electron-store' JSON file names in userData.
 * Only these may appear in a valid archive.
 */
export const FA_PROGRAM_CONFIG_INNER = {
  userSettings: 'faUserSettings.json',
  keybinds: 'faKeybinds.json',
  programStyling: 'faProgramStyling.json'
} as const

export type T_faProgramConfigInnerKey = keyof typeof FA_PROGRAM_CONFIG_INNER

/**
 * Staged import session validity window (ms) before the main process drops cached data.
 */
export const FA_PROGRAM_CONFIG_IMPORT_SESSION_TTL_MS = 30 * 60 * 1000
