import type {
  I_faProjectHierarchyTreeDocumentParentBucket,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

export function findProjectHierarchyTreeDocumentParentBucket (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentContext: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  } = {
    parentDocumentId: null,
    parentNode: null
  }
): I_faProjectHierarchyTreeDocumentParentBucket | null {
  for (const node of nodes) {
    if (
      node.nodeKind === 'document' &&
      node.documentId !== null &&
      (node.documentId === documentId || node.id === documentId)
    ) {
      return {
        children: nodes,
        parentDocumentId: parentContext.parentDocumentId,
        parentNode: parentContext.parentNode
      }
    }
    const parentDocumentId = node.nodeKind === 'document' ? node.documentId : null
    const nested = findProjectHierarchyTreeDocumentParentBucket(
      node.children,
      documentId,
      {
        parentDocumentId,
        parentNode: node
      }
    )
    if (nested !== null) {
      return nested
    }
  }
  return null
}

/**
 * Resolves parent container node ids whose lazy-loaded document rows should reload.
 * When the saved document itself has loaded children, its node id is appended after
 * parent buckets so a parent remerge cannot leave an expanded subtree stale.
 */
export function collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentIds: readonly string[]
): string[] {
  const parentNodeIds = new Set<string>()
  const loadedDocumentNodeIds = new Set<string>()
  for (const documentId of documentIds) {
    const bucket = findProjectHierarchyTreeDocumentParentBucket(
      treeNodes as I_faProjectHierarchyTreeHeTreeNode[],
      documentId
    )
    if (bucket === null) {
      continue
    }
    const parentNode = bucket.parentNode
    if (parentNode !== null && parentNode.childrenLoaded) {
      parentNodeIds.add(parentNode.id)
    }
    const documentNode = findProjectHierarchyTreeDocumentNodeById(
      treeNodes as I_faProjectHierarchyTreeHeTreeNode[],
      documentId
    )
    if (
      documentNode !== null &&
      documentNode.childrenLoaded &&
      documentNode.hasChildren
    ) {
      loadedDocumentNodeIds.add(documentNode.id)
    }
  }
  return [...parentNodeIds, ...loadedDocumentNodeIds]
}

/**
 * Resolves hierarchy tree node ids whose lazy-loaded document rows should reload after delete.
 * Deepest containers reload first so parent remerges do not preserve stale nested subtrees.
 * When the deleted row still has loaded children, refresh it first to drop promoted descendants.
 */
export function collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): string[] {
  const tree = treeNodes as I_faProjectHierarchyTreeHeTreeNode[]
  const bucket = findProjectHierarchyTreeDocumentParentBucket(tree, documentId)
  if (bucket === null) {
    return []
  }
  const containerNode = bucket.parentNode
  if (containerNode === null || !containerNode.childrenLoaded) {
    return []
  }
  const nodeIds: string[] = []
  if (containerNode.nodeKind === 'document' && containerNode.documentId !== null) {
    const promotionTargetBucket = findProjectHierarchyTreeDocumentParentBucket(
      tree,
      containerNode.documentId
    )
    const promotionTargetNode = promotionTargetBucket?.parentNode
    nodeIds.push(containerNode.id)
    if (
      promotionTargetNode !== null &&
      promotionTargetNode !== undefined &&
      promotionTargetNode.childrenLoaded
    ) {
      nodeIds.push(promotionTargetNode.id)
    }
    return nodeIds
  }
  nodeIds.push(containerNode.id)
  return nodeIds
}

function findProjectHierarchyTreeDocumentNodeById (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of nodes) {
    if (node.nodeKind === 'document' && node.documentId === documentId) {
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
