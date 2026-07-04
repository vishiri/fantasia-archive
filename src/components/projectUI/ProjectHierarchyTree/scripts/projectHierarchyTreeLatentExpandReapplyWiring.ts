import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { collectProjectHierarchyTreeLatentDocumentOpenNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import {
  collectExpandedNodeIdsFromTree,
  findProjectHierarchyTreeNodeById,
  needsProjectHierarchyTreeLazyLoadBeforeOpen
} from '../functions/projectHierarchyTreeExpandState'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

function reapplyProjectHierarchyTreeHeTreeOpenStateInline (deps: {
  getTreeRef: () => T_treeRef
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const treeRef = deps.getTreeRef()
  if (treeRef === null) {
    return
  }
  const expandedNodeIds = collectExpandedNodeIdsFromTree(
    deps.treeData.value,
    deps.openNodeIds.value
  )
  for (const nodeId of expandedNodeIds) {
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node === null) {
      continue
    }
    treeRef.openNodeAndParents(node)
  }
}

export async function reapplyProjectHierarchyTreeLatentDescendantExpandState (deps: {
  getTreeRef: () => T_treeRef
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const maxPasses = deps.openNodeIds.value.size + 2
  for (let pass = 0; pass < maxPasses; pass++) {
    for (const nodeId of deps.openNodeIds.value) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node !== null && needsProjectHierarchyTreeLazyLoadBeforeOpen(node)) {
        await deps.loadChildrenAlongRevealPath([nodeId])
      }
    }
    const effectivelyExpandedNodeIds = collectExpandedNodeIdsFromTree(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    for (const nodeId of effectivelyExpandedNodeIds) {
      await deps.loadChildrenAlongRevealPath([nodeId])
    }
    reapplyProjectHierarchyTreeHeTreeOpenStateInline(deps)
    const pendingLatentDocumentIds = collectProjectHierarchyTreeLatentDocumentOpenNodeIds(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    if (pendingLatentDocumentIds.length === 0) {
      break
    }
  }
}
