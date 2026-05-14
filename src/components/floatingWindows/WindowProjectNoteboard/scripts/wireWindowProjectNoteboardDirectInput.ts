import { onMounted, watch } from 'vue'

import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'

/**
 * Opens the project noteboard when 'directInput' is 'WindowProjectNoteboard' (Storybook / harness).
 */
export function wireWindowProjectNoteboardDirectInput (props: {
  directInput?: T_dialogName
}): void {
  const store = S_FaProjectNoteboard()

  function maybeOpenFromProp (): void {
    if (props.directInput === 'WindowProjectNoteboard') {
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
