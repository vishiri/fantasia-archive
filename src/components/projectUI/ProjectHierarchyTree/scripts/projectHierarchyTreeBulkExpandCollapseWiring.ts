import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import {
  collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet,
  collectProjectHierarchyTreeBulkExpandCollapseSubtreeIds,
  collectProjectHierarchyTreeBulkExpandTargetIds
} from '../functions/projectHierarchyTreeBulkExpandCollapse'
import {
  evictProjectHierarchyTreeCollapsedSubtreeChildren,
  findProjectHierarchyTreeNodeById,
  publishProjectHierarchyTreeRootRevision
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
  evictProjectHierarchyTreeCollapsedSubtreeChildren(anchor)
}

async function runBulkExpandDeepPasses (deps: {
  anchorId: string
  isExpandGenerationCurrent: () => boolean
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
    if (!deps.isExpandGenerationCurrent()) {
      return
    }
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

async function runCollapseAllUnderNode (deps: {
  anchorId: string
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  reapplyHeTreeOpenState: () => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const pruneSet = collectProjectHierarchyTreeBulkCollapseOpenIdPruneSet(
    deps.treeData.value,
    deps.openNodeIds.value,
    deps.anchorId
  )
  const next = new Set(deps.openNodeIds.value)
  for (const pruneId of pruneSet) {
    next.delete(pruneId)
  }
  deps.openNodeIds.value = next
  evictCollapsedSubtreeChildren({
    anchorId: deps.anchorId,
    treeData: deps.treeData
  })
  deps.treeData.value = publishProjectHierarchyTreeRootRevision(deps.treeData.value)
  syncProjectHierarchyTreeOpenSetToPersist({
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    treeData: deps.treeData
  })
  deps.suppressTreeEmit.value = true
  await deps.nextTick()
  // closeAll then reopen remaining — reapply alone only opens, so virt rows stay visible.
  deps.getTreeRef()?.closeAll()
  deps.reapplyHeTreeOpenState()
  deps.suppressTreeEmit.value = false
}

export function createProjectHierarchyTreeBulkExpandCollapseWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
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
}) {
  let bulkExpandCollapseInFlight = false
  let bulkExpandCollapseGeneration = 0

  function isDragExpandFrozen (): boolean {
    return isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    })
  }

  function shouldIgnoreBulkExpand (): boolean {
    return bulkExpandCollapseInFlight || isDragExpandFrozen()
  }

  function expandAllUnderNode (anchorId: string): void {
    if (shouldIgnoreBulkExpand()) {
      return
    }
    bulkExpandCollapseInFlight = true
    const expandGeneration = ++bulkExpandCollapseGeneration
    mergeBulkExpandTargetIds({
      anchorId,
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    void (async () => {
      try {
        await deps.runDeferredLazyLoadBatch(async () => {
          if (expandGeneration !== bulkExpandCollapseGeneration) {
            return
          }
          await runBulkExpandDeepPasses({
            anchorId,
            isExpandGenerationCurrent: () => expandGeneration === bulkExpandCollapseGeneration,
            openNodeIds: deps.openNodeIds,
            queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
            reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
            treeData: deps.treeData
          })
        })
      } finally {
        if (expandGeneration === bulkExpandCollapseGeneration) {
          bulkExpandCollapseInFlight = false
        }
      }
    })()
  }

  async function collapseAllUnderNode (anchorId: string): Promise<void> {
    if (isDragExpandFrozen()) {
      return
    }
    // Preempt in-flight expand so context Collapse all is never a silent no-op.
    bulkExpandCollapseGeneration += 1
    bulkExpandCollapseInFlight = true
    try {
      await runCollapseAllUnderNode({
        anchorId,
        getTreeRef: deps.getTreeRef,
        nextTick: deps.nextTick,
        openNodeIds: deps.openNodeIds,
        queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
        reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
        suppressTreeEmit: deps.suppressTreeEmit,
        treeData: deps.treeData
      })
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
