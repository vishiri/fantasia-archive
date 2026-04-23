import { onUnmounted, ref, type Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import {
  computeFaFloatingWindowResizeFrame,
  type T_faFloatingWindowResizeEdge
} from 'app/src/scripts/floatingWindows/faFloatingWindowResizeGeometry'

export type { T_faFloatingWindowResizeEdge }

/**
 * Pointer-driven resize for 'useFaFloatingWindowFrame' (edges + corners). Sets 'isResizeActive' while dragging so ResizeObserver can skip syncing.
 */
export function useFaFloatingWindowResize (
  layout: I_FaFloatingWindowFrameLayout,
  x: Ref<number>,
  y: Ref<number>,
  w: Ref<number>,
  h: Ref<number>,
  raiseZ: () => void
): {
    isResizeActive: Ref<boolean>
    onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  } {
  const isResizeActive = ref(false)
  let resizePointerId: number | null = null
  let activeEdge: T_faFloatingWindowResizeEdge | null = null
  let startCx = 0
  let startCy = 0
  let originX = 0
  let originY = 0
  let originW = 0
  let originH = 0

  function removeWindowListeners (): void {
    window.removeEventListener('pointermove', onResizeMove)
    window.removeEventListener('pointerup', onResizeEnd)
    window.removeEventListener('pointercancel', onResizeEnd)
  }

  function onResizeMove (e: PointerEvent): void {
    if (resizePointerId === null || e.pointerId !== resizePointerId || activeEdge === null) {
      return
    }
    const deltaX = e.clientX - startCx
    const deltaY = e.clientY - startCy
    const viewport = {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    }
    const next = computeFaFloatingWindowResizeFrame(
      layout,
      viewport,
      activeEdge,
      {
        x: originX,
        y: originY,
        w: originW,
        h: originH
      },
      deltaX,
      deltaY
    )
    x.value = next.x
    y.value = next.y
    w.value = next.w
    h.value = next.h
  }

  function onResizeEnd (e: PointerEvent): void {
    if (resizePointerId === null || e.pointerId !== resizePointerId) {
      return
    }
    resizePointerId = null
    activeEdge = null
    isResizeActive.value = false
    removeWindowListeners()
  }

  function onResizePointerDown (edge: T_faFloatingWindowResizeEdge, e: PointerEvent): void {
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    e.stopPropagation()
    raiseZ()
    isResizeActive.value = true
    activeEdge = edge
    resizePointerId = e.pointerId
    startCx = e.clientX
    startCy = e.clientY
    originX = x.value
    originY = y.value
    originW = w.value
    originH = h.value
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', onResizeMove)
    window.addEventListener('pointerup', onResizeEnd)
    window.addEventListener('pointercancel', onResizeEnd)
  }

  onUnmounted(() => {
    removeWindowListeners()
  })

  return {
    isResizeActive,
    onResizePointerDown
  }
}
