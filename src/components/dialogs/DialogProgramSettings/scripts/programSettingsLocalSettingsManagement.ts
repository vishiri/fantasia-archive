import type { Ref } from 'vue'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { buildProgramSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsTreeManagement'

/**
 * Pinia store surface used when hydrating the dialog from persisted settings.
 */
export type T_programSettingsFaUserSettingsStoreForSync = {
  settings: I_faUserSettings | null
  refreshSettings: () => Promise<void>
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

  const normalizedSettingKey = settingKey as keyof I_faUserSettings
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
  resolveFaUserSettingsStore: () => T_programSettingsFaUserSettingsStoreForSync | null,
  localSettings: Ref<I_faUserSettings | null>,
  programSettingsTree: Ref<T_programSettingsRenderTree>
): Promise<void> {
  const faUserSettingsStore = resolveFaUserSettingsStore()
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
