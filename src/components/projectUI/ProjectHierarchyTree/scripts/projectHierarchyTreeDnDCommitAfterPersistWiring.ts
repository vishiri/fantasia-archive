import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../functions/projectHierarchyTreeConstants'
import { finalizeProjectHierarchyTreeDragCommitExpandState } from './projectHierarchyTreeDnDCommitFinalizeWiring'
import { refreshProjectHierarchyTreeDragCommitSourceContainer } from './projectHierarchyTreeDnDCommitReloadWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { syncProjectHierarchyTreeOpenSetToPersist } from './projectHierarchyTreeUiStateWiring'

function resolveProjectHierarchyTreeDragCommitExpandedSnapshot (input: {
  commitResult: I_faProjectHierarchyTreeDragCommitResult
  expandedSnapshot: string[]
  expandedSnapshotSet: Set<string>
}): {
    effectiveExpandedSnapshot: string[]
    nestParentDocumentId: string | null
    shouldOpenNestParentAfterDragDrop: boolean
  } {
  const nestParentDocumentId = input.commitResult.nestParentDocumentId
  const shouldOpenNestParentAfterDragDrop =
    input.commitResult.committed &&
    nestParentDocumentId !== null &&
    !input.expandedSnapshotSet.has(nestParentDocumentId)
  const effectiveExpandedSnapshot = shouldOpenNestParentAfterDragDrop
    ? [...new Set([...input.expandedSnapshot, nestParentDocumentId])]
    : input.expandedSnapshot
  return {
    effectiveExpandedSnapshot,
    nestParentDocumentId,
    shouldOpenNestParentAfterDragDrop
  }
}

function closeProjectHierarchyTreeEmptiedParentNodes (deps: {
  expandedSnapshotSet: Set<string>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}, emptiedParentDocumentIds: string[]): void {
  for (const nodeId of emptiedParentDocumentIds) {
    if (deps.expandedSnapshotSet.has(nodeId)) {
      continue
    }
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node !== null) {
      deps.markNodeClosed(nodeId, node)
    }
  }
}

export async function finalizeProjectHierarchyTreeDragCommitAfterPersist (deps: {
  clearDragSessionFlags: () => void
  commitResult: I_faProjectHierarchyTreeDragCommitResult
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  expandedSnapshot: string[]
  expandedSnapshotSet: Set<string>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  parentChangedFromDragStart: boolean
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  const { effectiveExpandedSnapshot } = resolveProjectHierarchyTreeDragCommitExpandedSnapshot({
    commitResult: deps.commitResult,
    expandedSnapshot: deps.expandedSnapshot,
    expandedSnapshotSet: deps.expandedSnapshotSet
  })
  const effectiveExpandedSnapshotSet = new Set(effectiveExpandedSnapshot)
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    expandedNodeIds: effectiveExpandedSnapshot,
    nextTick: deps.nextTick,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    restoreOptions: PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  })
  await refreshProjectHierarchyTreeDragCommitSourceContainer({
    committed: deps.commitResult.committed,
    dragParentDocumentIdAtDragStart: deps.dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    parentChangedFromDragStart: deps.parentChangedFromDragStart,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData
  })
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(
    deps.treeData.value
  )
  closeProjectHierarchyTreeEmptiedParentNodes({
    expandedSnapshotSet: effectiveExpandedSnapshotSet,
    markNodeClosed: deps.markNodeClosed,
    treeData: deps.treeData
  }, emptiedParentDocumentIds)
  await deps.reapplyLatentDescendantExpandState()
  await finalizeProjectHierarchyTreeDragCommitExpandState({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    expandedSnapshot: effectiveExpandedSnapshot,
    flushUiStatePersist: deps.flushUiStatePersist,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    requestAnimationFrame: deps.requestAnimationFrame,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
  if (deps.commitResult.committed) {
    syncProjectHierarchyTreeOpenSetToPersist({
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    deps.flushUiStatePersist()
  }
}
