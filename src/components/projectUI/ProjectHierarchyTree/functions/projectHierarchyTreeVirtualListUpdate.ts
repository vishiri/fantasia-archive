/**
 * Calls @virtual-list/vue update on he-tree's internal vtlist ref.
 * VirtualList skips its own onscroll remount when scroll delta stays under
 * buffer-10; hierarchy scroll listener forces update so rows fill the viewport.
 */
import type { I_faProjectHierarchyTreeHeTreeInstance } from 'app/types/I_faProjectHierarchyTreeDomain'

export function requestProjectHierarchyTreeVirtualListUpdate (
  treeInstance: I_faProjectHierarchyTreeHeTreeInstance | null | undefined
): void {
  treeInstance?.$refs?.vtlist?.update?.()
}
