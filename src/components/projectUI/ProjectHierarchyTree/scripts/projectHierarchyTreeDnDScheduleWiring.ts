import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  shouldRunDragLayoutCommit,
  shouldScheduleDragLayoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS } from '../functions/projectHierarchyTreeConstants'
import { commitProjectHierarchyTreeDraggedDocumentMove } from './projectHierarchyTreeDnDCommitWiring'
import { openProjectHierarchyTreeNestParentAfterDragDrop } from './projectHierarchyTreeNestParentOpenWiring'
import { remountProjectHierarchyTreeAndRestoreExpandedSnapshot } from './projectHierarchyTreeMountRemountWiring'
import { finalizeProjectHierarchyTreeDragCommitExpandState } from './projectHierarchyTreeDnDCommitFinalizeWiring'
import { findProjectHierarchyTreeNodeById } from '../functions/projectHierarchyTreeExpandState'

type T_projectHierarchyTreeDragCommitScheduleDeps = {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  draggedDocumentId: () => string | null
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  loadChildrenForNode: (node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  refreshLayout: () => Promise<void>
  removeDragCancelListeners: () => void
  requestAnimationFrame: (callback: () => void) => number
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function finishProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps
): Promise<void> {
  deps.dragCommitPending.value = false
  deps.dragCommitScheduled.value = false
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  if (!shouldRunDragLayoutCommit({
    suppressTreeEmit: deps.suppressTreeEmit.value
  })) {
    deps.dragExpandUiFrozen.value = false
    return
  }
  const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
  const expandedSnapshotSet = new Set(expandedSnapshot)
  const commitResult = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: deps.draggedDocumentId(),
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    treeData: deps.treeData.value
  })
  await remountProjectHierarchyTreeAndRestoreExpandedSnapshot({
    expandedNodeIds: expandedSnapshot,
    nextTick: deps.nextTick,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    restoreOptions: PROJECT_HIERARCHY_TREE_DRAG_EXPAND_SNAPSHOT_RESTORE_OPTIONS
  })
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(
    deps.treeData.value
  )
  for (const nodeId of emptiedParentDocumentIds) {
    if (expandedSnapshotSet.has(nodeId)) {
      continue
    }
    const node = findProjectHierarchyTreeNodeById(deps.treeData.value, nodeId)
    if (node !== null) {
      deps.markNodeClosed(nodeId, node)
    }
  }
  if (
    commitResult.committed &&
    commitResult.nestParentDocumentId !== null
  ) {
    await openProjectHierarchyTreeNestParentAfterDragDrop({
      flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
      getTreeRef: deps.getTreeRef,
      loadChildrenForNode: deps.loadChildrenForNode,
      markNodeOpen: deps.markNodeOpen,
      nestParentDocumentId: commitResult.nestParentDocumentId,
      nextTick: deps.nextTick,
      treeData: deps.treeData
    })
  }
  await deps.reapplyLatentDescendantExpandState()
  await finalizeProjectHierarchyTreeDragCommitExpandState({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    expandedSnapshot,
    flushUiStatePersist: deps.flushUiStatePersist,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    requestAnimationFrame: deps.requestAnimationFrame,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
}

export function scheduleProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps
): void {
  if (!shouldScheduleDragLayoutCommit({
    dragCommitPending: deps.dragCommitPending.value,
    dragCommitScheduled: deps.dragCommitScheduled.value
  })) {
    return
  }
  deps.dragCommitScheduled.value = true
  const logNextTickFailure = (err: unknown): void => {
    console.error('[ProjectHierarchyTree] drag commit nextTick chain failed', err)
  }
  window.requestAnimationFrame(() => {
    void deps.nextTick().then(() => {
      return deps.nextTick()
    }).then(() => finishProjectHierarchyTreeDragCommit(deps)).catch(logNextTickFailure)
  })
}
