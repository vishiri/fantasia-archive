import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectExpandedNodeIdsFromTree,
  collectProjectHierarchyTreeAncestorIds,
  findProjectHierarchyTreeNodeById,
  needsProjectHierarchyTreeLazyLoadBeforeOpen
} from '../functions/projectHierarchyTreeExpandState'
import { shouldReloadProjectHierarchyTreeNodeChildren } from '../functions/projectHierarchyTreeLazyLoadChildReload'
import { collectProjectHierarchyTreeLatentDocumentOpenNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import { tryOpenHeTreeNodeAndParents } from './projectHierarchyTreeHeTreeOpenSafeWiring'

type T_treeRef = I_faProjectHierarchyTreeHeTreeInstance | null

function collectShallowFirstOpenNodeIdsNeedingLazyLoad (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  const needingLoad: { depth: number, nodeId: string }[] = []
  for (const nodeId of openNodeIds) {
    const node = findProjectHierarchyTreeNodeById(treeNodes, nodeId)
    if (node === null) {
      continue
    }
    if (!shouldReloadProjectHierarchyTreeNodeChildren(node)) {
      continue
    }
    const ancestorDepth = collectProjectHierarchyTreeAncestorIds(treeNodes, nodeId)?.length ?? 0
    needingLoad.push({
      depth: ancestorDepth,
      nodeId
    })
  }
  needingLoad.sort((left, right) => {
    if (left.depth !== right.depth) {
      return left.depth - right.depth
    }
    return left.nodeId.localeCompare(right.nodeId)
  })
  return needingLoad.map((row) => row.nodeId)
}

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
    tryOpenHeTreeNodeAndParents({
      node,
      treeRef
    })
  }
}

/**
 * Reapplies remembered descendant expand ids after a parent row reopens.
 */
export async function reapplyProjectHierarchyTreeLatentDescendantExpandState (deps: {
  getTreeRef: () => T_treeRef
  loadChildrenAlongRevealPath: (nodeIds: string[]) => Promise<void>
  openNodeIds: Ref<Set<string>>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const maxPasses = deps.openNodeIds.value.size + 2
  let previousStallKey = ''
  for (let pass = 0; pass < maxPasses; pass++) {
    const shallowFirstNeedingLoad = collectShallowFirstOpenNodeIdsNeedingLazyLoad(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    const pendingLatentDocumentIds = collectProjectHierarchyTreeLatentDocumentOpenNodeIds(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    const stallKey = [
      ...shallowFirstNeedingLoad,
      ...pendingLatentDocumentIds
    ].join('|')
    if (stallKey === previousStallKey && stallKey !== '') {
      break
    }
    previousStallKey = stallKey

    for (const nodeId of deps.openNodeIds.value) {
      const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
      if (node !== null && needsProjectHierarchyTreeLazyLoadBeforeOpen(node)) {
        await deps.loadChildrenAlongRevealPath([nodeId])
      }
    }
    for (const nodeId of shallowFirstNeedingLoad) {
      const ancestors = collectProjectHierarchyTreeAncestorIds(deps.treeData.value, nodeId) ?? []
      await deps.loadChildrenAlongRevealPath([...ancestors, nodeId])
    }
    const effectivelyExpandedNodeIds = collectExpandedNodeIdsFromTree(
      deps.treeData.value,
      deps.openNodeIds.value
    )
    for (const nodeId of effectivelyExpandedNodeIds) {
      await deps.loadChildrenAlongRevealPath([nodeId])
    }
    reapplyProjectHierarchyTreeHeTreeOpenStateInline(deps)
    const stillNeedsLazyLoad = collectShallowFirstOpenNodeIdsNeedingLazyLoad(
      deps.treeData.value,
      deps.openNodeIds.value
    ).length > 0
    if (pendingLatentDocumentIds.length === 0 && !stillNeedsLazyLoad) {
      break
    }
  }
}
