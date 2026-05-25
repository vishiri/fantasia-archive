import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'

/**
 * Debounced persistence of floating window text content (silent; failures surface through the action manager).
 */
export function useFaFloatingWindowTextPersist (opts: {
  debounceMs?: number
  failureActionId: T_faActionId
  persistText: () => Promise<void>
  text: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const debounceMs = opts.debounceMs ?? 380

  async function persistTextNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await opts.persistText()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction(opts.failureActionId, { message })
    }
  }

  const schedulePersist = debounce(() => {
    void persistTextNow()
  }, debounceMs)

  watch(
    opts.text,
    () => {
      if (!opts.windowModel.value) {
        return
      }
      schedulePersist()
    }
  )

  watch(
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
