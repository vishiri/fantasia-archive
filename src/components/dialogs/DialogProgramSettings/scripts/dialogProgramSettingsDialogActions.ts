import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import { buildProgramSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/scripts/dialogProgramSettingsTree'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { toRaw, type Ref } from 'vue'

import type { I_dialogProgramSettingsProps } from 'app/types/I_dialogProgramSettings'

/**
 * Pinia store surface used when hydrating the dialog from persisted settings.
 */
export type T_programSettingsFaUserSettingsStoreForSync = {
  settings: I_faUserSettings | null
  refreshSettings: () => Promise<void>
}

function tryResolveFaUserSettingsStoreForSync (): T_programSettingsFaUserSettingsStoreForSync | null {
  try {
    return S_FaUserSettings()
  } catch {
    return null
  }
}

/**
 * Updates the in-memory settings snapshot and the matching toggle in the render tree.
 */
export function updateLocalProgramSetting (
  localSettings: Ref<I_faUserSettings | null>,
  programSettingsTree: Ref<T_programSettingsRenderTree>,
  settingKey: string,
  updatedValue: boolean
): void {
  if (localSettings.value === null) {
    return
  }

  if (!Object.hasOwn(PROGRAM_SETTINGS_OPTIONS, settingKey)) {
    return
  }

  const normalizedSettingKey = settingKey as keyof typeof PROGRAM_SETTINGS_OPTIONS
  localSettings.value[normalizedSettingKey] = updatedValue

  const settingMetadata = PROGRAM_SETTINGS_OPTIONS[normalizedSettingKey]
  const categoryEntry = programSettingsTree.value[settingMetadata.category]
  if (categoryEntry === undefined) {
    return
  }

  const subCategoryEntry = categoryEntry.subCategories[settingMetadata.subcategory]
  if (subCategoryEntry === undefined || subCategoryEntry.settingsList[settingKey] === undefined) {
    return
  }

  subCategoryEntry.settingsList[settingKey].value = updatedValue
}

/**
 * Pulls the latest settings from the store into the local editable copy.
 */
export async function syncLocalProgramSettingsFromStore (
  localSettings: Ref<I_faUserSettings | null>,
  programSettingsTree: Ref<T_programSettingsRenderTree>
): Promise<void> {
  const faUserSettingsStore = tryResolveFaUserSettingsStoreForSync()
  if (faUserSettingsStore === null) {
    return
  }

  if (faUserSettingsStore.settings === null) {
    await faUserSettingsStore.refreshSettings()
  }

  if (faUserSettingsStore.settings !== null) {
    localSettings.value = { ...faUserSettingsStore.settings }
    programSettingsTree.value = buildProgramSettingsRenderTree(localSettings.value)
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
    const directSnapshot = props.directSettingsSnapshot
    if (directSnapshot !== undefined) {
      const nextSettings: I_faUserSettings = { ...directSnapshot }
      localSettings.value = nextSettings
      programSettingsTree.value = buildProgramSettingsRenderTree(nextSettings)
      return
    }

    void syncLocalProgramSettingsFromStore(localSettings, programSettingsTree)
  }

  async function saveAndCloseDialog (): Promise<void> {
    if (localSettings.value !== null) {
      const plainSettingsSnapshot: I_faUserSettings = { ...toRaw(localSettings.value) }
      await runFaActionAwait('saveProgramSettings', { settings: plainSettingsSnapshot })
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
