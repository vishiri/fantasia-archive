import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Stable he-tree / virtual-list key for workspace hierarchy rows (not flat index).
 */
export function resolveProjectHierarchyTreeHeTreeNodeKey (
  stat: { data: I_faProjectHierarchyTreeHeTreeNode },
  _index: number
): string {
  return stat.data.id
}
