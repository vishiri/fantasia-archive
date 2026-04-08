import type {
  I_programSettingRenderItem,
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'

/**
 * Normalizes raw search input for case-insensitive substring matching.
 */
export function normalizeProgramSettingsSearchNeedle (raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase()
}

/**
 * Returns true when the needle is empty (match-all) or appears in title, tags, or description.
 */
export function programSettingMatchesSearchNeedle (
  setting: I_programSettingRenderItem,
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
export function filterProgramSettingsTreeForSearch (
  tree: T_programSettingsRenderTree,
  rawQuery: string | null | undefined
): T_programSettingsRenderTree {
  const needle = normalizeProgramSettingsSearchNeedle(rawQuery)

  if (needle === '') {
    return structuredClone(tree)
  }

  const result: T_programSettingsRenderTree = {}

  for (const [categoryKey, category] of Object.entries(tree)) {
    const nextSubCategories: Record<string, I_programSubCategoryRenderItem> = {}

    for (const [subCategoryKey, subCategory] of Object.entries(category.subCategories)) {
      const nextSettingsList: Record<string, I_programSettingRenderItem> = {}

      for (const [settingKey, setting] of Object.entries(subCategory.settingsList)) {
        if (programSettingMatchesSearchNeedle(setting, needle)) {
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
