export const FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS = 'fa-userSetting--hideDeadCrossThrough'

/**
 * Toggles body.fa-userSetting--hideDeadCrossThrough so global CSS can kill line-through.
 */
export function applyFaHideDeadCrossThroughToDocument (enabled: boolean): void {
  if (typeof document === 'undefined') {
    return
  }

  const body = document.body
  if (enabled) {
    body.classList.add(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)
    return
  }
  body.classList.remove(FA_HIDE_DEAD_CROSS_THROUGH_BODY_CLASS)
}
