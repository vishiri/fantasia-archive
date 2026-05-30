import type {
  I_appSettingsSettingRenderItem,
  I_appSettingsSubCategoryRenderItem,
  T_appSettingsRenderTree
} from 'app/types/I_dialogAppSettings'

/**
 * Whether to show a separator after this sub-category row (hide after the last sub-category).
 */
export function showNonLastSeparator (
  subCategories: Record<string, I_appSettingsSubCategoryRenderItem>,
  index: number
): boolean {
  return index < Object.keys(subCategories).length - 1
}

/**
 * Whether to show a separator after this top-level category block in search results (hide after the last category).
 */
export function showNonLastTopCategorySeparator (
  tree: T_appSettingsRenderTree,
  index: number
): boolean {
  return index < Object.keys(tree).length - 1
}

/**
 * Normalizes raw search input for case-insensitive substring matching.
 */
export function normalizeAppSettingsSearchNeedle (raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase()
}

/**
 * Returns true when the needle is empty (match-all) or appears in title, tags, or description.
 */
export function appSettingsRowMatchesSearchNeedle (
  setting: I_appSettingsSettingRenderItem,
  needle: string
): boolean {
  if (needle === '') {
    return true
  }

  const title = setting.title.toLowerCase()
  const tags = setting.tags.toLowerCase()
  const description = setting.description.toLowerCase()

  return (
    title.includes(needle) ||
    tags.includes(needle) ||
    description.includes(needle)
  )
}

/**
 * Returns a tree that keeps only settings matching the needle; empty sub-categories and categories are omitted.
 * When the normalized needle is empty, returns a deep clone of the full tree (all leaves kept).
 */
export function filterAppSettingsTreeForSearch (
  tree: T_appSettingsRenderTree,
  rawQuery: string | null | undefined
): T_appSettingsRenderTree {
  const needle = normalizeAppSettingsSearchNeedle(rawQuery)

  if (needle === '') {
    return structuredClone(tree)
  }

  const result: T_appSettingsRenderTree = {}

  for (const [categoryKey, category] of Object.entries(tree)) {
    const nextSubCategories: Record<string, I_appSettingsSubCategoryRenderItem> = {}

    for (const [subCategoryKey, subCategory] of Object.entries(category.subCategories)) {
      const nextSettingsList: Record<string, I_appSettingsSettingRenderItem> = {}

      for (const [settingKey, setting] of Object.entries(subCategory.settingsList)) {
        if (appSettingsRowMatchesSearchNeedle(setting, needle)) {
          nextSettingsList[settingKey] = setting
        }
      }

      if (Object.keys(nextSettingsList).length > 0) {
        nextSubCategories[subCategoryKey] = {
          ...subCategory,
          settingsList: nextSettingsList
        }
      }
    }

    if (Object.keys(nextSubCategories).length > 0) {
      result[categoryKey] = {
        ...category,
        subCategories: nextSubCategories
      }
    }
  }

  return result
}
