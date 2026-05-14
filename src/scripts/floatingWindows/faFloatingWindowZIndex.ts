/** In-renderer floating frames must stay below Quasar overlays / app chrome (6000+). */
export const FA_FLOATING_WINDOW_Z_INDEX_MAX = 5999

/** App styling and other non-noteboard floating windows. */
export const FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN = 5000
export const FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX = 5899

/**
 * App-wide noteboard: stacks above styling windows within the overlay band below 6000.
 */
export const FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MIN = 5900
export const FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MAX = 5949

/**
 * Project-scoped noteboard: stacks strictly above 'FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_*'.
 */
export const FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN = 5950
export const FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MAX = FA_FLOATING_WINDOW_Z_INDEX_MAX

/**
 * Historical name: same as 'FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN' (overall band floor).
 */
export const FA_FLOATING_WINDOW_Z_INDEX_MIN = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN

/**
 * Compatibility alias for older imports referring to app noteboard layering before splitting sub-bands.
 */
export const FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN =
  FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MIN

/**
 * Compatibility alias for older imports referring to app noteboard layering before splitting sub-bands.
 */
export const FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MAX =
  FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MAX

let floatingWindowStandardZSeed = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN - 1

let floatingWindowAppNoteboardZSeed =
  FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MIN - 1

let floatingWindowProjectNoteboardZSeed =
  FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN - 1

export function bumpFloatingWindowZIndex (): number {
  floatingWindowStandardZSeed += 1
  if (floatingWindowStandardZSeed > FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX) {
    floatingWindowStandardZSeed = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN
  }
  return floatingWindowStandardZSeed
}

export function bumpNoteboardFloatingWindowZIndex (): number {
  floatingWindowAppNoteboardZSeed += 1
  if (floatingWindowAppNoteboardZSeed > FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MAX) {
    floatingWindowAppNoteboardZSeed = FA_FLOATING_WINDOW_Z_INDEX_APP_NOTEBOARD_MIN
  }
  return floatingWindowAppNoteboardZSeed
}

export function bumpProjectNoteboardFloatingWindowZIndex (): number {
  floatingWindowProjectNoteboardZSeed += 1
  if (
    floatingWindowProjectNoteboardZSeed >
    FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MAX
  ) {
    floatingWindowProjectNoteboardZSeed =
      FA_FLOATING_WINDOW_Z_INDEX_PROJECT_NOTEBOARD_MIN
  }
  return floatingWindowProjectNoteboardZSeed
}
