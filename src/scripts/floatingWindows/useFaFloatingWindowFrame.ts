import { onUnmounted, ref, type ComputedRef, type CSSProperties, type Ref } from 'vue'
import {
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  type I_FaFloatingWindowFrameLayout
} from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { registerFaFloatingWindowFrameOpenLayoutWatch } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameOpenLayoutWatch'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameOptions'
import { useFaFloatingWindowFramePresentation } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFramePresentation'
import {
  bumpFloatingWindowZIndex,
  bumpNoteboardFloatingWindowZIndex,
  bumpProjectNoteboardFloatingWindowZIndex,
  bumpProjectStylingFloatingWindowZIndex
} from 'app/src/scripts/floatingWindows/faFloatingWindowZIndex'
import { useFaFloatingWindowResize } from 'app/src/scripts/floatingWindows/useFaFloatingWindowResize'
import { useFaFloatingWindowTitleDrag } from 'app/src/scripts/floatingWindows/useFaFloatingWindowTitleDrag'

export type { I_FaFloatingWindowFrameLayout }

export type { I_UseFaFloatingWindowFrameOptions } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameOptions'

export {
  FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX,
  FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS
} from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameConstants'

export { centerFloatingWindowFrameInViewport } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameCenterInViewport'

function bumpZSelectorForFloatingWindowLayer (
  layer: I_UseFaFloatingWindowFrameOptions['floatingWindowZLayer']
): typeof bumpFloatingWindowZIndex {
  const resolvedFloatingLayer = layer ?? 'standard'
  if (resolvedFloatingLayer === 'noteboard') {
    return bumpNoteboardFloatingWindowZIndex
  }
  if (resolvedFloatingLayer === 'projectNoteboard') {
    return bumpProjectNoteboardFloatingWindowZIndex
  }
  if (resolvedFloatingLayer === 'projectStyling') {
    return bumpProjectStylingFloatingWindowZIndex
  }
  return bumpFloatingWindowZIndex
}

/**
 * Draggable, resizable fixed-position frame for in-renderer floating windows (Vue 3 + Quasar 2).
 * The published '@quasar/quasar-ui-qwindow' targets Quasar v1 / Vue 2 only, so Fantasia Archive ships this composable instead.
 */
export function useFaFloatingWindowFrame (
  visible: Ref<boolean>,
  layout: I_FaFloatingWindowFrameLayout = FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
  options: I_UseFaFloatingWindowFrameOptions = {}
) {
  const bumpZ = bumpZSelectorForFloatingWindowLayer(options.floatingWindowZLayer)

  const frameRef = ref<HTMLElement | null>(null)
  const x = ref(0)
  const y = ref(0)
  const w = ref(800)
  const h = ref(600)
  const z = ref(bumpZ())

  let resizeObserver: ResizeObserver | null = null

  function raiseZ (): void {
    z.value = bumpZ()
  }

  function teardownResizeObserver (): void {
    if (resizeObserver !== null) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  const { isDragActive, onTitlePointerDown } = useFaFloatingWindowTitleDrag(layout, x, y, w, h, raiseZ)
  const { isResizeActive, onResizePointerDown } = useFaFloatingWindowResize(layout, x, y, w, h, raiseZ)

  function attachResizeObserver (): void {
    teardownResizeObserver()
    const el = frameRef.value
    if (el === null) {
      return
    }
    resizeObserver = new ResizeObserver(() => {
      const node = frameRef.value
      if (node === null || isDragActive.value || isResizeActive.value) {
        return
      }
      const rw = node.offsetWidth
      const rh = node.offsetHeight
      if (rw > 0) {
        w.value = rw
      }
      if (rh > 0) {
        h.value = rh
      }
    })
    resizeObserver.observe(el)
  }

  registerFaFloatingWindowFrameOpenLayoutWatch({
    attachResizeObserver,
    h,
    layout,
    options,
    raiseZ,
    teardownResizeObserver,
    visible,
    w,
    x,
    y
  })

  const { frameStyle, onFramePointerDown, titleShortFrameClass } = useFaFloatingWindowFramePresentation({
    h,
    layout,
    raiseZ,
    w,
    x,
    y,
    z
  })

  onUnmounted(() => {
    teardownResizeObserver()
  })

  const frameRefOut = frameRef
  const frameStyleOut = frameStyle as ComputedRef<CSSProperties>
  const onResizePointerDownOut = onResizePointerDown
  const onTitlePointerDownOut = onTitlePointerDown
  const titleShortFrameClassOut = titleShortFrameClass
  const isDragActiveOut = isDragActive
  const isResizeActiveOut = isResizeActive
  const xOut = x
  const yOut = y
  const wOut = w
  const hOut = h

  return {
    frameRef: frameRefOut,
    frameStyle: frameStyleOut,
    h: hOut,
    isDragActive: isDragActiveOut,
    isResizeActive: isResizeActiveOut,
    onFramePointerDown,
    onResizePointerDown: onResizePointerDownOut,
    onTitlePointerDown: onTitlePointerDownOut,
    /** Optional BEM class for `h5.floatingWindowComponent__title` when the frame is short; ignore on surfaces with no title row. */
    titleShortFrameClass: titleShortFrameClassOut,
    w: wOut,
    x: xOut,
    y: yOut
  }
}
