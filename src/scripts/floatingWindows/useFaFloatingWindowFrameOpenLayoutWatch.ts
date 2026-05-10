import { nextTick, watch, type Ref } from 'vue'

import { clampFaFloatingWindowFrameToViewport } from 'app/src/scripts/floatingWindows/faFloatingWindowResizeClamp'
import type { I_FaFloatingWindowFrameLayout } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameLayout'
import { centerFloatingWindowFrameInViewport } from 'app/src/scripts/floatingWindows/faFloatingWindowFrameCenterInViewport'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFrameOptions'
import { isUsableFaFloatingWindowPersistedRect } from 'app/src/scripts/floatingWindows/faFloatingWindowPersistedGeometry'

export function registerFaFloatingWindowFrameOpenLayoutWatch (opts: {
  attachResizeObserver: () => void
  layout: I_FaFloatingWindowFrameLayout
  options: I_UseFaFloatingWindowFrameOptions
  raiseZ: () => void
  teardownResizeObserver: () => void
  visible: Ref<boolean>
  x: Ref<number>
  y: Ref<number>
  w: Ref<number>
  h: Ref<number>
}): void {
  const {
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
  } = opts

  watch(
    visible,
    async (isOpen) => {
      if (!isOpen) {
        teardownResizeObserver()
        return
      }
      const pf = options.persistedFrame?.value
      if (isUsableFaFloatingWindowPersistedRect(pf, layout)) {
        const clamped = clampFaFloatingWindowFrameToViewport(
          layout,
          {
            innerHeight: window.innerHeight,
            innerWidth: window.innerWidth
          },
          {
            h: pf.height,
            w: pf.width,
            x: pf.x,
            y: pf.y
          }
        )
        x.value = clamped.x
        y.value = clamped.y
        w.value = clamped.w
        h.value = clamped.h
      } else {
        centerFloatingWindowFrameInViewport(layout, x, y, w, h)
      }
      raiseZ()
      await nextTick()
      attachResizeObserver()
    }
  )
}
