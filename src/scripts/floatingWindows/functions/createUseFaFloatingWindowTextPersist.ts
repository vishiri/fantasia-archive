import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createUseFaFloatingWindowTextPersist (deps: {
  debounce: <T extends (...args: never[]) => void>(
    fn: T,
    wait: number
  ) => T & { flush: () => void }
  runFaAction: (id: T_faActionId, payload: { message: string }) => void
  watch: (
    source: I_ref<string> | (() => boolean),
    effect: (open?: boolean, wasOpen?: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}): (opts: {
    debounceMs?: number | undefined
    failureActionId: T_faActionId
    persistText: () => Promise<void>
    text: I_ref<string>
    windowModel: I_ref<boolean>
  }) => void {
  return function useFaFloatingWindowTextPersist (opts) {
    const debounceMs = opts.debounceMs ?? 380

    async function persistTextNow (): Promise<void> {
      if (!opts.windowModel.value) {
        return
      }
      try {
        await opts.persistText()
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void deps.runFaAction(opts.failureActionId, { message })
      }
    }

    const schedulePersist = deps.debounce(() => {
      void persistTextNow()
    }, debounceMs)

    deps.watch(
      opts.text,
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
          void persistTextNow()
        }
      },
      { immediate: true }
    )
  }
}
