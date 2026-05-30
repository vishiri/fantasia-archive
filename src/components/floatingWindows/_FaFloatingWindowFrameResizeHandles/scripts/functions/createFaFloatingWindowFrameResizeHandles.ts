/* eslint-disable max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

export function createFaFloatingWindowFrameResizeHandles (deps: {
  FA_FLOATING_WINDOW_RESIZE_HANDLE_PX: number
  computed: <T>(getter: () => T) => ComputedRef<T>
  faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle: (
    handle: T_faFloatingWindowResizeEdge
  ) => Record<'e' | 'n' | 's' | 'w', boolean>
  onBeforeUnmount: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
}): {
    useFaFloatingWindowFrameResizeHandlesChrome: () => {
      activeHandle: ComputedRef<T_faFloatingWindowResizeEdge | null>
      beginResizeHighlight: (edge: T_faFloatingWindowResizeEdge) => void
      edgeGlow: ComputedRef<Record<'e' | 'n' | 's' | 'w', boolean>>
      onHoverEnter: (h: T_faFloatingWindowResizeEdge) => void
      onHoverLeave: () => void
      rootStyle: ComputedRef<{ '--fa-fw-resize': string }>
      source: Ref<T_faFloatingWindowResizeEdge | null>
    }
    useFaFloatingWindowFrameResizeHandlesHover: () => {
      activeHandle: ComputedRef<T_faFloatingWindowResizeEdge | null>
      beginResizeHighlight: (edge: T_faFloatingWindowResizeEdge) => void
      edgeGlow: ComputedRef<Record<'e' | 'n' | 's' | 'w', boolean>>
      onHoverEnter: (h: T_faFloatingWindowResizeEdge) => void
      onHoverLeave: () => void
      source: Ref<T_faFloatingWindowResizeEdge | null>
    }
  } {
  const HOVER_LEAVE_DEBOUNCE_MS = 50

  function useFaFloatingWindowFrameResizeHandlesHover () {
    const source = deps.ref<T_faFloatingWindowResizeEdge | null>(null)
    const resizeLock = deps.ref<T_faFloatingWindowResizeEdge | null>(null)
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

    const activeHandle = deps.computed((): T_faFloatingWindowResizeEdge | null => {
      return resizeLock.value ?? source.value
    })

    const edgeGlow = deps.computed((): Record<'e' | 'n' | 's' | 'w', boolean> => {
      const h = activeHandle.value
      if (h === null) {
        return {
          e: false,
          n: false,
          s: false,
          w: false
        }
      }
      return deps.faFloatingWindowFrameResizeHandlesEdgeGlowFromHandle(h)
    })

    deps.onBeforeUnmount(() => {
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

  function useFaFloatingWindowFrameResizeHandlesChrome () {
    const hover = useFaFloatingWindowFrameResizeHandlesHover()
    const rootStyle = deps.computed(() => ({
      '--fa-fw-resize': `${deps.FA_FLOATING_WINDOW_RESIZE_HANDLE_PX}px`
    }))
    return {
      ...hover,
      rootStyle
    }
  }

  return {
    useFaFloatingWindowFrameResizeHandlesHover,
    useFaFloatingWindowFrameResizeHandlesChrome
  }
}
