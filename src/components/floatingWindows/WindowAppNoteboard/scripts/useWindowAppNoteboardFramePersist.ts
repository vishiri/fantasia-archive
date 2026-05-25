import type { Ref } from 'vue'

import { useFaFloatingWindowFramePersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFramePersist'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

/**
 * Debounced persistence of the app noteboard floating window frame (silent; no success toast).
 */
export function useWindowAppNoteboardFramePersist (opts: {
  h: Ref<number>
  windowModel: Ref<boolean>
  w: Ref<number>
  x: Ref<number>
  y: Ref<number>
}): void {
  const noteboard = S_FaAppNoteboard()

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportAppNoteboardSaveFailure',
    h: opts.h,
    persistFrame: async () => {
      await noteboard.persistNoteboardPartialSilent({
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
