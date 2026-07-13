import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * True when a placement or document row should fetch children from IPC again.
 */
export function shouldReloadProjectHierarchyTreeNodeChildren (
  node: Pick<
    I_faProjectHierarchyTreeHeTreeNode,
    'children' | 'childrenLoaded' | 'hasChildren' | 'nodeKind'
  >
): boolean {
  if (!node.childrenLoaded) {
    return true
  }
  if (!node.hasChildren) {
    return false
  }
  if (node.nodeKind !== 'templatePlacement' && node.nodeKind !== 'document') {
    return false
  }
  return node.children.length === 0
}
