import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { publishProjectHierarchyTreeRootRevision } from '../functions/projectHierarchyTreeExpandState'

function collectProjectHierarchyTreeTagIds (
  nodes: I_faProjectHierarchyTreeHeTreeNode[]
): string[] {
  const ids: string[] = []
  for (const node of nodes) {
    if (node.nodeKind === 'tag' && typeof node.tagId === 'string') {
      ids.push(node.tagId)
    }
    ids.push(...collectProjectHierarchyTreeTagIds(node.children))
  }
  return ids
}

/**
 * After in-place tag patch: publish he-tree root revision when tags were removed
 * or same-membership sibling order changed (e.g. rename alphabetical re-sort).
 * Adds stay in-place only (revision caused full-tree flicker). Removals / reorder
 * need a root slice so virtualized Draggable updates rows; caller should treat
 * revision as structure mismatch so expand restore reopens worlds.
 */
export function publishProjectHierarchyTreeRootRevisionIfTagsRemoved (input: {
  nextTick: () => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeTagIdsBefore: string[]
}): boolean {
  const treeTagIdsAfter = collectProjectHierarchyTreeTagIds(input.treeData.value)
  const tagsRemoved = input.treeTagIdsBefore.some((tagId) => {
    return !treeTagIdsAfter.includes(tagId)
  })
  const sameMembership =
    input.treeTagIdsBefore.length === treeTagIdsAfter.length &&
    input.treeTagIdsBefore.every((tagId) => treeTagIdsAfter.includes(tagId))
  const orderChanged =
    sameMembership &&
    JSON.stringify(input.treeTagIdsBefore) !== JSON.stringify(treeTagIdsAfter)
  const needsRevision = tagsRemoved || orderChanged
  if (needsRevision) {
    input.suppressTreeEmit.value = true
    input.treeData.value = publishProjectHierarchyTreeRootRevision(input.treeData.value)
    void input.nextTick().then(() => {
      input.suppressTreeEmit.value = false
    })
  }
  return needsRevision
}

export { collectProjectHierarchyTreeTagIds }
