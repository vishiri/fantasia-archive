import type {
  I_programSettingRenderItem,
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/types/I_dialogProgramSettings'
import { computed, type ComputedRef, type Ref } from 'vue'

/**
 * Whether to show a separator after this sub-category row (hide after the last sub-category).
 */
export const showNonLastSeparator = (
  subCategories: Record<string, I_programSubCategoryRenderItem>,
  index: number
): boolean => {
  return index < Object.keys(subCategories).length - 1
}

/**
 * Whether to show a separator after this top-level category block in search results (hide after the last category).
 */
export const showNonLastTopCategorySeparator = (
  tree: T_programSettingsRenderTree,
  index: number
): boolean => {
  return index < Object.keys(tree).length - 1
}

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

export function useDialogProgramSettingsSearchComputed (params: {
  programSettingsTree: Ref<T_programSettingsRenderTree>
  searchSettingsQuery: Ref<string | null>
}): {
    hasActiveSearchQuery: ComputedRef<boolean>
    hasSearchNoMatchingSettings: ComputedRef<boolean>
    searchFilteredProgramSettingsTree: ComputedRef<T_programSettingsRenderTree>
  } {
  const {
    programSettingsTree,
    searchSettingsQuery
  } = params

  const hasActiveSearchQuery = computed(
    () => (searchSettingsQuery.value ?? '').trim() !== ''
  )

  const searchFilteredProgramSettingsTree = computed((): T_programSettingsRenderTree => {
    if (!hasActiveSearchQuery.value) {
      return {}
    }

    return filterProgramSettingsTreeForSearch(programSettingsTree.value, searchSettingsQuery.value)
  })

  const hasSearchNoMatchingSettings = computed(
    () =>
      hasActiveSearchQuery.value &&
      Object.keys(searchFilteredProgramSettingsTree.value).length === 0
  )

  return {
    hasActiveSearchQuery,
    hasSearchNoMatchingSettings,
    searchFilteredProgramSettingsTree
  }
}
