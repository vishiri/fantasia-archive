import {
  FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS,
  FA_VERTICAL_DRAGGABLE_TABS_DRAG_CURSOR
} from './functions/faVerticalDraggableTabsDocumentDragCursorConstants'

/**
 * Applies the vertical draggable tabs grab cursor for the duration of a Sortable drag.
 */
export function applyFaVerticalDraggableTabsDocumentDragCursor (): void {
  if (typeof document === 'undefined') {
    return
  }

  document.body.classList.add(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)
  document.body.style.setProperty('cursor', FA_VERTICAL_DRAGGABLE_TABS_DRAG_CURSOR, 'important')
}

/**
 * Clears the vertical draggable tabs document drag cursor after Sortable drag ends.
 */
export function clearFaVerticalDraggableTabsDocumentDragCursor (): void {
  if (typeof document === 'undefined') {
    return
  }

  document.body.classList.remove(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)
  document.body.style.removeProperty('cursor')
}
