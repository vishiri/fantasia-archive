import type { T_projectHierarchyTreeSearchLayoutMode } from 'app/types/I_faProjectHierarchyTreeSearchDomain'

/**
 * Resolves CSS layout mode for the hierarchy tree search row.
 */
export function resolveProjectHierarchyTreeSearchLayout (input: {
  disableAppControlBar: boolean
  isFocused: boolean
}): T_projectHierarchyTreeSearchLayoutMode {
  if (input.isFocused) {
    return 'fullViewport'
  }

  if (input.disableAppControlBar) {
    return 'followSidebar'
  }

  return 'fixed375'
}
