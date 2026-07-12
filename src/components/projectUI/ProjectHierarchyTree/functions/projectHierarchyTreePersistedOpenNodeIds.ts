import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

function findProjectHierarchyTreeNodeById (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const node of treeNodes) {
    if (node.id === nodeId) {
      return node
    }
    const nested = findProjectHierarchyTreeNodeById(node.children, nodeId)
    if (nested !== null) {
      return nested
    }
  }
  return null
}

function collectKnownNodeIds (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  output: Set<string>
): void {
  for (const node of nodes) {
    output.add(node.id)
    if (node.children.length > 0) {
      collectKnownNodeIds(node.children, output)
    }
  }
}

function collectProjectHierarchyTreeAncestorIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  targetNodeId: string
): string[] | null {
  function walk (
    nodes: I_faProjectHierarchyTreeHeTreeNode[],
    path: string[]
  ): string[] | null {
    for (const node of nodes) {
      if (node.id === targetNodeId) {
        return path
      }
      const nested = walk(node.children, [...path, node.id])
      if (nested !== null) {
        return nested
      }
    }
    return null
  }
  return walk(treeNodes, [])
}

function isProjectHierarchyTreeLazyPlaceholderNodeId (nodeId: string): boolean {
  return nodeId.endsWith('__lazy')
}

function isPersistedDocumentOpenNodeIdCandidate (nodeId: string): boolean {
  if (isProjectHierarchyTreeLazyPlaceholderNodeId(nodeId)) {
    return false
  }
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(nodeId)) {
    return true
  }
  return nodeId.startsWith('doc-')
}

function isProjectHierarchyTreeLatentDocumentOpenNodeId (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string
): boolean {
  if (!isPersistedDocumentOpenNodeIdCandidate(nodeId)) {
    return false
  }
  if (findProjectHierarchyTreeNodeById(treeNodes, nodeId) !== null) {
    return false
  }
  const skeletonIds = new Set<string>()
  collectKnownNodeIds(treeNodes, skeletonIds)
  return !skeletonIds.has(nodeId)
}

export function collectProjectHierarchyTreeLatentDocumentOpenNodeIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: Iterable<string>
): string[] {
  const output: string[] = []
  for (const nodeId of expandedNodeIds) {
    if (isProjectHierarchyTreeLatentDocumentOpenNodeId(treeNodes, nodeId)) {
      output.push(nodeId)
    }
  }
  return output
}

function isMissingLatentExpandAncestorOnly (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  ancestorId: string,
  openSet: ReadonlySet<string>
): boolean {
  if (openSet.has(ancestorId)) {
    return false
  }
  const ancestor = findProjectHierarchyTreeNodeById(treeNodes, ancestorId)
  if (ancestor === null) {
    return false
  }
  return ancestor.nodeKind === 'world' ||
    ancestor.nodeKind === 'templatePlacement' ||
    ancestor.nodeKind === 'document'
}

/**
 * True when a node id may stay in the persisted open set (world row may be absent while descendants remain).
 */
export function isProjectHierarchyTreeNodePersistableInOpenSet (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string,
  openSet: ReadonlySet<string>
): boolean {
  const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId)
  if (ancestors === null) {
    return false
  }
  for (const ancestorId of ancestors) {
    if (openSet.has(ancestorId)) {
      continue
    }
    if (!isMissingLatentExpandAncestorOnly(treeNodes, ancestorId, openSet)) {
      return false
    }
  }
  return true
}

function applyExpandedNodeIdsToTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const knownNodeIds = new Set<string>()
  collectKnownNodeIds(treeNodes, knownNodeIds)
  return expandedNodeIds.filter((nodeId) => knownNodeIds.has(nodeId))
}

/**
 * Filters persisted expanded ids to known nodes, keeping latent descendants under a collapsed world row.
 */
export function applyPersistedProjectHierarchyTreeOpenNodeIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const knownNodeIds = applyExpandedNodeIdsToTree(treeNodes, expandedNodeIds)
  const knownSet = new Set(knownNodeIds)
  const filteredKnownNodeIds = knownNodeIds.filter((nodeId) => {
    return isProjectHierarchyTreeNodePersistableInOpenSet(treeNodes, nodeId, knownSet)
  })
  const latentDocumentNodeIds = collectProjectHierarchyTreeLatentDocumentOpenNodeIds(
    treeNodes,
    expandedNodeIds
  )
  return [...new Set([...filteredKnownNodeIds, ...latentDocumentNodeIds])]
}

/**
 * Queues expanded ids from the in-memory open set, including descendants remembered under a collapsed world.
 */
export function collectProjectHierarchyTreePersistedExpandedNodeIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  const knownNodeIds: string[] = []
  for (const nodeId of openNodeIds) {
    if (findProjectHierarchyTreeNodeById(treeNodes, nodeId) !== null) {
      knownNodeIds.push(nodeId)
      continue
    }
    if (isProjectHierarchyTreeLatentDocumentOpenNodeId(treeNodes, nodeId)) {
      knownNodeIds.push(nodeId)
    }
  }
  const knownSet = new Set(knownNodeIds)
  return knownNodeIds.filter((nodeId) => {
    if (isProjectHierarchyTreeLatentDocumentOpenNodeId(treeNodes, nodeId)) {
      return true
    }
    return isProjectHierarchyTreeNodePersistableInOpenSet(treeNodes, nodeId, knownSet)
  })
}
