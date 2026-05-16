import debounce from 'lodash-es/debounce'
import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

/**
 * Debounced persistence of the project Custom CSS floating window frame into SQLite KV.
 */
export function useWindowProjectStylingFramePersist (opts: {
  h: Ref<number>
  windowModel: Ref<boolean>
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
}): void {
  const styling = S_FaProjectStyling()

  async function persistFrameNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await styling.persistProjectStylingPartialSilent({
        frame: {
          height: opts.h.value,
          width: opts.w.value,
          x: opts.x.value,
          y: opts.y.value
        }
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction('reportProjectStylingSaveFailure', { message })
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
    {
      immediate: true
    }
  )
}
