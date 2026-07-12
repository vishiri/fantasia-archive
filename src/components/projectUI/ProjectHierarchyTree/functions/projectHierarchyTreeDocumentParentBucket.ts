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
    if (node.nodeKind === 'document' && node.id === documentId) {
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
 */
export function collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): string[] {
  const bucket = findProjectHierarchyTreeDocumentParentBucket(
    treeNodes as I_faProjectHierarchyTreeHeTreeNode[],
    documentId
  )
  if (bucket === null) {
    return []
  }
  const containerNode = bucket.parentNode
  if (containerNode === null || !containerNode.childrenLoaded) {
    return []
  }
  const nodeIds = new Set<string>()
  if (containerNode.nodeKind === 'document' && containerNode.documentId !== null) {
    const promotionTargetBucket = findProjectHierarchyTreeDocumentParentBucket(
      treeNodes as I_faProjectHierarchyTreeHeTreeNode[],
      containerNode.documentId
    )
    const promotionTargetNode = promotionTargetBucket?.parentNode
    if (promotionTargetNode !== null && promotionTargetNode !== undefined && promotionTargetNode.childrenLoaded) {
      nodeIds.add(promotionTargetNode.id)
    }
    nodeIds.add(containerNode.id)
    return [...nodeIds]
  }
  nodeIds.add(containerNode.id)
  return [...nodeIds]
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
    if (parentNode === null || !parentNode.childrenLoaded) {
      return []
    }
    return [parentNode.id]
  }
  const placementNode = findProjectHierarchyTreeTemplatePlacementNodeForCreateRefresh(
    tree,
    input.worldId,
    input.templateId
  )
  if (placementNode === null || !placementNode.childrenLoaded) {
    return []
  }
  return [placementNode.id]
}
