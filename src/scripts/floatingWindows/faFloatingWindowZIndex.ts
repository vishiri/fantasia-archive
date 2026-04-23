/** In-renderer floating frames must stay below Quasar overlays / app chrome (6000+). */
export const FA_FLOATING_WINDOW_Z_INDEX_MIN = 5000
export const FA_FLOATING_WINDOW_Z_INDEX_MAX = 5999

let floatingWindowZSeed = FA_FLOATING_WINDOW_Z_INDEX_MIN - 1

export function bumpFloatingWindowZIndex (): number {
  floatingWindowZSeed += 1
  if (floatingWindowZSeed > FA_FLOATING_WINDOW_Z_INDEX_MAX) {
    floatingWindowZSeed = FA_FLOATING_WINDOW_Z_INDEX_MIN
  }
  return floatingWindowZSeed
}
