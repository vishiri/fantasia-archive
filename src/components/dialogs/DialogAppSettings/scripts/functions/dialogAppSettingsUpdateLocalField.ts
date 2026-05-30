import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  T_appSettingsRenderTree,
  T_dialogAppSettingsOptionMetadata
} from 'app/types/I_dialogAppSettings'

/**
 * Updates the in-memory settings snapshot and the matching toggle in the render tree.
 */
export function updateLocalAppSettingsField (
  localSettings: I_faUserSettings,
  appSettingsTree: T_appSettingsRenderTree,
  appSettingsOptions: Record<string, T_dialogAppSettingsOptionMetadata>,
  settingKey: string,
  updatedValue: boolean
): void {
  if (!Object.hasOwn(appSettingsOptions, settingKey)) {
    return
  }

  const settingsRecord = localSettings as unknown as Record<string, boolean | string>
  settingsRecord[settingKey] = updatedValue

  const settingMetadata = appSettingsOptions[settingKey]
  const categoryEntry = appSettingsTree[settingMetadata.category]
  if (categoryEntry === undefined) {
    return
  }

  const subCategoryEntry = categoryEntry.subCategories[settingMetadata.subcategory]
  if (subCategoryEntry === undefined || subCategoryEntry.settingsList[settingKey] === undefined) {
    return
  }

  subCategoryEntry.settingsList[settingKey].value = updatedValue
}
