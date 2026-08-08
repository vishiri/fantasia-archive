import type {
  I_faProjectHierarchyTreeDragContext,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

function isDocumentUnderTagNode (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'nodeKind' | 'tagId'>
): boolean {
  return node.nodeKind === 'document' && typeof node.tagId === 'string' && node.tagId.length > 0
}

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
 * Returns drag context fields when the node is a draggable main-tree document row.
 */
export function resolveProjectHierarchyTreeDragContext (
  node: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeDragContext | null {
  if (
    node.nodeKind !== 'document' ||
    node.documentId === null ||
    node.placementId === null ||
    isDocumentUnderTagNode(node)
  ) {
    return null
  }
  return {
    documentId: node.documentId,
    placementId: node.placementId,
    worldId: node.worldId
  }
}

/**
 * Document rows may start a drag (main tree or under-tag reorder).
 */
export function isProjectHierarchyTreeNodeDraggable (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  if (node.nodeKind === 'addNewDocument') {
    return false
  }
  return isProjectHierarchyTreeDocumentSiblingRow(node)
}

/**
 * Root insert targets he-tree top-level stats (world rows). Never allow for document drags.
 */
export function isProjectHierarchyTreeRootDroppable (
  _dragContext: T_heTreeDragContext
): boolean {
  return false
}

/**
 * First-level documents must sit under templatePlacement; nested rows use document parents.
 * Under-tag docs stay flat under their tag parent only.
 */
export function isProjectHierarchyTreeDocumentDropParentValid (input: {
  parentDocumentId: string | null
  parentNode: I_faProjectHierarchyTreeHeTreeNode | null
}): boolean {
  if (input.parentNode?.nodeKind === 'tag') {
    return input.parentDocumentId === null
  }
  if (input.parentDocumentId !== null) {
    return true
  }
  return input.parentNode?.nodeKind === 'templatePlacement'
}

/**
 * Document drops: same placement (main tree) or same tag (under-tag reorder only).
 */
export function isProjectHierarchyTreeNodeDroppable (
  targetNode: I_faProjectHierarchyTreeHeTreeNode,
  dragContext: T_heTreeDragContext,
  _treeNodes: I_faProjectHierarchyTreeHeTreeNode[] = []
): boolean {
  if (
    targetNode.nodeKind === 'addNewDocument' ||
    targetNode.nodeKind === 'tagWrapper' ||
    targetNode.nodeKind === 'world' ||
    targetNode.nodeKind === 'group'
  ) {
    return false
  }
  const dragged = readDraggedDocumentNode(dragContext)
  if (dragged === null) {
    return true
  }
  if (isDocumentUnderTagNode(dragged)) {
    if (dragged.tagId === null) {
      return false
    }
    // Flat under-tag list: only the tag row is a drop parent. Sibling docs must not
    // accept children or he-tree nests into them and persist fails membership checks.
    if (targetNode.nodeKind === 'tag') {
      return targetNode.tagId === dragged.tagId
    }
    return false
  }
  if (dragged.placementId === null) {
    return false
  }
  if (targetNode.nodeKind === 'document') {
    if (!isProjectHierarchyTreeDocumentSiblingRow(targetNode)) {
      return false
    }
    if (isDocumentUnderTagNode(targetNode)) {
      return false
    }
    if (targetNode.placementId !== dragged.placementId) {
      return false
    }
    if (targetNode.id === dragged.id) {
      return false
    }
    return true
  }
  if (targetNode.nodeKind === 'templatePlacement') {
    return targetNode.placementId === dragged.placementId
  }
  return false
}
