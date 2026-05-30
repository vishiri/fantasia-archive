import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/types/I_useFaFloatingWindowFrameOptions'
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

interface I_cssPropertiesLike {
  height?: string
  left?: string
  minHeight?: string
  minWidth?: string
  overflow?: string
  position?: string
  top?: string
  width?: string
  zIndex?: number
}

type T_createUseFaFloatingWindowFrameDeps = {
  attachFaFloatingWindowResizeObserver: (params: {
    frameRef: I_ref<HTMLElement | null>
    h: I_ref<number>
    isDragActive: I_ref<boolean>
    isResizeActive: I_ref<boolean>
    resizeObserver: ResizeObserver | null
    w: I_ref<number>
  }) => ResizeObserver | null
  bumpZSelectorForFloatingWindowLayer: (
    deps: {
      bumpFloatingWindowZIndex: () => number
      bumpNoteboardFloatingWindowZIndex: () => number
      bumpProjectNoteboardFloatingWindowZIndex: () => number
      bumpProjectStylingFloatingWindowZIndex: () => number
    },
    layer: I_UseFaFloatingWindowFrameOptions['floatingWindowZLayer']
  ) => () => number
  FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT: I_FaFloatingWindowFrameLayout
  bumpFloatingWindowZIndex: () => number
  bumpNoteboardFloatingWindowZIndex: () => number
  bumpProjectNoteboardFloatingWindowZIndex: () => number
  bumpProjectStylingFloatingWindowZIndex: () => number
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  registerFaFloatingWindowFrameOpenLayoutWatch: (opts: {
    attachResizeObserver: () => void
    h: I_ref<number>
    layout: I_FaFloatingWindowFrameLayout
    options: I_UseFaFloatingWindowFrameOptions
    raiseZ: () => void
    teardownResizeObserver: () => void
    visible: I_ref<boolean>
    w: I_ref<number>
    x: I_ref<number>
    y: I_ref<number>
  }) => void
  useFaFloatingWindowFramePresentation: (opts: {
    h: I_ref<number>
    layout: I_FaFloatingWindowFrameLayout
    raiseZ: () => void
    w: I_ref<number>
    x: I_ref<number>
    y: I_ref<number>
    z: I_ref<number>
  }) => {
    frameStyle: I_computedRef<I_cssPropertiesLike>
    onFramePointerDown: () => void
    titleShortFrameClass: I_computedRef<string | undefined>
  }
  useFaFloatingWindowResize: (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>,
    raiseZ: () => void
  ) => {
    isResizeActive: I_ref<boolean>
    onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  }
  useFaFloatingWindowTitleDrag: (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>,
    raiseZ: () => void
  ) => {
    isDragActive: I_ref<boolean>
    onTitlePointerDown: (e: PointerEvent) => void
  }
  teardownFaFloatingWindowResizeObserver: (resizeObserver: ResizeObserver | null) => null
}

type T_useFaFloatingWindowFrameReturn = {
  frameRef: I_ref<HTMLElement | null>
  frameStyle: I_computedRef<I_cssPropertiesLike>
  h: I_ref<number>
  isDragActive: I_ref<boolean>
  isResizeActive: I_ref<boolean>
  onFramePointerDown: () => void
  onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  onTitlePointerDown: (e: PointerEvent) => void
  titleShortFrameClass: I_computedRef<string | undefined>
  w: I_ref<number>
  x: I_ref<number>
  y: I_ref<number>
}

function useFaFloatingWindowFrame (
  deps: T_createUseFaFloatingWindowFrameDeps,
  visible: I_ref<boolean>,
  layout: I_FaFloatingWindowFrameLayout,
  options: I_UseFaFloatingWindowFrameOptions
): T_useFaFloatingWindowFrameReturn {
  const bumpZ = deps.bumpZSelectorForFloatingWindowLayer(deps, options.floatingWindowZLayer)
  const frameRef = deps.ref<HTMLElement | null>(null)
  const x = deps.ref(0)
  const y = deps.ref(0)
  const w = deps.ref(800)
  const h = deps.ref(600)
  const z = deps.ref(bumpZ())
  let resizeObserver: ResizeObserver | null = null

  const raiseZ = (): void => {
    z.value = bumpZ()
  }

  const { isDragActive, onTitlePointerDown } = deps.useFaFloatingWindowTitleDrag(layout, x, y, w, h, raiseZ)
  const { isResizeActive, onResizePointerDown } = deps.useFaFloatingWindowResize(layout, x, y, w, h, raiseZ)

  const attachResizeObserver = (): void => {
    resizeObserver = deps.attachFaFloatingWindowResizeObserver({
      frameRef,
      h,
      isDragActive,
      isResizeActive,
      resizeObserver,
      w
    })
  }

  deps.registerFaFloatingWindowFrameOpenLayoutWatch({
    attachResizeObserver,
    h,
    layout,
    options,
    raiseZ,
    teardownResizeObserver: () => {
      resizeObserver = deps.teardownFaFloatingWindowResizeObserver(resizeObserver)
    },
    visible,
    w,
    x,
    y
  })

  const { frameStyle, onFramePointerDown, titleShortFrameClass } = deps.useFaFloatingWindowFramePresentation({
    h,
    layout,
    raiseZ,
    w,
    x,
    y,
    z
  })

  deps.onUnmounted(() => {
    resizeObserver = deps.teardownFaFloatingWindowResizeObserver(resizeObserver)
  })

  return {
    frameRef,
    frameStyle,
    h,
    isDragActive,
    isResizeActive,
    onFramePointerDown,
    onResizePointerDown,
    onTitlePointerDown,
    titleShortFrameClass,
    w,
    x,
    y
  }
}

export function createUseFaFloatingWindowFrame (deps: T_createUseFaFloatingWindowFrameDeps): {
  useFaFloatingWindowFrame: (
    visible: I_ref<boolean>,
    layout?: I_FaFloatingWindowFrameLayout,
    options?: I_UseFaFloatingWindowFrameOptions
  ) => T_useFaFloatingWindowFrameReturn
} {
  const useFaFloatingWindowFrameBinding = (
    visible: I_ref<boolean>,
    layout: I_FaFloatingWindowFrameLayout = deps.FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT,
    options: I_UseFaFloatingWindowFrameOptions = {}
  ): T_useFaFloatingWindowFrameReturn => {
    return useFaFloatingWindowFrame(deps, visible, layout, options)
  }

  return {
    useFaFloatingWindowFrame: useFaFloatingWindowFrameBinding
  }
}
