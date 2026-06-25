/** @vitest-environment jsdom */

import { expect, test, vi } from 'vitest'

import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor,
  FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS
} from '../faDragDrop_manager'

/**
 * faVerticalDraggableTabsDocumentDragCursor
 * Toggles a body class for the grab cursor for the whole Sortable drag.
 */
test('faVerticalDraggableTabsDocumentDragCursor adds and removes the body dragging class', () => {
  document.body.classList.remove(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)

  applyFaVerticalDraggableTabsDocumentDragCursor()
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(true)
  expect(document.body.style.cursor).toBe('grab')

  clearFaVerticalDraggableTabsDocumentDragCursor()
  expect(document.body.classList.contains(FA_VERTICAL_DRAGGABLE_TABS_DOCUMENT_DRAGGING_BODY_CLASS)).toBe(false)
  expect(document.body.style.cursor).toBe('')
})

/**
 * faVerticalDraggableTabsDocumentDragCursor
 * Skips DOM updates when document is unavailable.
 */
test('faVerticalDraggableTabsDocumentDragCursor no-ops without document', () => {
  vi.stubGlobal('document', undefined)

  expect(() => {
    applyFaVerticalDraggableTabsDocumentDragCursor()
    clearFaVerticalDraggableTabsDocumentDragCursor()
  }).not.toThrow()

  vi.unstubAllGlobals()
})
