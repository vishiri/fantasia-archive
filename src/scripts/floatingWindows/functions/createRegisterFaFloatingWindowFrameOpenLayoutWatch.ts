import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { I_UseFaFloatingWindowFrameOptions } from 'app/types/I_useFaFloatingWindowFrameOptions'
import type {
  T_registerFaFloatingWindowFrameOpenLayoutWatchDeps,
  T_registerFaFloatingWindowFrameOpenLayoutWatchFn
} from 'app/types/I_registerFaFloatingWindowFrameOpenLayoutWatch'

export function createRegisterFaFloatingWindowFrameOpenLayoutWatch (
  deps: T_registerFaFloatingWindowFrameOpenLayoutWatchDeps & {
    registerFaFloatingWindowFrameOpenLayoutWatchImpl: T_registerFaFloatingWindowFrameOpenLayoutWatchFn
  }
): {
    registerFaFloatingWindowFrameOpenLayoutWatch: (opts: {
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
    }) => void
  } {
  const layoutDeps: T_registerFaFloatingWindowFrameOpenLayoutWatchDeps = {
    centerFloatingWindowFrameInViewport: deps.centerFloatingWindowFrameInViewport,
    clampFaFloatingWindowFrameToViewport: deps.clampFaFloatingWindowFrameToViewport,
    isUsableFaFloatingWindowPersistedRect: deps.isUsableFaFloatingWindowPersistedRect,
    nextTick: deps.nextTick,
    watch: deps.watch
  }

  return {
    registerFaFloatingWindowFrameOpenLayoutWatch: (opts) => deps.registerFaFloatingWindowFrameOpenLayoutWatchImpl(
      layoutDeps,
      opts
    )
  }
}
