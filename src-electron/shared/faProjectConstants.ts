/**
 * Fantasia project file (.faproject) — extension and validation limits shared by main, IPC, and Zod.
 */

export const FA_PROJECT_FILE_EXTENSION = 'faproject' as const

/** Display name length bound before trimming (Zod refine after trim). */
export const FA_PROJECT_DISPLAY_NAME_MAX_LEN = 200

/** Suggested basename length cap excluding extension. */
export const FA_PROJECT_SLUG_MAX_LEN = 120
