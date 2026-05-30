import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'

interface I_faFloatingWindowFrameAxisRef {
  value: number
}

export function createFaFloatingWindowTitleDragPointerApply (deps: {
  getInnerHeight: () => number
  getInnerWidth: () => number
}): {
    applyFaFloatingWindowTitleDragFromPointer: (
      layout: I_FaFloatingWindowFrameLayout,
      e: PointerEvent,
      dragStartX: number,
      dragStartY: number,
      originX: number,
      originY: number,
      w: I_faFloatingWindowFrameAxisRef,
      h: I_faFloatingWindowFrameAxisRef,
      x: I_faFloatingWindowFrameAxisRef,
      y: I_faFloatingWindowFrameAxisRef
    ) => void
  } {
  const applyFaFloatingWindowTitleDragFromPointer = (
    layout: I_FaFloatingWindowFrameLayout,
    e: PointerEvent,
    dragStartX: number,
    dragStartY: number,
    originX: number,
    originY: number,
    w: I_faFloatingWindowFrameAxisRef,
    h: I_faFloatingWindowFrameAxisRef,
    x: I_faFloatingWindowFrameAxisRef,
    y: I_faFloatingWindowFrameAxisRef
  ): void => {
    const dx = e.clientX - dragStartX
    const dy = e.clientY - dragStartY
    const maxX = Math.max(
      layout.marginLeftPx,
      deps.getInnerWidth() - w.value - layout.marginRightPx
    )
    const maxY = Math.max(
      layout.marginTopPx,
      deps.getInnerHeight() - h.value - layout.marginBottomPx
    )
    x.value = Math.min(maxX, Math.max(layout.marginLeftPx, originX + dx))
    y.value = Math.min(maxY, Math.max(layout.marginTopPx, originY + dy))
  }

  return {
    applyFaFloatingWindowTitleDragFromPointer
  }
}
