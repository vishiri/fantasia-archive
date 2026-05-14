import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

/**
 * Debounced persistence of the project noteboard floating window frame (silent; no success toast).
 */
export function useWindowProjectNoteboardFramePersist (opts: {
  h: Ref<number>
  windowModel: Ref<boolean>
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
}): void {
  const noteboard = S_FaProjectNoteboard()

  async function persistFrameNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await noteboard.persistProjectNoteboardPartialSilent({
        frame: {
          height: opts.h.value,
          width: opts.w.value,
          x: opts.x.value,
          y: opts.y.value
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction('reportProjectNoteboardSaveFailure', { message })
    }
  }

  const schedulePersist = debounce(() => {
    void persistFrameNow()
  }, 280)

  watch(
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

  watch(
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
