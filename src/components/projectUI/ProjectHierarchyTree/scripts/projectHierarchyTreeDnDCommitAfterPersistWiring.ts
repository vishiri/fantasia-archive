import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeDragSiblingOrderSnapshot,
  I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../functions/projectHierarchyTreeConstants'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'
import { refreshProjectHierarchyTreeDragCommitSourceContainer } from './projectHierarchyTreeDnDCommitWiring'
import { touchProjectHierarchyTreePreservedScrollTop } from './projectHierarchyTreeScrollPreserveWiring'
import { syncProjectHierarchyTreeOpenSetToPersist } from './projectHierarchyTreeUiStateWiring'

function projectHierarchyTreeDragCommitSuperseded (
  isDragCommitStillCurrent: (() => boolean) | undefined
): boolean {
  return isDragCommitStillCurrent?.() === false
}

export async function finalizeProjectHierarchyTreeDragCommitExpandState (deps: {
  clearDragSessionFlags: () => void
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  isDragCommitStillCurrent?: () => boolean
  expandedSnapshot: string[]
  flushUiStatePersist: () => void
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}): Promise<void> {
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  await deps.reapplyLatentDescendantExpandState()
  await deps.nextTick()
  await deps.nextTick()
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  deps.dragExpandUiFrozen.value = false
  await deps.nextTick()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  await deps.restoreExpandedSnapshot(
    deps.expandedSnapshot,
    PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  )
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  touchProjectHierarchyTreePreservedScrollTop()
  await deps.reapplyLatentDescendantExpandState()
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  deps.reapplyHeTreeOpenState()
  deps.flushUiStatePersist()
  deps.clearDragSessionFlags()
  await deps.nextTick()
  touchProjectHierarchyTreePreservedScrollTop()
  await new Promise<void>((resolve) => {
    deps.requestAnimationFrame(() => {
      resolve()
    })
  })
  if (projectHierarchyTreeDragCommitSuperseded(deps.isDragCommitStillCurrent)) {
    return
  }
  deps.reapplyHeTreeOpenState()
  await deps.reapplyLatentDescendantExpandState()
  deps.reapplyHeTreeOpenState()
  touchProjectHierarchyTreePreservedScrollTop()
  deps.dragExpandPostCommitGuard.value = false
}

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
  isDragCommitStillCurrent?: () => boolean
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
  if (deps.isDragCommitStillCurrent?.() === false) {
    return
  }
  const { effectiveExpandedSnapshot } = resolveProjectHierarchyTreeDragCommitExpandedSnapshot({
    commitResult: deps.commitResult,
    expandedSnapshot: deps.expandedSnapshot,
    expandedSnapshotSet: deps.expandedSnapshotSet
  })
  const effectiveExpandedSnapshotSet = new Set(effectiveExpandedSnapshot)
  // One expand restore only (in finalizeExpandState). Early remount+restore caused
  // nest/un-nest double scroll jumps while preserve lock lagged remounted containers.
  await refreshProjectHierarchyTreeDragCommitSourceContainer({
    committed: deps.commitResult.committed,
    dragParentDocumentIdAtDragStart: deps.dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    parentChangedFromDragStart: deps.parentChangedFromDragStart,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData
  })
  if (deps.isDragCommitStillCurrent?.() === false) {
    return
  }
  touchProjectHierarchyTreePreservedScrollTop()
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(
    deps.treeData.value
  )
  closeProjectHierarchyTreeEmptiedParentNodes({
    expandedSnapshotSet: effectiveExpandedSnapshotSet,
    markNodeClosed: deps.markNodeClosed,
    treeData: deps.treeData
  }, emptiedParentDocumentIds)
  await deps.reapplyLatentDescendantExpandState()
  const isDragCommitStillCurrent = deps.isDragCommitStillCurrent
  await finalizeProjectHierarchyTreeDragCommitExpandState({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    ...(isDragCommitStillCurrent === undefined
      ? {}
      : { isDragCommitStillCurrent }),
    expandedSnapshot: effectiveExpandedSnapshot,
    flushUiStatePersist: deps.flushUiStatePersist,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    requestAnimationFrame: deps.requestAnimationFrame,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
  if (deps.isDragCommitStillCurrent?.() === false) {
    return
  }
  if (deps.commitResult.committed) {
    syncProjectHierarchyTreeOpenSetToPersist({
      openNodeIds: deps.openNodeIds,
      queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
      treeData: deps.treeData
    })
    deps.flushUiStatePersist()
  }
}
