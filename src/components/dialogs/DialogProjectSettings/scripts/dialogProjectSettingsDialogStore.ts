import type { StoreGeneric } from 'pinia'
import { Result } from 'neverthrow'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import { onMounted, watch } from 'vue'

import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import { S_DialogComponent } from 'src/stores/S_Dialog'

/**
 * Resolves the component-dialog Pinia store when Pinia is active.
 */
export function resolveDialogComponentStore (): StoreGeneric | null {
  return Result.fromThrowable(
    (): StoreGeneric => S_DialogComponent(),
    (): null => null
  )().unwrapOr(null)
}

export function registerDialogProjectSettingsWatchers (params: {
  openDialog: (input: T_dialogName) => void
  props: I_dialogProjectSettingsProps
}): void {
  const { openDialog, props } = params

  watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
    const dialogComponentStore = resolveDialogComponentStore()
    if (dialogComponentStore?.dialogToOpen === 'ProjectSettings') {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  watch(() => props.directInput, () => {
    if (props.directInput === 'ProjectSettings') {
      openDialog(props.directInput)
    }
  })

  onMounted(() => {
    if (props.directInput === 'ProjectSettings') {
      openDialog(props.directInput)
    }
  })
}
