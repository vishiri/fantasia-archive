import type { Ref } from 'vue'

import { useFaFloatingWindowTextPersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowTextPersist'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

/**
 * Debounced persistence of note text (silent; failures surface through the action manager).
 */
export function useWindowAppNoteboardTextPersist (opts: {
  text: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const noteboard = S_FaAppNoteboard()

  useFaFloatingWindowTextPersist({
    failureActionId: 'reportAppNoteboardSaveFailure',
    persistText: () => noteboard.persistCurrentTextSilent(),
    text: opts.text,
    windowModel: opts.windowModel
  })
}
