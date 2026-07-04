import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

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
