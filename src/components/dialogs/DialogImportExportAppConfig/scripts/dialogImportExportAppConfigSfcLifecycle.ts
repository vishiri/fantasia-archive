import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { StoreGeneric } from 'pinia'
import { Result } from 'neverthrow'
import { onMounted, type Ref, watch } from 'vue'

import { registerComponentDialogStackGuard } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { S_DialogComponent } from 'app/src/stores/S_Dialog'

export function useDialogImportExportAppConfigLifecycle (opts: {
  dialogModel: Ref<boolean>
  directInput: Ref<T_dialogName | undefined>
}): void {
  const { dialogModel, directInput } = opts

  const resolveDialogComponentStore = (): StoreGeneric | null => {
    return Result.fromThrowable(
      (): StoreGeneric => S_DialogComponent(),
      (): null => null
    )().unwrapOr(null)
  }

  registerComponentDialogStackGuard(dialogModel)

  function openDialog (): void {
    dialogModel.value = true
  }

  watch(
    () => resolveDialogComponentStore()?.dialogUUID,
    () => {
      const s = resolveDialogComponentStore()
      if (s?.dialogToOpen === 'ImportExportAppConfig') {
        openDialog()
      }
    }
  )

  watch(
    () => directInput.value,
    () => {
      if (directInput.value === 'ImportExportAppConfig') {
        openDialog()
      }
    }
  )

  onMounted(() => {
    if (directInput.value === 'ImportExportAppConfig') {
      openDialog()
    }
  })
}
