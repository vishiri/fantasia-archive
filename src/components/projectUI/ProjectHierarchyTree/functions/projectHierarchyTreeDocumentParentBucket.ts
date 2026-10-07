import type {
  I_faProjectHierarchyTreeDocumentParentBucket,
  I_faProjectHierarchyTreeDocumentParentBucketLookupOptions,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

export function isProjectHierarchyTreeDocumentParentBucketMatch (
  node: I_faProjectHierarchyTreeHeTreeNode,
  documentId: string,
  preferredNodeId: string | null
): boolean {
  if (node.nodeKind !== 'document' || node.documentId === null) {
    return false
  }
  const matchesDocument = node.documentId === documentId || node.id === documentId
  if (!matchesDocument) {
    return false
  }
  if (preferredNodeId === null || preferredNodeId.length === 0) {
    return true
  }
  return node.id === preferredNodeId
}

export function findProjectHierarchyTreeDocumentParentBucket (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentContext: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  } = {
    parentDocumentId: null,
    parentNode: null
  },
  options: I_faProjectHierarchyTreeDocumentParentBucketLookupOptions = {}
): I_faProjectHierarchyTreeDocumentParentBucket | null {
  const preferredNodeId = options.preferredNodeId ?? null
  for (const node of nodes) {
    if (isProjectHierarchyTreeDocumentParentBucketMatch(node, documentId, preferredNodeId)) {
      const parentDocumentId = parentContext.parentDocumentId
      const parentNode = parentContext.parentNode
      return {
        children: nodes,
        parentDocumentId,
        parentNode
      }
    }
    const parentDocumentId = node.nodeKind === 'document' ? node.documentId : null
    const nested = findProjectHierarchyTreeDocumentParentBucket(
      node.children,
      documentId,
      {
        parentDocumentId,
        parentNode: node
      },
      options
    )
    if (nested !== null) {
      return nested
    }
  }
  return null
}

function findProjectHierarchyTreeDocumentNodeById (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    const tagId = node.tagId
    const isTagCopy = typeof tagId === 'string' && tagId.length > 0
    if (node.nodeKind === 'document' && node.documentId === documentId && !isTagCopy) {
      return node
    }
    const nested = findProjectHierarchyTreeDocumentNodeById(node.children, documentId)
    if (nested !== null) {
      return nested
    }
  }
  return null
}

function findProjectHierarchyTreeTemplatePlacementNodeForCreateRefresh (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  worldId: string,
  templateId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    if (
      node.nodeKind === 'templatePlacement' &&
      node.worldId === worldId &&
      node.documentTemplateId === templateId
    ) {
      return node
    }
    const nested = findProjectHierarchyTreeTemplatePlacementNodeForCreateRefresh(
      node.children,
      worldId,
      templateId
    )
    if (nested !== null) {
      return nested
    }
  }
  return null
}

/**
 * Marks a document row expandable before reloading children after a nested child is created.
 */
export function ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): boolean {
  const documentNode = findProjectHierarchyTreeDocumentNodeById(treeNodes, documentId)
  if (documentNode === null) {
    return false
  }
  documentNode.hasChildren = true
  return true
}

/**
 * Resolves hierarchy tree node ids whose lazy-loaded children should reload after first save
 * of a temporary document that is not yet present in the tree.
 */
export function collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  input: {
    parentDocumentId: string | null
    templateId: string
    worldId: string
  }
): string[] {
  const tree = treeNodes as I_faProjectHierarchyTreeHeTreeNode[]
  if (input.parentDocumentId !== null) {
    const parentNode = findProjectHierarchyTreeDocumentNodeById(tree, input.parentDocumentId)
    if (parentNode === null) {
      return []
    }
    return [parentNode.id]
  }
  const placementNode = findProjectHierarchyTreeTemplatePlacementNodeForCreateRefresh(
    tree,
    input.worldId,
    input.templateId
  )
  if (placementNode === null) {
    return []
  }
  return [placementNode.id]
}

/**
 * Removes document rows from the in-memory hierarchy tree by persisted document id.
 */
export function removeProjectHierarchyTreeDocumentNodesByDocumentIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentIds: readonly string[]
): boolean {
  if (documentIds.length === 0) {
    return false
  }
  const targetDocumentIds = new Set(documentIds)
  let removed = false

  function removeFromNodes (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
      const node = nodes[index]
      if (node === undefined) {
        continue
      }
      if (
        node.nodeKind === 'document' &&
        node.documentId !== null &&
        targetDocumentIds.has(node.documentId)
      ) {
        nodes.splice(index, 1)
        removed = true
        continue
      }
      removeFromNodes(node.children)
    }
  }

  removeFromNodes(treeNodes)
  return removed
}
