import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import type { T_dialogName } from 'app/types/T_dialogList'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { buildProgramSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsTreeManagement'
import {
  syncLocalProgramSettingsFromStore,
  updateLocalProgramSetting
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsLocalSettingsManagement'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { toRaw, type Ref } from 'vue'

import type { I_dialogProgramSettingsProps } from './dialogProgramSettingsComposable.types'

function resolveFaUserSettingsStore (): ReturnType<typeof S_FaUserSettings> | null {
  try {
    return S_FaUserSettings()
  } catch {
    return null
  }
}

export function createDialogProgramSettingsDialogActions (params: {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faUserSettings | null>
  programSettingsTree: Ref<T_programSettingsRenderTree>
  props: I_dialogProgramSettingsProps
  searchSettingsQuery: Ref<string | null>
}): {
    openDialog: (input: T_dialogName) => void
    saveAndCloseDialog: () => Promise<void>
    updateLocalSetting: (settingKey: string, updatedValue: boolean) => void
  } {
  const {
    dialogModel,
    documentName,
    localSettings,
    programSettingsTree,
    props,
    searchSettingsQuery
  } = params

  function openDialog (input: T_dialogName): void {
    documentName.value = input
    dialogModel.value = true
    searchSettingsQuery.value = ''
    if (props.directSettingsSnapshot !== undefined) {
      localSettings.value = { ...props.directSettingsSnapshot }
      programSettingsTree.value = buildProgramSettingsRenderTree(localSettings.value)
      return
    }

    void syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)
  }

  async function saveAndCloseDialog (): Promise<void> {
    const faUserSettingsStore = resolveFaUserSettingsStore()
    if (faUserSettingsStore !== null && localSettings.value !== null) {
      const plainSettingsSnapshot: I_faUserSettings = { ...toRaw(localSettings.value) }
      await faUserSettingsStore.updateSettings(plainSettingsSnapshot)
    }

    dialogModel.value = false
  }

  function updateLocalSetting (settingKey: string, updatedValue: boolean): void {
    updateLocalProgramSetting(localSettings, programSettingsTree, settingKey, updatedValue)
  }

  return {
    openDialog,
    saveAndCloseDialog,
    updateLocalSetting
  }
}
