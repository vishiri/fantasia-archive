import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Resolves tag row ids that should reload after document tag membership changes.
 * Loaded tags refresh in place; optional forceOpenTagIds also include unloaded rows
 * (new tags) so pending refresh can open and populate them.
 */
export function collectProjectHierarchyTreeLoadedTagNodeIdsForRefresh (
  treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[],
  tagIds: readonly string[],
  forceOpenTagIds: readonly string[] = []
): string[] {
  if (tagIds.length === 0) {
    return []
  }
  const targetTagIds = new Set(tagIds)
  const forceOpen = new Set(forceOpenTagIds)
  const tagNodeIds: string[] = []

  function visit (nodes: readonly I_faProjectHierarchyTreeHeTreeNode[]): void {
    for (const node of nodes) {
      if (
        node.nodeKind === 'tag' &&
        typeof node.tagId === 'string' &&
        targetTagIds.has(node.tagId) &&
        (node.childrenLoaded || forceOpen.has(node.tagId))
      ) {
        tagNodeIds.push(node.id)
      }
      if (node.children.length > 0) {
        visit(node.children)
      }
    }
  }

  visit(treeNodes)
  return tagNodeIds
}
