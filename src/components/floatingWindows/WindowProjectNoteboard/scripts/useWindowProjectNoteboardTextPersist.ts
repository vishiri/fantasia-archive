import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

/**
 * Debounced persistence of project noteboard text (silent; failures surface through the action manager).
 */
export function useWindowProjectNoteboardTextPersist (opts: {
  text: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const noteboard = S_FaProjectNoteboard()

  async function persistTextNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await noteboard.persistCurrentTextSilent()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction('reportProjectNoteboardSaveFailure', { message })
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
