import type { I_UseFaFloatingWindowFrameOptions } from 'app/types/I_useFaFloatingWindowFrameOptions'
import type { I_ref } from 'app/types/I_vueCompositionShims'

export function bumpZSelectorForFloatingWindowLayer (
  deps: {
    bumpFloatingWindowZIndex: () => number
    bumpNoteboardFloatingWindowZIndex: () => number
    bumpProjectNoteboardFloatingWindowZIndex: () => number
    bumpProjectStylingFloatingWindowZIndex: () => number
  },
  layer: I_UseFaFloatingWindowFrameOptions['floatingWindowZLayer']
): () => number {
  const resolvedFloatingLayer = layer ?? 'standard'
  if (resolvedFloatingLayer === 'noteboard') {
    return deps.bumpNoteboardFloatingWindowZIndex
  }
  if (resolvedFloatingLayer === 'projectNoteboard') {
    return deps.bumpProjectNoteboardFloatingWindowZIndex
  }
  if (resolvedFloatingLayer === 'projectStyling') {
    return deps.bumpProjectStylingFloatingWindowZIndex
  }
  return deps.bumpFloatingWindowZIndex
}

export function teardownFaFloatingWindowResizeObserver (
  resizeObserver: ResizeObserver | null
): null {
  if (resizeObserver !== null) {
    resizeObserver.disconnect()
  }
  return null
}

export function attachFaFloatingWindowResizeObserver (params: {
  frameRef: I_ref<HTMLElement | null>
  isDragActive: I_ref<boolean>
  isResizeActive: I_ref<boolean>
  w: I_ref<number>
  h: I_ref<number>
  resizeObserver: ResizeObserver | null
}): ResizeObserver | null {
  const observerState = teardownFaFloatingWindowResizeObserver(params.resizeObserver)
  const el = params.frameRef.value
  if (el === null) {
    return observerState
  }
  const resizeObserver = new ResizeObserver(() => {
    const node = params.frameRef.value
    if (node === null || params.isDragActive.value || params.isResizeActive.value) {
      return
    }
    const rw = node.offsetWidth
    const rh = node.offsetHeight
    if (rw > 0) {
      params.w.value = rw
    }
    if (rh > 0) {
      params.h.value = rh
    }
  })
  resizeObserver.observe(el)
  return resizeObserver
}
