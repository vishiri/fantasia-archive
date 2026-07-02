import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeDragExpandedSnapshot } from './projectHierarchyTreeDragExpandSnapshotWiring'
import { collectProjectHierarchyTreeLiveExpandStateFromDom } from './projectHierarchyTreeLiveExpandDomWiring'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor,
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import {
  shouldAcceptHeTreeModelValueUpdate,
  shouldClearDragSessionWithoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import type { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDragCancelWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { scheduleProjectHierarchyTreeDragCommit } from './projectHierarchyTreeDnDScheduleWiring'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'

type T_projectHierarchyTreeDnDHandlerDeps = {
  clearDragSessionFlags: () => void
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCancelWiring: ReturnType<typeof createProjectHierarchyTreeDragCancelWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  draggedDocumentId: {
    get: () => string | null
    set: (value: string | null) => void
  }
  dragExpandedSnapshot: {
    get: () => string[] | null
    set: (value: string[] | null) => void
  }
  isTreeDragActive: Ref<boolean>
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  nextTick: () => Promise<void>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  removeDragCancelListeners: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

function onBeforeDragStartImpl (
  deps: T_projectHierarchyTreeDnDHandlerDeps,
  stat: { data: I_faProjectHierarchyTreeHeTreeNode }
): void {
  if (stat.data.nodeKind !== 'document' || stat.data.documentId === null) {
    return
  }
  deps.documentRowDragHoldWiring.markDragStartedFromHold()
  deps.documentRowExpandClickGesture.markDragStartedForGesture()
  deps.draggedDocumentId.set(stat.data.documentId)
  const liveExpandState = collectProjectHierarchyTreeLiveExpandStateFromDom(
    deps.getTreeScrollHost()
  )
  const snapshot = resolveProjectHierarchyTreeDragExpandedSnapshot(
    deps.treeData.value,
    liveExpandState.expandedNodeIds,
    liveExpandState.collapsedVisibleNodeIds,
    deps.openNodeIds.value,
    liveExpandState.scrollHostPresent
  )
  deps.dragExpandedSnapshot.set([...snapshot])
  deps.openNodeIds.value = new Set(snapshot)
  deps.queuePersistExpandedNodeIds(snapshot)
  deps.dragDropCommitted.value = false
  deps.dragCommitScheduled.value = false
  deps.isTreeDragActive.value = true
  deps.dragCommitPending.value = true
  deps.dragExpandPostCommitGuard.value = true
  deps.dragExpandUiFrozen.value = true
  applyFaVerticalDraggableTabsDocumentDragCursor()
  window.addEventListener('pointerup', deps.dragCancelWiring.onWindowPointerUpDuringDrag)
  window.addEventListener('keydown', deps.dragCancelWiring.onWindowKeydownDuringDrag)
}

function onTreeAfterDropImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.dragDropCommitted.value = true
  scheduleProjectHierarchyTreeDragCommit({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: deps.dragExpandedSnapshot.get,
    draggedDocumentId: deps.draggedDocumentId.get,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    refreshLayout: deps.refreshLayout,
    removeDragCancelListeners: deps.removeDragCancelListeners,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}

function onTreeDragEndCleanupImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.documentRowDragHoldWiring.clearHoldSession()
  deps.isTreeDragActive.value = false
  clearFaVerticalDraggableTabsDocumentDragCursor()
  if (shouldClearDragSessionWithoutCommit({
    dragDropCommitted: deps.dragDropCommitted.value
  })) {
    deps.removeDragCancelListeners()
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.draggedDocumentId.set(null)
    deps.dragExpandedSnapshot.set(null)
  }
}

function onTreeDataUpdateImpl (
  deps: T_projectHierarchyTreeDnDHandlerDeps,
  nextNodes: I_faProjectHierarchyTreeHeTreeNode[]
): void {
  if (!shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: deps.dragCommitPending.value,
    isTreeDragActive: deps.isTreeDragActive.value,
    suppressTreeEmit: deps.suppressTreeEmit.value
  })) {
    return
  }
  const escapedDocuments = findProjectHierarchyTreeDocumentsWithInvalidPlacementParent(nextNodes)
  if (escapedDocuments.length > 0) {
    return
  }
  deps.treeData.value = nextNodes
  syncProjectHierarchyTreeDocumentHasChildrenFlags(deps.treeData.value)
}

function onUnmountedCleanupImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  deps.dragExpandPostCommitGuard.value = false
  deps.dragExpandUiFrozen.value = false
  deps.clearDragSessionFlags()
}

export function createProjectHierarchyTreeDnDHandlers (
  deps: T_projectHierarchyTreeDnDHandlerDeps
) {
  function commitAllowedDocumentRowDragSessionStart (dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }): void {
    const dragNode = dragContext.dragNode
    if (dragNode === null) {
      return
    }
    onBeforeDragStartImpl(deps, { data: dragNode.data })
  }

  function onBeforeDragStart (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
    if (!deps.documentRowDragHoldWiring.getIsDragHoldArmed()) {
      return
    }
    onBeforeDragStartImpl(deps, stat)
  }

  function onTreeAfterDrop (): void {
    onTreeAfterDropImpl(deps)
  }

  function onTreeDragEndCleanup (): void {
    onTreeDragEndCleanupImpl(deps)
  }

  function onTreeDataUpdate (nextNodes: I_faProjectHierarchyTreeHeTreeNode[]): void {
    onTreeDataUpdateImpl(deps, nextNodes)
  }

  function onUnmountedCleanup (): void {
    onUnmountedCleanupImpl(deps)
  }

  return {
    commitAllowedDocumentRowDragSessionStart,
    getDragExpandedSnapshotNodeIds: () => deps.dragExpandedSnapshot.get(),
    onBeforeDragStart,
    onTreeAfterDrop,
    onTreeDataUpdate,
    onTreeDragEndCleanup,
    onUnmountedCleanup
  }
}
