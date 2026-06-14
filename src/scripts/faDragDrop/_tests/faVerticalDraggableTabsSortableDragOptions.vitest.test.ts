import { expect, test } from 'vitest'

import {
  FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_CLASS,
  FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_TOLERANCE_PX,
  faVerticalDraggableTabsSortableDragOptions
} from '../functions/faVerticalDraggableTabsSortableDragOptions'

/**
 * faVerticalDraggableTabsSortableDragOptions
 * Enables Sortable fallback dragging so the grab cursor can follow the pointer.
 */
test('faVerticalDraggableTabsSortableDragOptions enables forceFallback with an invisible proxy class', () => {
  expect(faVerticalDraggableTabsSortableDragOptions).toEqual({
    fallbackClass: FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_CLASS,
    fallbackOnBody: true,
    fallbackTolerance: FA_VERTICAL_DRAGGABLE_TABS_SORTABLE_FALLBACK_TOLERANCE_PX,
    forceFallback: true
  })
})
