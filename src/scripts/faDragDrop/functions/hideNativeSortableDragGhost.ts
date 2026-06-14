/** 1x1 transparent GIF used to replace the browser HTML5 drag preview. */
export const FA_SORTABLE_TRANSPARENT_DRAG_IMAGE_SRC =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'

/**
 * Sortable / vue-draggable-plus setData hook: suppress the native drag-drop ghost overlay.
 */
export function hideNativeSortableDragGhost (dataTransfer: DataTransfer): void {
  const emptyDragImage = new Image()
  emptyDragImage.src = FA_SORTABLE_TRANSPARENT_DRAG_IMAGE_SRC
  dataTransfer.setDragImage(emptyDragImage, 0, 0)
}
