import { watch, type Ref } from 'vue'

import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'

import debounce from 'lodash-es/debounce'

/**
 * Debounced persistence of Monaco CSS drafts into the active project's SQLite KV.
 */
export function useWindowProjectStylingCssPersist (opts: {
  css: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const styling = S_FaProjectStyling()

  async function persistCssNow (): Promise<void> {
    if (!opts.windowModel.value) {
      return
    }
    try {
      await styling.persistProjectStylingPartialSilent({ css: opts.css.value })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      void runFaAction('reportProjectStylingSaveFailure', { message })
    }
  }

  const schedulePersist = debounce(() => {
    void persistCssNow()
  }, 380)

  watch(
    opts.css,
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
        void persistCssNow()
      }
    },
    {
      immediate: true
    }
  )
}
