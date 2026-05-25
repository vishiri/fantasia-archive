import type { Ref } from 'vue'

import { useFaFloatingWindowFramePersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFramePersist'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'

/**
 * Debounced persistence of the Custom app CSS floating window frame (silent; no success toast).
 */
export function useWindowAppStylingFramePersist (opts: {
  h: Ref<number>
  windowModel: Ref<boolean>
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
}): void {
  const styling = S_FaAppStyling()

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppStylingPersistFailure',
    h: opts.h,
    persistFrame: async () => {
      await styling.persistAppStylingPartialSilent({
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
