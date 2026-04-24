import { onUnmounted, ref, type Ref } from 'vue'

import { FaFloatingWindowTitleDragPointerSession } from 'app/src/scripts/floatingWindows/faFloatingWindowTitleDragPointerSession'
import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

/**
 * Pointer-drag on the title row for 'useFaFloatingWindowFrame'. Exposes 'isDragActive' so a ResizeObserver can skip syncing while the user moves the window.
 * Pointer moves are applied at most once per animation frame so Vue + heavy children (e.g. Monaco automaticLayout) are not thrashed by high-frequency pointer events (same pattern as resize: `FaFloatingWindowResizePointerSession`).
 */
export function useFaFloatingWindowTitleDrag (
  layout: I_FaFloatingWindowFrameLayout,
  x: Ref<number>,
  y: Ref<number>,
  w: Ref<number>,
  h: Ref<number>,
  raiseZ: () => void
):
  {
    isDragActive: Ref<boolean>
    onTitlePointerDown: (e: PointerEvent) => void
  } {
  const isDragActive = ref(false)
  const session = new FaFloatingWindowTitleDragPointerSession(layout, x, y, w, h, raiseZ, isDragActive)

  onUnmounted(() => {
    session.dispose()
  })

  return {
    isDragActive,
    onTitlePointerDown: session.onTitlePointerDown.bind(session)
  }
}
