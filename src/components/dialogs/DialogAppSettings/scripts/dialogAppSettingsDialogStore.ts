import type { StoreGeneric } from 'pinia'
import { Result } from 'neverthrow'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import { onMounted, watch, type Ref } from 'vue'

import type { I_dialogAppSettingsProps } from 'app/types/I_dialogAppSettings'
import { S_DialogComponent } from 'src/stores/S_Dialog'

/**
 * Resolves the component-dialog Pinia store when the app has an active Pinia instance; returns null if the store cannot be constructed (for example outside a component or without Pinia).
 */
export function resolveDialogComponentStore (): StoreGeneric | null {
  return Result.fromThrowable(
    (): StoreGeneric => S_DialogComponent(),
    (): null => null
  )().unwrapOr(null)
}

function syncSelectedTabToTreeKeys (
  tree: T_appSettingsRenderTree,
  selectedCategoryTab: Ref<string>
): void {
  const keys = Object.keys(tree)
  if (keys.length === 0) {
    selectedCategoryTab.value = ''
    return
  }
  if (selectedCategoryTab.value === '' || !keys.includes(selectedCategoryTab.value)) {
    selectedCategoryTab.value = keys[0] as string
  }
}

export function registerDialogAppSettingsWatchers (params: {
  openDialog: (input: T_dialogName) => void
  appSettingsTree: Ref<T_appSettingsRenderTree>
  props: I_dialogAppSettingsProps
  selectedCategoryTab: Ref<string>
}): void {
  const {
    openDialog,
    appSettingsTree,
    props,
    selectedCategoryTab
  } = params

  watch(
    appSettingsTree,
    (tree) => {
      syncSelectedTabToTreeKeys(tree, selectedCategoryTab)
    },
    {
      deep: true,
      immediate: true
    }
  )

  watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
    const dialogComponentStore = resolveDialogComponentStore()
    if (dialogComponentStore?.dialogToOpen === 'AppSettings') {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  watch(() => props.directInput, () => {
    if (props.directInput !== undefined && props.directInput !== '') {
      if (props.directInput === 'AppSettings') {
        openDialog(props.directInput)
      }
    }
  })

  onMounted(() => {
    if (props.directInput === 'AppSettings') {
      openDialog(props.directInput)
    }
  })
}
