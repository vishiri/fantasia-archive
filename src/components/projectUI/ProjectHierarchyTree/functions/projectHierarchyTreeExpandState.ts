import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * True when collapsing a row should keep descendant expand ids for lazy reapply on reopen.
 * Force-sublevel-collapse always clears descendants so nested nodes reopen closed.
 */
export function shouldProjectHierarchyTreePreserveDescendantOpenIdsOnCollapse (
  nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind'],
  forceSublevelCollapseInTree = false
): boolean {
  if (forceSublevelCollapseInTree) {
    return false
  }
  return nodeKind === 'world' ||
    nodeKind === 'group' ||
    nodeKind === 'templatePlacement' ||
    nodeKind === 'document'
}

/**
 * Finds a node reference by id in the current tree model.
 */
export function findProjectHierarchyTreeNodeById (
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

function isProjectHierarchyTreeNodeEffectivelyExpanded (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  nodeId: string,
  openNodeIds: ReadonlySet<string>
): boolean {
  if (!openNodeIds.has(nodeId)) {
    return false
  }
  const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId)
  if (ancestors === null) {
    return false
  }
  return ancestors.every((ancestorId) => openNodeIds.has(ancestorId))
}

function collectExpandedNodeIdsFromSubtree (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>,
  output: string[]
): void {
  for (const node of nodes) {
    if (isProjectHierarchyTreeNodeEffectivelyExpanded(treeNodes, node.id, openNodeIds)) {
      output.push(node.id)
    }
    if (node.children.length > 0) {
      collectExpandedNodeIdsFromSubtree(node.children, treeNodes, openNodeIds, output)
    }
  }
}

/**
 * Collects expanded node ids present in the open set for known tree nodes.
 */
export function collectExpandedNodeIdsFromTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  const output: string[] = []
  collectExpandedNodeIdsFromSubtree(treeNodes, treeNodes, openNodeIds, output)
  return output
}

/**
 * Collects descendant node ids for collapse pruning (direct and nested children).
 */
export function collectProjectHierarchyTreeDescendantIds (
  node: I_faProjectHierarchyTreeHeTreeNode
): string[] {
  const output: string[] = []
  function walk (current: I_faProjectHierarchyTreeHeTreeNode): void {
    for (const child of current.children) {
      output.push(child.id)
      walk(child)
    }
  }
  walk(node)
  return output
}

function pruneExpandedNodeIds (
  expandedNodeIds: string[],
  knownNodeIds: ReadonlySet<string>
): string[] {
  return expandedNodeIds.filter((nodeId) => knownNodeIds.has(nodeId))
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

/**
 * Drops expanded ids whose ancestors are not also expanded (stale persist after parent collapse).
 */
export function pruneProjectHierarchyTreeExpandedNodeIdsToAncestors (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const expandedSet = new Set(expandedNodeIds)
  return expandedNodeIds.filter((nodeId) => {
    return isProjectHierarchyTreeNodeEffectivelyExpanded(treeNodes, nodeId, expandedSet)
  })
}

/**
 * Filters persisted expanded ids to nodes that still exist in the current skeleton.
 */
export function applyExpandedNodeIdsToTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const knownNodeIds = new Set<string>()
  collectKnownNodeIds(treeNodes, knownNodeIds)
  return pruneExpandedNodeIds(expandedNodeIds, knownNodeIds)
}

/**
 * Expands a restore id list with ancestor rows required for nested expand paths.
 */
export function expandProjectHierarchyTreeExpandedNodeIdsWithAncestors (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  expandedNodeIds: string[]
): string[] {
  const knownNodeIds = applyExpandedNodeIdsToTree(treeNodes, expandedNodeIds)
  const expandedSet = new Set(knownNodeIds)
  for (const nodeId of knownNodeIds) {
    const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId) ?? []
    for (const ancestorId of ancestors) {
      expandedSet.add(ancestorId)
    }
  }
  return [...expandedSet]
}

/**
 * Clears loaded document subtrees when a node collapses.
 */
export function evictCollapsedNodeChildren (
  node: I_faProjectHierarchyTreeHeTreeNode
): void {
  if (node.nodeKind === 'world' || node.nodeKind === 'group') {
    return
  }
  node.children = []
  node.childrenLoaded = false
}

/**
 * Evicts lazy-loaded placement and document children under a collapsed subtree.
 */
export function evictProjectHierarchyTreeCollapsedSubtreeChildren (
  anchor: I_faProjectHierarchyTreeHeTreeNode
): void {
  function walk (node: I_faProjectHierarchyTreeHeTreeNode): void {
    if (
      node.nodeKind === 'templatePlacement' ||
      node.nodeKind === 'document'
    ) {
      evictCollapsedNodeChildren(node)
    }
    for (const child of node.children) {
      walk(child)
    }
  }
  walk(anchor)
}

/**
 * True when expand must await IPC child load before he-tree should open the row.
 */
export function needsProjectHierarchyTreeLazyLoadBeforeOpen (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.hasChildren && !node.childrenLoaded
}

/**
 * Shallow-clones the tree root so he-tree picks up lazy-loaded child rows.
 */
export function publishProjectHierarchyTreeRootRevision (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): I_faProjectHierarchyTreeHeTreeNode[] {
  return treeNodes.slice()
}

/**
 * Collects ancestor node ids from root to the target node (exclusive of target).
 */
export function collectProjectHierarchyTreeAncestorIds (
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
