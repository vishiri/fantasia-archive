export interface I_programSettingRenderItem {
  title: string
  description: string
  value: boolean
  tags: string
  note?: string
}

export interface I_programSubCategoryRenderItem {
  title: string
  settingsList: Record<string, I_programSettingRenderItem>
}

export interface I_programCategoryRenderItem {
  title: string
  subCategories: Record<string, I_programSubCategoryRenderItem>
}

export type T_programSettingsRenderTree = Record<string, I_programCategoryRenderItem>
