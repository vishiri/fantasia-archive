import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  T_appSettingsRenderTree,
  T_appSettingsSettingUpdateValue,
  T_dialogAppSettingsOptionMetadata
} from 'app/types/I_dialogAppSettings'

/**
 * Updates the in-memory settings snapshot and the matching control in the render tree.
 */
export function updateLocalAppSettingsField (
  localSettings: I_faUserSettings,
  appSettingsTree: T_appSettingsRenderTree,
  appSettingsOptions: Record<string, T_dialogAppSettingsOptionMetadata>,
  settingKey: string,
  updatedValue: T_appSettingsSettingUpdateValue
): void {
  if (!Object.hasOwn(appSettingsOptions, settingKey)) {
    return
  }

  const settingsRecord = localSettings as unknown as Record<string, boolean | string>
  settingsRecord[settingKey] = updatedValue

  const settingMetadata = appSettingsOptions[settingKey]!
  const categoryEntry = appSettingsTree[settingMetadata.category]
  if (categoryEntry === undefined) {
    return
  }

  const subCategoryEntry = categoryEntry.subCategories[settingMetadata.subcategory]
  const settingEntry = subCategoryEntry?.settingsList[settingKey]
  if (subCategoryEntry === undefined || settingEntry === undefined) {
    return
  }

  if (settingEntry.control === 'select' && typeof updatedValue === 'string') {
    settingEntry.value = updatedValue
    return
  }

  if (settingEntry.control === 'toggle' && typeof updatedValue === 'boolean') {
    settingEntry.value = updatedValue
  }
}
