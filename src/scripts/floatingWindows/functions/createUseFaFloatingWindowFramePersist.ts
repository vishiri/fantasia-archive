import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { T_faActionId } from 'app/types/I_faActionManagerDomain'

export function createUseFaFloatingWindowFramePersist (deps: {
  debounce: <T extends (...args: never[]) => void>(
    fn: T,
    wait: number
  ) => T & { flush: () => void }
  runFaAction: (id: T_faActionId, payload: { message: string }) => void
  watch: (
    source: I_ref<number>[] | (() => boolean),
    effect: (open?: boolean, wasOpen?: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}): (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    h: I_ref<number>
    persistFrame: () => Promise<void>
    windowModel: I_ref<boolean>
    w: I_ref<number>
    x: I_ref<number>
    y: I_ref<number>
  }) => void {
  return function useFaFloatingWindowFramePersist (opts) {
    const debounceMs = opts.debounceMs ?? 280

    async function persistFrameNow (): Promise<void> {
      if (!opts.windowModel.value) {
        return
      }
      try {
        await opts.persistFrame()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void deps.runFaAction(opts.failureActionId, { message })
      }
    }

    const schedulePersist = deps.debounce(() => {
      void persistFrameNow()
    }, debounceMs)

    deps.watch(
      [
        opts.x,
        opts.y,
        opts.w,
        opts.h
      ],
      () => {
        if (!opts.windowModel.value) {
          return
        }
        schedulePersist()
      }
    )

    deps.watch(
      () => opts.windowModel.value,
      (open, wasOpen) => {
        if (!open && wasOpen) {
          schedulePersist.flush()
          void persistFrameNow()
        }
      },
      { immediate: true }
    )
  }
}
