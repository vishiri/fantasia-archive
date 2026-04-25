import { computed, onBeforeUnmount, ref, type ComputedRef, type Ref } from 'vue'

import type { T_faFloatingWindowResizeEdge } from 'app/src/scripts/floatingWindows/useFaFloatingWindowResize'

const HOVER_LEAVE_DEBOUNCE_MS = 50

export interface I_faFloatingWindowFrameResizeHandlesHover {
  activeHandle: ComputedRef<T_faFloatingWindowResizeEdge | null>
  beginResizeHighlight: (edge: T_faFloatingWindowResizeEdge) => void
  edgeGlow: ComputedRef<Record<'e' | 'n' | 's' | 'w', boolean>>
  onHoverEnter: (h: T_faFloatingWindowResizeEdge) => void
  onHoverLeave: () => void
  source: Ref<T_faFloatingWindowResizeEdge | null>
}

function edgeGlowFromHandle (h: T_faFloatingWindowResizeEdge): Record<'e' | 'n' | 's' | 'w', boolean> {
  return {
    e: h === 'e' || h === 'ne' || h === 'se',
    n: h === 'n' || h === 'nw' || h === 'ne',
    s: h === 's' || h === 'sw' || h === 'se',
    w: h === 'w' || h === 'nw' || h === 'sw'
  }
}

/**
 * Debounced hover source for resize handles so moving between adjacent hit targets does not flicker.
 * Corner hovers expand glow to both adjoining edges via 'edgeGlow'.
 * 'beginResizeHighlight' keeps that glow through the pointer gesture until 'pointerup' / 'pointercancel'.
 */
export function useFaFloatingWindowFrameResizeHandlesHover (): I_faFloatingWindowFrameResizeHandlesHover {
  const source = ref<T_faFloatingWindowResizeEdge | null>(null)
  const resizeLock = ref<T_faFloatingWindowResizeEdge | null>(null)
  let clearHoverId: number | null = null
  let endResizeSession: (() => void) | null = null

  function cancelScheduledClear (): void {
    if (clearHoverId !== null) {
      window.clearTimeout(clearHoverId)
      clearHoverId = null
    }
  }

  function detachResizeSessionListeners (): void {
    if (endResizeSession !== null) {
      window.removeEventListener('pointerup', endResizeSession)
      window.removeEventListener('pointercancel', endResizeSession)
      endResizeSession = null
    }
  }

  function endResizeHighlight (): void {
    resizeLock.value = null
    detachResizeSessionListeners()
  }

  function onHoverEnter (h: T_faFloatingWindowResizeEdge): void {
    cancelScheduledClear()
    source.value = h
  }

  function onHoverLeave (): void {
    cancelScheduledClear()
    clearHoverId = window.setTimeout(() => {
      clearHoverId = null
      source.value = null
    }, HOVER_LEAVE_DEBOUNCE_MS)
  }

  function beginResizeHighlight (edge: T_faFloatingWindowResizeEdge): void {
    cancelScheduledClear()
    detachResizeSessionListeners()
    resizeLock.value = edge
    endResizeSession = (): void => {
      endResizeHighlight()
    }
    window.addEventListener('pointerup', endResizeSession)
    window.addEventListener('pointercancel', endResizeSession)
  }

  const activeHandle = computed((): T_faFloatingWindowResizeEdge | null => resizeLock.value ?? source.value)

  const edgeGlow = computed((): Record<'e' | 'n' | 's' | 'w', boolean> => {
    const h = activeHandle.value
    if (h === null) {
      return {
        e: false,
        n: false,
        s: false,
        w: false
      }
    }
    return edgeGlowFromHandle(h)
  })

  onBeforeUnmount(() => {
    cancelScheduledClear()
    endResizeHighlight()
  })

  return {
    activeHandle,
    beginResizeHighlight,
    edgeGlow,
    onHoverEnter,
    onHoverLeave,
    source
  }
}
