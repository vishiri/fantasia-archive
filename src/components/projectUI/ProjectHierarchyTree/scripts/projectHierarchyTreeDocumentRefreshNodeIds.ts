import type {
  I_faProjectHierarchyTreeDocumentParentBucket,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  findProjectHierarchyTreeDocumentParentBucket,
  isProjectHierarchyTreeDocumentParentBucketMatch
} from '../functions/projectHierarchyTreeDocumentParentBucket'

function visitProjectHierarchyTreeDocumentParentBuckets (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  parentContext: {
    parentDocumentId: string | null
    parentNode: I_faProjectHierarchyTreeHeTreeNode | null
  },
  visit: (bucket: I_faProjectHierarchyTreeDocumentParentBucket) => void
): void {
  for (const node of nodes) {
    if (isProjectHierarchyTreeDocumentParentBucketMatch(node, documentId, null)) {
      const parentDocumentId = parentContext.parentDocumentId
      const parentNode = parentContext.parentNode
      visit({
        children: nodes,
        parentDocumentId,
        parentNode
      })
    }
    const nestedParentDocumentId = node.nodeKind === 'document' ? node.documentId : null
    visitProjectHierarchyTreeDocumentParentBuckets(
      node.children,
      documentId,
      {
        parentDocumentId: nestedParentDocumentId,
        parentNode: node
      },
      visit
    )
  }
}

function collectLoadedProjectHierarchyTreeDocumentNodeIds (
  nodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string,
  loadedDocumentNodeIds: Set<string>
): void {
  for (const node of nodes) {
    if (
      node.nodeKind === 'document' &&
      node.documentId === documentId &&
      node.childrenLoaded &&
      node.hasChildren
    ) {
      loadedDocumentNodeIds.add(node.id)
    }
    collectLoadedProjectHierarchyTreeDocumentNodeIds(node.children, documentId, loadedDocumentNodeIds)
  }
}

/**
 * Resolves parent container node ids whose lazy-loaded document rows should reload.
 * Every loaded copy is included, including a tag branch and the main-tree row.
 * When the saved document itself has loaded children, its node id is appended after
 * parent buckets so a parent remerge cannot leave an expanded subtree stale.
 */
export function collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentIds: readonly string[]
): string[] {
  const parentNodeIds = new Set<string>()
  const loadedDocumentNodeIds = new Set<string>()
  const tree = treeNodes as I_faProjectHierarchyTreeHeTreeNode[]
  for (const documentId of documentIds) {
    visitProjectHierarchyTreeDocumentParentBuckets(
      tree,
      documentId,
      {
        parentDocumentId: null,
        parentNode: null
      },
      (bucket) => {
        const parentNode = bucket.parentNode
        if (parentNode !== null && parentNode.childrenLoaded) {
          parentNodeIds.add(parentNode.id)
        }
      }
    )
    collectLoadedProjectHierarchyTreeDocumentNodeIds(tree, documentId, loadedDocumentNodeIds)
  }
  return [...parentNodeIds, ...loadedDocumentNodeIds]
}

function pushProjectHierarchyTreeRefreshNodeId (
  nodeIds: string[],
  seenNodeIds: Set<string>,
  nodeId: string
): void {
  if (seenNodeIds.has(nodeId)) {
    return
  }
  seenNodeIds.add(nodeId)
  nodeIds.push(nodeId)
}

function appendProjectHierarchyTreeDeleteRefreshNodeIds (
  tree: I_faProjectHierarchyTreeHeTreeNode[],
  bucket: I_faProjectHierarchyTreeDocumentParentBucket,
  nodeIds: string[],
  seenNodeIds: Set<string>
): void {
  const containerNode = bucket.parentNode
  if (containerNode === null || !containerNode.childrenLoaded) {
    return
  }
  pushProjectHierarchyTreeRefreshNodeId(nodeIds, seenNodeIds, containerNode.id)
  if (containerNode.nodeKind !== 'document' || containerNode.documentId === null) {
    return
  }
  const promotionTargetBucket = findProjectHierarchyTreeDocumentParentBucket(
    tree,
    containerNode.documentId,
    {
      parentDocumentId: null,
      parentNode: null
    },
    {
      preferredNodeId: containerNode.id
    }
  )
  const promotionTargetNode = promotionTargetBucket?.parentNode
  if (promotionTargetNode === null || promotionTargetNode === undefined) {
    return
  }
  if (!promotionTargetNode.childrenLoaded) {
    return
  }
  pushProjectHierarchyTreeRefreshNodeId(nodeIds, seenNodeIds, promotionTargetNode.id)
}

/**
 * Resolves hierarchy tree node ids whose lazy-loaded document rows should reload after delete.
 * Every loaded copy is included so a tag-first twin does not hide the main-tree parent.
 * Deepest containers reload first so parent remerges do not preserve stale nested subtrees.
 */
export function collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  documentId: string
): string[] {
  const tree = treeNodes as I_faProjectHierarchyTreeHeTreeNode[]
  const nodeIds: string[] = []
  const seenNodeIds = new Set<string>()
  visitProjectHierarchyTreeDocumentParentBuckets(
    tree,
    documentId,
    {
      parentDocumentId: null,
      parentNode: null
    },
    (bucket) => {
      appendProjectHierarchyTreeDeleteRefreshNodeIds(tree, bucket, nodeIds, seenNodeIds)
    }
  )
  return nodeIds
}
