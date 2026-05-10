import { onMounted, watch } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

/**
 * Opens the note board when 'directInput' is 'WindowAppNoteboard' (Storybook / harness).
 */
export function wireWindowAppNoteboardDirectInput (props: {
  directInput?: T_dialogName
}): void {
  const store = S_FaAppNoteboard()

  function maybeOpenFromProp (): void {
    if (props.directInput === 'WindowAppNoteboard') {
      store.setWindowOpen(true)
    }
  }

  watch(
    () => props.directInput,
    () => {
      maybeOpenFromProp()
    },
    { immediate: true }
  )

  onMounted(() => {
    maybeOpenFromProp()
  })
}
