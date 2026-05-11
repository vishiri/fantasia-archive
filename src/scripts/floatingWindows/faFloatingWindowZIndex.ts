/** In-renderer floating frames must stay below Quasar overlays / app chrome (6000+). */
export const FA_FLOATING_WINDOW_Z_INDEX_MAX = 5999

/** App styling and other non-noteboard floating windows. */
export const FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN = 5000
export const FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX = 5899

/** App noteboard: stacks above other floating windows, still below 6000. */
export const FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN = 5900
export const FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MAX = FA_FLOATING_WINDOW_Z_INDEX_MAX

/**
 * Historical name: same as 'FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN' (overall band floor).
 */
export const FA_FLOATING_WINDOW_Z_INDEX_MIN = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN

let floatingWindowStandardZSeed = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN - 1
let floatingWindowNoteboardZSeed = FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN - 1

export function bumpFloatingWindowZIndex (): number {
  floatingWindowStandardZSeed += 1
  if (floatingWindowStandardZSeed > FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MAX) {
    floatingWindowStandardZSeed = FA_FLOATING_WINDOW_Z_INDEX_STANDARD_MIN
  }
  return floatingWindowStandardZSeed
}

export function bumpNoteboardFloatingWindowZIndex (): number {
  floatingWindowNoteboardZSeed += 1
  if (floatingWindowNoteboardZSeed > FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MAX) {
    floatingWindowNoteboardZSeed = FA_FLOATING_WINDOW_Z_INDEX_NOTEBOARD_MIN
  }
  return floatingWindowNoteboardZSeed
}
