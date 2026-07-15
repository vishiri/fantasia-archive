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
  if (!showsCopyRows && !showsBulkExpandRows) {
    return null
  }

  return {
    showsBulkExpandRows,
    showsCopyRows
  }
}
