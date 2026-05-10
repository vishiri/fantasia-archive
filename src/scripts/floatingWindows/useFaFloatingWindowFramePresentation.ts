import { computed, type ComputedRef, type CSSProperties, type Ref } from 'vue'

import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import {
  FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX,
  FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS
} from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameConstants'

export function useFaFloatingWindowFramePresentation (opts: {
  h: Ref<number>
  layout: I_FaFloatingWindowFrameLayout
  raiseZ: () => void
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
  z: Ref<number>
}): {
    frameStyle: ComputedRef<CSSProperties>
    onFramePointerDown: () => void
    titleShortFrameClass: ComputedRef<string | undefined>
  } {
  const { h, layout, raiseZ, w, x, y, z } = opts

  function onFramePointerDown (): void {
    raiseZ()
  }

  const frameStyle = computed((): CSSProperties => ({
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

  const titleShortFrameClass = computed(() =>
    h.value < FA_FLOATING_WINDOW_TITLE_COMPACT_VERTICAL_THRESHOLD_PX
      ? FA_FLOATING_WINDOW_TITLE_SHORT_FRAME_CLASS
      : undefined
  )

  return {
    frameStyle,
    onFramePointerDown,
    titleShortFrameClass
  }
}
