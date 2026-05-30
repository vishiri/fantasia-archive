import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { I_FaFloatingWindowFrameLayout } from 'app/types/I_faFloatingWindowFrameLayout'

export function createUseFaFloatingWindowTitleDrag (deps: {
  FaFloatingWindowTitleDragPointerSession: new (
    layout: I_FaFloatingWindowFrameLayout,
    x: I_ref<number>,
    y: I_ref<number>,
    w: I_ref<number>,
    h: I_ref<number>,
    raiseZ: () => void,
    isDragActive: I_ref<boolean>
  ) => {
    dispose: () => void
    onTitlePointerDown: (e: PointerEvent) => void
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
    isDragActive: I_ref<boolean>
    onTitlePointerDown: (e: PointerEvent) => void
  } {
  return function useFaFloatingWindowTitleDrag (
    layout,
    x,
    y,
    w,
    h,
    raiseZ
  ) {
    const isDragActive = deps.ref(false)
    const session = new deps.FaFloatingWindowTitleDragPointerSession(
      layout,
      x,
      y,
      w,
      h,
      raiseZ,
      isDragActive
    )

    deps.onUnmounted(() => {
      session.dispose()
    })

    const onTitlePointerDown = session.onTitlePointerDown.bind(session)

    return {
      isDragActive,
      onTitlePointerDown
    }
  }
}
