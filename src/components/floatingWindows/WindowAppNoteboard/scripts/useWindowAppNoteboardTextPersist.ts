import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

/**
 * Debounced persistence of note text (silent; failures surface through the action manager).
 */
export function useWindowAppNoteboardTextPersist (opts: {
  text: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const noteboard = S_FaAppNoteboard()

  async function persistTextNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await noteboard.persistCurrentTextSilent()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction('reportAppNoteboardSaveFailure', { message })
    }
  }

  const schedulePersist = debounce(() => {
    void persistTextNow()
  }, 380)

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
