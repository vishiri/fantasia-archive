import type { Ref } from 'vue'

import { useFaFloatingWindowFramePersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFramePersist'
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

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportProjectStylingSaveFailure',
    h: opts.h,
    persistFrame: async () => {
      await styling.persistProjectStylingPartialSilent({
        frame: {
          height: opts.h.value,
          width: opts.w.value,
          x: opts.x.value,
          y: opts.y.value
        }
      })
    },
    w: opts.w,
    windowModel: opts.windowModel,
    x: opts.x,
    y: opts.y
  })
}
