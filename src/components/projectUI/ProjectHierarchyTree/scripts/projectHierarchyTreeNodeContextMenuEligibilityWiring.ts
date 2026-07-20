import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeNodeContextMenuSectionFlags
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeBulkExpandCollapseMenuEligible } from '../functions/projectHierarchyTreeBulkExpandCollapse'

export function resolveProjectHierarchyTreeNodeContextMenuSectionFlags (
  node: I_faProjectHierarchyTreeHeTreeNode,
  treeData: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeNodeContextMenuSectionFlags | null {
  const showsCopyRows = node.nodeKind === 'document' && node.documentId !== null
  const showsBulkExpandRows = isProjectHierarchyTreeBulkExpandCollapseMenuEligible(node, treeData)
  const showsSortByRows =
    (
      (node.nodeKind === 'document' && node.documentId !== null) ||
      node.nodeKind === 'templatePlacement'
    ) &&
    typeof node.placementId === 'string' &&
    node.placementId.trim().length > 0
  if (!showsCopyRows && !showsBulkExpandRows && !showsSortByRows) {
    return null
  }

  return {
    showsBulkExpandRows,
    showsCopyRows,
    showsSortByRows
  }
}
