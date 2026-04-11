import type { Ref } from 'vue'

import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import { PROGRAM_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogProgramSettings/_data/programSettingsOptions'
import type { T_programSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import { buildProgramSettingsRenderTree } from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsTreeManagement'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'

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
