import { resolveTrimmedIconOrDefault } from 'app/src/scripts/faIcons/faIconDisplay_manager'

import { PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON } from '../functions/projectHierarchyTreeConstants'

export function resolveProjectHierarchyTreePlacementDisplayIcon (icon: string): string {
  return resolveTrimmedIconOrDefault(icon, PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON)
}
