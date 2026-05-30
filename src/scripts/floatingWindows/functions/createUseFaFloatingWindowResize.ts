import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'
import type { T_faFloatingWindowResizeEdge } from 'app/types/I_faFloatingWindowResize'

export function createUseFaFloatingWindowResize (deps: {
  FaFloatingWindowResizePointerSession: new (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>,
    raiseZ: () => void,
    isResizeActive: I_ref<boolean>
  ) => {
    dispose: () => void
    onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  }
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
}): (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>,
    raiseZ: () => void
  ) => {
    isResizeActive: I_ref<boolean>
    onResizePointerDown: (edge: T_faFloatingWindowResizeEdge, e: PointerEvent) => void
  } {
  return function useFaFloatingWindowResize (
    layout,
    x,
    y,
    w,
    h,
    raiseZ
  ) {
    const isResizeActive = deps.ref(false)
    const session = new deps.FaFloatingWindowResizePointerSession(
      layout,
      x,
      y,
      w,
      h,
      raiseZ,
      isResizeActive
    )

    deps.onUnmounted(() => {
      session.dispose()
    })

    const onResizePointerDown = session.onResizePointerDown.bind(session)

    return {
      isResizeActive,
      onResizePointerDown
    }
  }
}
