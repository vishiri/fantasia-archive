import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

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
 * Flat preorder of hierarchy rows currently visible in the sidebar tree (respects expand state).
 */
export function collectProjectHierarchyTreeVisibleFlatNodes (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): I_faProjectHierarchyTreeHeTreeNode[] {
  const output: I_faProjectHierarchyTreeHeTreeNode[] = []
  function walk (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      output.push(node)
      if (
        node.children.length > 0 &&
        isProjectHierarchyTreeNodeEffectivelyExpanded(treeNodes, node.id, openNodeIds)
      ) {
        walk(node.children)
      }
    }
  }
  walk(treeNodes)
  return output
}

/**
 * Join of visible flat row ids — virtual-list size cache invalidates when this changes.
 */
export function buildProjectHierarchyTreeVisibleFlatVirtualScrollKey (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string {
  return collectProjectHierarchyTreeVisibleFlatNodes(treeNodes, openNodeIds)
    .map((node) => node.id)
    .join('|')
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

function isMissingWorldAncestorOnly (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  ancestorId: string,
  openSet: ReadonlySet<string>
): boolean {
  if (openSet.has(ancestorId)) {
    return false
  }
  const ancestor = findProjectHierarchyTreeNodeById(treeNodes, ancestorId)
  return ancestor?.nodeKind === 'world'
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
    if (!isMissingWorldAncestorOnly(treeNodes, ancestorId, openSet)) {
      return false
    }
  }
  return true
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
  return knownNodeIds.filter((nodeId) => {
    return isProjectHierarchyTreeNodePersistableInOpenSet(treeNodes, nodeId, knownSet)
  })
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
    }
  }
  const knownSet = new Set(knownNodeIds)
  return knownNodeIds.filter((nodeId) => {
    return isProjectHierarchyTreeNodePersistableInOpenSet(treeNodes, nodeId, knownSet)
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
