import type { Ref } from 'vue'

import { useFaFloatingWindowFramePersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowFramePersist'
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

  useFaFloatingWindowFramePersist({
    failureActionId: 'reportProjectNoteboardSaveFailure',
    h: opts.h,
    persistFrame: async () => {
      await noteboard.persistProjectNoteboardPartialSilent({
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
