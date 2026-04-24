import { onUnmounted, ref, type Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { FaFloatingWindowResizePointerSession } from 'app/src/scripts/floatingWindows/faFloatingWindowResizePointerDrive'
import type { T_faFloatingWindowResizeEdge } from 'app/src/scripts/floatingWindows/faFloatingWindowResizeGeometry'

export type { T_faFloatingWindowResizeEdge }

/**
 * Pointer-driven resize for 'useFaFloatingWindowFrame' (edges + corners). Sets 'isResizeActive' while dragging so ResizeObserver can skip syncing.
 * Pointer moves are applied at most once per animation frame so Vue + heavy children (e.g. Monaco automaticLayout) are not thrashed by high-frequency pointer events.
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
  const session = new FaFloatingWindowResizePointerSession(layout, x, y, w, h, raiseZ, isResizeActive)

  onUnmounted(() => {
    session.dispose()
  })

  return {
    isResizeActive,
    onResizePointerDown: session.onResizePointerDown.bind(session)
  }
}
