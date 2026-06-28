import type { T_projectHierarchyTreeSearchLayoutMode } from 'app/types/I_faProjectHierarchyTreeSearchDomain'

/**
 * Resolves CSS layout mode for the fixed hierarchy tree search row.
 */
export function resolveProjectHierarchyTreeSearchLayout (input: {
  disableDocumentControlBar: boolean
  isFocused: boolean
}): T_projectHierarchyTreeSearchLayoutMode {
  if (input.isFocused) {
    return 'fullViewport'
  }

  if (input.disableDocumentControlBar) {
    return 'followSidebar'
  }

  return 'fixed375'
}
