import type { Ref } from 'vue'

import { useFaFloatingWindowTextPersist } from 'app/src/scripts/floatingWindows/useFaFloatingWindowTextPersist'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

/**
 * Debounced persistence of project noteboard text (silent; failures surface through the action manager).
 */
export function useWindowProjectNoteboardTextPersist (opts: {
  text: Ref<string>
  windowModel: Ref<boolean>
}): void {
  const noteboard = S_FaProjectNoteboard()

  useFaFloatingWindowTextPersist({
    failureActionId: 'reportProjectNoteboardSaveFailure',
    persistText: () => noteboard.persistCurrentTextSilent(),
    text: opts.text,
    windowModel: opts.windowModel
  })
}
