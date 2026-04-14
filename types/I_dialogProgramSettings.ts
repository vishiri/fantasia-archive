import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * One boolean setting row rendered in the Program settings tree.
 */
export interface I_programSettingRenderItem {
  title: string
  description: string
  value: boolean
  tags: string
  note?: string
}

/**
 * Group of related settings under a subcategory heading.
 */
export interface I_programSubCategoryRenderItem {
  title: string
  settingsList: Record<string, I_programSettingRenderItem>
}

/**
 * Top-level category with nested subcategories for the Program settings UI.
 */
export interface I_programCategoryRenderItem {
  title: string
  subCategories: Record<string, I_programSubCategoryRenderItem>
}

/**
 * Full nested render model for the Program settings left column and search.
 */
export type T_programSettingsRenderTree = Record<string, I_programCategoryRenderItem>

/**
 * Optional props for opening Program settings with a preselected dialog or settings snapshot (tests and harness).
 */
export interface I_dialogProgramSettingsProps {
  directInput?: T_dialogName
  directSettingsSnapshot?: I_faUserSettings
}

/**
 * Locates one setting inside the static options table (category and subcategory keys).
 */
export interface I_programSettingOption {
  category: string
  subcategory: string
}
