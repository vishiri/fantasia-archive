import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/types/I_useFaFloatingWindowFrameOptions'

export type T_registerFaFloatingWindowFrameOpenLayoutWatchDeps = {
  centerFloatingWindowFrameInViewport: (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>
  ) => void
  clampFaFloatingWindowFrameToViewport: (
    layout: I_FaFloatingWindowFrameLayout,
    viewport: { innerHeight: number, innerWidth: number },
    rect: { h: number, w: number, x: number, y: number }
  ) => { h: number, w: number, x: number, y: number }
  isUsableFaFloatingWindowPersistedRect: (
    rect: unknown,
    layout: I_FaFloatingWindowFrameLayout
  ) => boolean
  nextTick: () => Promise<void>
  watch: (
    source: I_ref<boolean> | I_ref<unknown>,
    effect: (value: boolean) => void | Promise<void>
  ) => void
}

export type T_registerFaFloatingWindowFrameOpenLayoutWatchFn = (
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
) => void
