import type { Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

/**
 * Applies one pointer sample to the floating window frame during title-bar drag (from rAF-batched pointermove).
 */
export function applyFaFloatingWindowTitleDragFromPointer (
  layout: I_FaFloatingWindowFrameLayout,
  e: PointerEvent,
  dragStartX: number,
  dragStartY: number,
  originX: number,
  originY: number,
  w: Ref<number>,
  h: Ref<number>,
  x: Ref<number>,
  y: Ref<number>
): void {
  const dx = e.clientX - dragStartX
  const dy = e.clientY - dragStartY
  const maxX = Math.max(
    layout.marginLeftPx,
    window.innerWidth - w.value - layout.marginRightPx
  )
  const maxY = Math.max(
    layout.marginTopPx,
    window.innerHeight - h.value - layout.marginBottomPx
  )
  x.value = Math.min(maxX, Math.max(layout.marginLeftPx, originX + dx))
  y.value = Math.min(maxY, Math.max(layout.marginTopPx, originY + dy))
}
