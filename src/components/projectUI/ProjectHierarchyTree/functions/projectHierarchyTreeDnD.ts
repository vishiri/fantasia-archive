import type {
  I_faProjectHierarchyTreeDragContext,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_heTreeDragContext = {
  dragNode: {
    data: I_faProjectHierarchyTreeHeTreeNode
  } | null
}

function readDraggedDocumentNode (
  dragContext: T_heTreeDragContext
): I_faProjectHierarchyTreeHeTreeNode | null {
  const dragged = dragContext.dragNode?.data
  if (dragged === undefined || dragged === null) {
    return null
  }
  if (dragged.nodeKind !== 'document' || dragged.documentId === null) {
    return null
  }
  return dragged
}

function resolveProjectHierarchyTreeDocumentParentDocumentId (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentDocumentId: string | null = null
): string | null | undefined {
  if (!Array.isArray(treeNodes)) {
    return undefined
  }
  for (const node of treeNodes) {
    if (node.nodeKind === 'document' && node.id === documentId) {
      return parentDocumentId
    }
    const childNodes = Array.isArray(node.children) ? node.children : []
    const nestedParentDocumentId = node.nodeKind === 'document' ? node.documentId : parentDocumentId
    const nested = resolveProjectHierarchyTreeDocumentParentDocumentId(
      childNodes,
      documentId,
      nestedParentDocumentId
    )
    if (nested !== undefined) {
      return nested
    }
  }
  return undefined
}

/**
 * True for persisted document rows; excludes lazy-load placeholder children.
 */
export function isProjectHierarchyTreeDocumentSiblingRow (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.nodeKind === 'document' && node.documentId !== null
}

/**
 * Walks he-tree parent stats to resolve placementId for a node row.
 */
export function resolvePlacementIdFromHeTreeNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  if (node.placementId !== null) {
    return node.placementId
  }
  return null
}

/**
 * Returns drag context fields when the node is a draggable document row.
 */
export function resolveProjectHierarchyTreeDragContext (
  node: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeDragContext | null {
  if (node.nodeKind !== 'document' || node.documentId === null || node.placementId === null) {
    return null
  }
  return {
    documentId: node.documentId,
    placementId: node.placementId,
    worldId: node.worldId
  }
}

/**
 * Only document rows may start a drag session.
 */
export function isProjectHierarchyTreeNodeDraggable (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return isProjectHierarchyTreeDocumentSiblingRow(node)
}

/**
 * he-tree uses rootDroppable for empty-root insert slots (e.g. first row under a parent).
 * Allow during document drags so outdent to template placement level works; invalid tree-root
 * drops are rejected at commit via isProjectHierarchyTreeDocumentDropParentValid.
 */
export function isProjectHierarchyTreeRootDroppable (
  dragContext: T_heTreeDragContext
): boolean {
  return readDraggedDocumentNode(dragContext) !== null
}

/**
 * First-level documents must sit under templatePlacement; nested rows use document parents.
 */
export function isProjectHierarchyTreeDocumentDropParentValid (input: {
  parentDocumentId: string | null
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null
}): boolean {
  if (input.parentDocumentId !== null) {
    return true
  }
  return input.parentNode?.nodeKind === 'templatePlacement'
}

/**
 * Document drops are allowed only on rows sharing the same placementId.
 * Direct parent documents are not droppable so pull-left outdent uses sibling slots.
 */
export function isProjectHierarchyTreeNodeDroppable (
  targetNode: I_faProjectHierarchyTreeHeTreeNode,
  dragContext: T_heTreeDragContext,
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[] = []
): boolean {
  const dragged = readDraggedDocumentNode(dragContext)
  if (dragged === null) {
    return true
  }
  if (dragged.placementId === null) {
    return false
  }
  const treeNodesSafe = Array.isArray(treeNodes) ? treeNodes : []
  if (targetNode.nodeKind === 'document') {
    if (!isProjectHierarchyTreeDocumentSiblingRow(targetNode)) {
      return false
    }
    if (targetNode.placementId !== dragged.placementId) {
      return false
    }
    if (targetNode.id === dragged.id) {
      return false
    }
    const parentDocumentId = resolveProjectHierarchyTreeDocumentParentDocumentId(
      treeNodesSafe,
      dragged.id
    )
    if (
      parentDocumentId !== undefined &&
      parentDocumentId !== null &&
      targetNode.documentId === parentDocumentId
    ) {
      return false
    }
    return true
  }
  if (targetNode.nodeKind === 'templatePlacement') {
    return targetNode.placementId === dragged.placementId
  }
  return false
}
