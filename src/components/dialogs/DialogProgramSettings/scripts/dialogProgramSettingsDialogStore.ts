import type { StoreGeneric } from 'pinia'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
import { onMounted, watch, type Ref } from 'vue'

import type { I_dialogProgramSettingsProps } from 'app/types/I_dialogProgramSettings'
import { S_DialogComponent } from 'src/stores/S_Dialog'

/**
 * Resolves the component-dialog Pinia store when the app has an active Pinia instance; returns null if the store cannot be constructed (for example outside a component or without Pinia).
 */
export function resolveDialogComponentStore (): StoreGeneric | null {
  try {
    return S_DialogComponent()
  } catch {
    return null
  }
}

function syncSelectedTabToTreeKeys (
  tree: T_programSettingsRenderTree,
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

export function registerDialogProgramSettingsWatchers (params: {
  openDialog: (input: T_dialogName) => void
  programSettingsTree: Ref<T_programSettingsRenderTree>
  props: I_dialogProgramSettingsProps
  selectedCategoryTab: Ref<string>
}): void {
  const {
    openDialog,
    programSettingsTree,
    props,
    selectedCategoryTab
  } = params

  watch(
    programSettingsTree,
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
    if (dialogComponentStore?.dialogToOpen === 'ProgramSettings') {
      openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
    }
  })

  watch(() => props.directInput, () => {
    if (props.directInput !== undefined && props.directInput !== '') {
      if (props.directInput === 'ProgramSettings') {
        openDialog(props.directInput)
      }
    }
  })

  onMounted(() => {
    if (props.directInput === 'ProgramSettings') {
      openDialog(props.directInput)
    }
  })
}
