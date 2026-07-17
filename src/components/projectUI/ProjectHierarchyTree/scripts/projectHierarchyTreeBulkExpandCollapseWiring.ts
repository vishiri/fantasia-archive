import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import {
  collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet,
  collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds,
  collectProjectHierarchyTreeBulkExpandTargetIds
} from '../functions/projectHierarchyTreeBulkExpandCollapse'
import {
  evictCollapsedNodeChildren,
  findProjectHierarchyTreeNodeById
} from '../functions/projectHierarchyTreeExpandState'
import { syncProjectHierarchyTreeOpenSetToPersist } from './projectHierarchyTreeUiStateWiring'

function mergeBulkExpandTargetIds (deps: {
  anchorId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const targetIds = collectProjectHierarchyTreeBulkExpandTargetIds(
    deps.treeData.value,
    deps.anchorId
  )
  const next = new Set(deps.openNodeIds.value)
  for (const targetId of targetIds) {
    next.add(targetId)
  }
  deps.openNodeIds.value = next
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
}

function evictCollapsedSubtreeChildren (deps: {
  anchorId: string
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  const anchor = findProjectHierarchyTreeNodeById(deps.treeData.value, deps.anchorId)
  if (anchor === null) {
    return
  }
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

async function runBulkExpandDeepPasses (deps: {
  anchorId: string
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  reapplyLatentDescendantExpandState: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const maxPasses = Math.max(
    8,
    collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds(
      deps.treeData.value,
      deps.anchorId
    ).length + 2
  )
  for (let pass = 0; pass < maxPasses; pass++) {
    const openCountBeforePass = deps.openNodeIds.value.size
    await deps.reapplyLatentDescendantExpandState({ deferHeTreeOpen: true })
    mergeBulkExpandTargetIds({
      anchorId: deps.anchorId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    if (deps.openNodeIds.value.size === openCountBeforePass) {
      break
    }
  }
}

export function createProjectHierarchyTreeBulkExpandCollapseWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: (options?: {
    deferHeTreeOpen?: boolean
  }) => Promise<void>
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
}) {
  let bulkExpandCollapseInFlight = false

  function shouldIgnoreBulkExpandCollapse (): boolean {
    return bulkExpandCollapseInFlight ||
      isProjectHierarchyTreeDragExpandUiFrozen({
        dragExpandUiFrozen: deps.dragExpandUiFrozen.value
      })
  }

  function expandAllUnderNode (anchorId: string): void {
    if (shouldIgnoreBulkExpandCollapse()) {
      return
    }
    bulkExpandCollapseInFlight = true
    mergeBulkExpandTargetIds({
      anchorId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    void (async () => {
      try {
        await deps.runDeferredLazyLoadBatch(async () => {
          await runBulkExpandDeepPasses({
            anchorId,
            openNodeIds: deps.openNodeIds,
            queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
            reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
            treeData: deps.treeData
          })
        })
      } finally {
        bulkExpandCollapseInFlight = false
      }
    })()
  }

  async function collapseAllUnderNode (anchorId: string): Promise<void> {
    if (shouldIgnoreBulkExpandCollapse()) {
      return
    }
    bulkExpandCollapseInFlight = true
    try {
      const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
        deps.treeData.value,
        deps.openNodeIds.value,
        anchorId
      )
      const next = new Set(deps.openNodeIds.value)
      for (const pruneId of pruneSet) {
        next.delete(pruneId)
      }
      deps.openNodeIds.value = next
      evictCollapsedSubtreeChildren({
        anchorId,
        treeData: deps.treeData
      })
      syncProjectHierarchyTreeOpenSetToPersist({
        openNodeIds: deps.openNodeIds,
        queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
        treeData: deps.treeData
      })
      deps.suppressTreeEmit.value = true
      deps.treeMountKey.value += 1
      await deps.nextTick()
      deps.reapplyHeTreeOpenState()
      deps.suppressTreeEmit.value = false
    } finally {
      bulkExpandCollapseInFlight = false
    }
  }

  function isBulkExpandCollapseInFlight (): boolean {
    return bulkExpandCollapseInFlight
  }

  return {
    collapseAllUnderNode,
    expandAllUnderNode,
    isBulkExpandCollapseInFlight
  }
}
