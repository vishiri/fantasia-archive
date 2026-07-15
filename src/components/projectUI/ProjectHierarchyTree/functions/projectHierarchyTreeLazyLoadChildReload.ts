import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * True when listPlacementDocumentChildren failed because the parent document row is gone.
 */
export function isProjectHierarchyTreePlacementDocumentListNotFoundError (
  error: unknown
): boolean {
  if (error instanceof Error) {
    return error.name === 'FaProjectContentNotFoundError' ||
      error.message.includes('FaProjectContentNotFoundError') ||
      error.message.includes('Document not found')
  }
  return String(error).includes('FaProjectContentNotFoundError') ||
    String(error).includes('Document not found')
}

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
