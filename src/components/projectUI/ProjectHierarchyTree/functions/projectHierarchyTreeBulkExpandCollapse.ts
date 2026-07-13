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

function collectProjectHierarchyTreeDescendantIds (
  node: I_faProjectHierarchyTreeHeTreeNode
): string[] {
  const output: string[] = []
  function walk (children: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const child of children) {
      output.push(child.id)
      if (child.children.length > 0) {
        walk(child.children)
      }
    }
  }
  walk(node.children)
  return output
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

function collectProjectHierarchyTreeLatentDocumentOpenNodeIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  const knownIds = new Set<string>()
  collectKnownNodeIds(treeNodes, knownIds)
  const output: string[] = []
  for (const openId of openNodeIds) {
    if (!knownIds.has(openId)) {
      output.push(openId)
    }
  }
  return output
}

function isStructuralBulkExpandCollapseKind (
  nodeKind: I_faProjectHierarchyTreeHeTreeNode['nodeKind']
): boolean {
  return nodeKind === 'world' ||
    nodeKind === 'group' ||
    nodeKind === 'templatePlacement' ||
    nodeKind === 'document'
}

function hasNonAddNewStructuralChild (
  node: Pick<I_faProjectHierarchyTreeHeTreeNode, 'children'>
): boolean {
  return node.children.some((child) => child.nodeKind !== 'addNewDocument')
}

/**
 * True when a row may show expand/collapse-all context menu actions.
 */
export function isProjectHierarchyTreeBulkExpandCollapseMenuEligible (
  node: I_faProjectHierarchyTreeHeTreeNode,
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
): boolean {
  if (!isStructuralBulkExpandCollapseKind(node.nodeKind)) {
    return false
  }
  if (hasNonAddNewStructuralChild(node)) {
    return true
  }
  if (node.nodeKind === 'document' && node.hasChildren) {
    return true
  }
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, node.id)
  if (anchor === null) {
    return false
  }
  return collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds(treeNodes, node.id).length > 1
}

/**
 * Anchor id plus every descendant id present in the current tree model.
 */
export function collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  anchorId: string
): string[] {
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, anchorId)
  if (anchor === null) {
    return []
  }
  const output: string[] = [anchorId]
  for (const descendantId of collectProjectHierarchyTreeDescendantIds(anchor)) {
    output.push(descendantId)
  }
  return output
}

function collectExpandedPlacementSiblingIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  anchorPlacementId: string,
  openNodeIds: ReadonlySet<string>
): string[] {
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, anchorPlacementId)
  if (anchor === null || anchor.nodeKind !== 'templatePlacement') {
    return []
  }
  const groupId = anchor.groupId
  const output: string[] = []
  function walk (nodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      if (
        node.nodeKind === 'templatePlacement' &&
        node.id !== anchorPlacementId &&
        node.groupId === groupId &&
        openNodeIds.has(node.id)
      ) {
        output.push(node.id)
      }
      if (node.children.length > 0) {
        walk(node.children)
      }
    }
  }
  walk(treeNodes)
  return output
}

function shouldPruneLatentOpenNodeIdOnBulkCollapse (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>,
  anchorId: string,
  latentNodeId: string
): boolean {
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, anchorId)
  if (anchor === null || !openNodeIds.has(latentNodeId)) {
    return false
  }
  if (anchor.nodeKind === 'templatePlacement') {
    const expandedSiblingPlacementIds = collectExpandedPlacementSiblingIds(
      treeNodes,
      anchorId,
      openNodeIds
    )
    if (expandedSiblingPlacementIds.length > 0) {
      return false
    }
  }
  return collectProjectHierarchyTreeLatentDocumentOpenNodeIds(treeNodes, openNodeIds)
    .includes(latentNodeId)
}

/**
 * Open-node ids to remove when collapsing the anchor row and its subtree.
 */
export function collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>,
  anchorId: string
): Set<string> {
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, anchorId)
  if (anchor === null) {
    return new Set()
  }
  const prune = new Set<string>(collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds(
    treeNodes,
    anchorId
  ))
  const anchorAncestorIds = new Set(
    collectProjectHierarchyTreeAncestorIds(treeNodes, anchorId) ?? []
  )
  for (const openId of openNodeIds) {
    if (prune.has(openId) || anchorAncestorIds.has(openId)) {
      continue
    }
    const knownNode = findProjectHierarchyTreeNodeById(treeNodes, openId)
    if (knownNode !== null) {
      const openAncestors = collectProjectHierarchyTreeAncestorIds(treeNodes, openId) ?? []
      if (openAncestors.includes(anchorId)) {
        prune.add(openId)
      }
      continue
    }
    if (shouldPruneLatentOpenNodeIdOnBulkCollapse(treeNodes, openNodeIds, anchorId, openId)) {
      prune.add(openId)
    }
  }
  return prune
}

function isBulkExpandTargetNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  if (node.nodeKind === 'addNewDocument') {
    return false
  }
  if (node.nodeKind === 'world' || node.nodeKind === 'group' || node.nodeKind === 'templatePlacement') {
    return true
  }
  return node.nodeKind === 'document' && node.hasChildren
}

/**
 * Open-node ids to add when expanding the anchor row and its subtree.
 */
export function collectProjectHierarchyTreeBulkExpandTargetIds (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  anchorId: string
): string[] {
  const anchor = findProjectHierarchyTreeNodeById(treeNodes, anchorId)
  if (anchor === null) {
    return []
  }
  const targets = new Set<string>()
  function walk (node: I_faProjectHierarchyTreeHeTreeNode): void {
    if (!isBulkExpandTargetNode(node)) {
      return
    }
    targets.add(node.id)
    for (const child of node.children) {
      walk(child)
    }
  }
  walk(anchor)
  const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, anchorId) ?? []
  for (const ancestorId of ancestors) {
    targets.add(ancestorId)
  }
  return [...targets]
}
