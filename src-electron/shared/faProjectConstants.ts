/**
 * Fantasia project file (.faproject) — extension and validation limits shared by main, IPC, Zod, and renderer UI.
 */

export const FA_PROJECT_FILE_EXTENSION = 'faproject' as const

/**
 * Unified maximum length for project display names and related surfaces: Zod validation, New project **q-input**, recent-project list entry names, and save-dialog slug stem normalization.
 */
export const FA_PROJECT_NAME_MAX_LEN = 120
