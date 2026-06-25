/** @vitest-environment jsdom */

import { expect, test, vi } from 'vitest'

import {
  FA_SORTABLE_TRANSPARENT_DRAG_IMAGE_SRC,
  hideNativeSortableDragGhost
} from '../functions/hideNativeSortableDragGhost'

/**
 * hideNativeSortableDragGhost
 * Replaces the browser drag preview with a transparent 1x1 image.
 */
test('hideNativeSortableDragGhost calls setDragImage with a transparent Image', () => {
  const setDragImage = vi.fn()
  const dataTransfer = {
    setDragImage
  } as unknown as DataTransfer

  hideNativeSortableDragGhost(dataTransfer)

  expect(setDragImage).toHaveBeenCalledTimes(1)
  const dragImage = setDragImage.mock.calls[0]![0]! as HTMLImageElement
  expect(dragImage).toBeInstanceOf(Image)
  expect(dragImage.src).toContain(FA_SORTABLE_TRANSPARENT_DRAG_IMAGE_SRC)
  expect(setDragImage).toHaveBeenCalledWith(dragImage, 0, 0)
})
