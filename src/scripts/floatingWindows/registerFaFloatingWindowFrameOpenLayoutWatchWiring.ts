import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/types/I_useFaFloatingWindowFrameOptions'
import type { T_registerFaFloatingWindowFrameOpenLayoutWatchDeps } from 'app/types/I_registerFaFloatingWindowFrameOpenLayoutWatch'

import { persistedFloatingWindowFramesAreEquivalent } from './faFloatingWindowPersistedGeometry_manager'

function persistedFrameGeometryUnchanged (
  previousFrame: unknown,
  nextFrame: unknown
): boolean {
  if (nextFrame === null || nextFrame === undefined) {
    return previousFrame === null || previousFrame === undefined
  }
  return persistedFloatingWindowFramesAreEquivalent(
    previousFrame,
    nextFrame as I_faFloatingWindowPersistedRect
  )
}

export function registerFaFloatingWindowFrameOpenLayoutWatch (
  deps: T_registerFaFloatingWindowFrameOpenLayoutWatchDeps,
  opts: {
    attachResizeObserver: () => void
    layout: I_FaFloatingWindowFrameLayout
    options: I_UseFaFloatingWindowFrameOptions
    raiseZ: () => void
    teardownResizeObserver: () => void
    visible: I_ref<boolean>
    x: I_ref<number>
    y: I_ref<number>
    w: I_ref<number>
    h: I_ref<number>
  }
): void {
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

  async function layoutFromPersistedStorageOrViewportCenter (): Promise<void> {
    const pf = options.persistedFrame?.value
    if (
      pf !== null &&
      pf !== undefined &&
      deps.isUsableFaFloatingWindowPersistedRect(pf, layout)
    ) {
      const clamped = deps.clampFaFloatingWindowFrameToViewport(
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
      deps.centerFloatingWindowFrameInViewport(layout, x, y, w, h)
    }
    raiseZ()
    await deps.nextTick()
    attachResizeObserver()
  }

  deps.watch(
    visible,
    async (isOpen) => {
      if (!isOpen) {
        teardownResizeObserver()
        return
      }
      await layoutFromPersistedStorageOrViewportCenter()
    }
  )

  const persistedFrameRef = options.persistedFrame
  if (persistedFrameRef !== undefined) {
    deps.watch(
      persistedFrameRef,
      async (nextFrame: unknown, previousFrame?: unknown) => {
        if (!visible.value) {
          return
        }
        if (persistedFrameGeometryUnchanged(previousFrame, nextFrame)) {
          return
        }
        await layoutFromPersistedStorageOrViewportCenter()
      }
    )
  }
}
