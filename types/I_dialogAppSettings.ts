import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * One boolean setting row rendered in the App settings tree.
 */
export interface I_appSettingsSettingRenderItem {
  title: string
  description: string
  value: boolean
  tags: string
  note?: string | undefined
}

/**
 * Group of related settings under a subcategory heading.
 */
export interface I_appSettingsSubCategoryRenderItem {
  title: string
  settingsList: Record<string, I_appSettingsSettingRenderItem>
}

/**
 * Top-level category with nested subcategories for the App settings UI.
 */
export interface I_appSettingsCategoryRenderItem {
  title: string
  subCategories: Record<string, I_appSettingsSubCategoryRenderItem>
}

/**
 * Full nested render model for the App settings left column and search.
 */
export type T_appSettingsRenderTree = Record<string, I_appSettingsCategoryRenderItem>

/**
 * Optional props for opening App settings with a preselected dialog or settings snapshot (tests and harness).
 */
export interface I_dialogAppSettingsProps {
  directInput?: T_dialogName | undefined
  directSettingsSnapshot?: I_faUserSettings | undefined
}

/**
 * Locates one setting inside the static options table (category and subcategory keys).
 */
export interface I_appSettingsStaticOption {
  category: string
  subcategory: string
}

/** Metadata for one App settings toggle in the static options table. */
export type T_dialogAppSettingsOptionMetadata = {
  category: string
  subcategory: string
}

/** i18n helpers passed into App settings tree builders. */
export type T_dialogAppSettingsTranslate = {
  t: (key: string) => string
  te: (key: string) => boolean
}

/** Minimal FaUserSettings store surface for App settings dialog sync. */
export type T_appSettingsFaUserSettingsStoreForSync = {
  clearAppSettingsDialogPreview: () => void
  settings: I_faUserSettings | null
  refreshSettings: () => Promise<void>
  setAppSettingsDialogPreview: (preview: Partial<I_faUserSettings>) => void
}
