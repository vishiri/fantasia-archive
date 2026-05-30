import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

interface I_faFloatingWindowFrameLayoutLike {
  minHeightPx: number
  minWidthPx: number
}

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

export function createUseFaFloatingWindowFramePresentation (deps: {
  FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX: number
  FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS: string
  computed: <T>(getter: () => T) => I_computedRef<T>
}): (opts: {
    h: I_ref<number>
    layout: I_faFloatingWindowFrameLayoutLike
    raiseZ: () => void
    w: I_ref<number>
    x: I_ref<number>
    y: I_ref<number>
    z: I_ref<number>
  }) => {
    frameStyle: I_computedRef<I_cssPropertiesLike>
    onFramePointerDown: () => void
    titleShortFrameClass: I_computedRef<string | undefined>
  } {
  return function useFaFloatingWindowFramePresentation (opts) {
    const { h, layout, raiseZ, w, x, y, z } = opts

    function onFramePointerDown (): void {
      raiseZ()
    }

    const frameStyle = deps.computed((): I_cssPropertiesLike => ({
      height: `${h.value}px`,
      left: `${x.value}px`,
      minHeight: `${layout.minHeightPx}px`,
      minWidth: `${layout.minWidthPx}px`,
      overflow: 'hidden',
      position: 'fixed',
      top: `${y.value}px`,
      width: `${w.value}px`,
      zIndex: z.value
    }))

    const titleShortFrameClass = deps.computed(() =>
      h.value < deps.FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX
        ? deps.FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS
        : undefined
    )

    return {
      frameStyle,
      onFramePointerDown,
      titleShortFrameClass
    }
  }
}
