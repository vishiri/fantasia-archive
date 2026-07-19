/**
 * CSS token for world rows with no saved color (follows theme / Custom app CSS).
 */
export const PROJECT_HIERARCHY_TREE_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK =
  'var(--fa-color-primary-bright)'

/**
 * Resolve world icon/label color; empty/whitespace uses primary-bright theme token.
 */
export function resolveProjectHierarchyTreeWorldDisplayColor (worldColor: string): string {
  const trimmedColor = worldColor.trim()
  if (trimmedColor.length === 0) {
    return PROJECT_HIERARCHY_TREE_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK
  }
  return trimmedColor
}
