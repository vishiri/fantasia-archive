/**
 * Sortable fallback clone class — invisible drag proxy when forceFallback is enabled.
 */
export const FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_CLASS =
  'faVerticalDraggableTabs__sortableFallback'

/**
 * Pointer movement (px) required before Sortable treats forceFallback input as a drag.
 * Keeps tab clicks reliable when the mouse moves slightly between press and release.
 */
export const FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_TOLERANCE_PX = 8

/**
 * Shared vue-draggable-plus / Sortable options for vertical tab lists.
 * forceFallback avoids HTML5 DnD so CSS cursor rules work in Chromium / Electron.
 */
export const faVerticalDraggableTabsSortableDragOptions = {
  fallbackClass: FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_CLASS,
  fallbackOnBody: true,
  fallbackTolerance: FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_TOLERANCE_PX,
  forceFallback: true
} as const
