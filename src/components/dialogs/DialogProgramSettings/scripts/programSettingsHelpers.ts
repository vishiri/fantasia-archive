import type {
  I_programSubCategoryRenderItem,
  T_programSettingsRenderTree
} from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'

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
