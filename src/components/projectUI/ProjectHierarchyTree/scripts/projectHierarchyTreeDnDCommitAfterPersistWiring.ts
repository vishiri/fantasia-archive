import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeDragCommitResult,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../functions/projectHierarchyTreeConstants'
import { finalizeProjectHierarchyTreeDragCommitExpandState } from './projectHierarchyTreeDnDCommitFinalizeWiring'
import { openProjectHierarchyTreeNestParentAfterDragDrop } from './projectHierarchyTreeNestParentOpenWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'

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
  expandedSnapshot: string[]
  expandedSnapshotSet: Set<string>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    expandedNodeIds: deps.expandedSnapshot,
    nextTick: deps.nextTick,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    restoreOptions: PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  })
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(
    deps.treeData.value
  )
  closeProjectHierarchyTreeEmptiedParentNodes({
    expandedSnapshotSet: deps.expandedSnapshotSet,
    markNodeClosed: deps.markNodeClosed,
    treeData: deps.treeData
  }, emptiedParentDocumentIds)
  if (
    deps.commitResult.committed &&
    deps.commitResult.nestParentDocumentId !== null
  ) {
    await openProjectHierarchyTreeNestParentAfterDragDrop({
      flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
      getTreeRef: deps.getTreeRef,
      loadChildrenForNode: deps.loadChildrenForNode,
      markNodeOpen: deps.markNodeOpen,
      nestParentDocumentId: deps.commitResult.nestParentDocumentId,
      nextTick: deps.nextTick,
      treeData: deps.treeData
    })
  }
  await deps.reapplyLatentDescendantExpandState()
  await finalizeProjectHierarchyTreeDragCommitExpandState({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    expandedSnapshot: deps.expandedSnapshot,
    flushUiStatePersist: deps.flushUiStatePersist,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    requestAnimationFrame: deps.requestAnimationFrame,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
}
