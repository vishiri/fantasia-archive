import { onUnmounted, ref, type Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'

/**
 * Pointer-drag on the title row for 'useFaFloatingWindowFrame'. Exposes 'isDragActive' so a ResizeObserver can skip syncing while the user moves the window.
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
  let dragPointerId: number | null = null
  let dragStartX = 0
  let dragStartY = 0
  let originX = 0
  let originY = 0

  function removeWindowListeners (): void {
    window.removeEventListener('pointermove', onDragMove)
    window.removeEventListener('pointerup', onDragEnd)
    window.removeEventListener('pointercancel', onDragEnd)
  }

  function onDragMove (e: PointerEvent): void {
    if (dragPointerId === null || e.pointerId !== dragPointerId) {
      return
    }
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

  function onDragEnd (e: PointerEvent): void {
    if (dragPointerId === null || e.pointerId !== dragPointerId) {
      return
    }
    dragPointerId = null
    isDragActive.value = false
    removeWindowListeners()
  }

  function onTitlePointerDown (e: PointerEvent): void {
    if (e.button !== 0) {
      return
    }
    e.preventDefault()
    isDragActive.value = true
    dragPointerId = e.pointerId
    dragStartX = e.clientX
    dragStartY = e.clientY
    originX = x.value
    originY = y.value
    raiseZ()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', onDragMove)
    window.addEventListener('pointerup', onDragEnd)
    window.addEventListener('pointercancel', onDragEnd)
  }

  onUnmounted(() => {
    removeWindowListeners()
  })

  return {
    isDragActive,
    onTitlePointerDown
  }
}
