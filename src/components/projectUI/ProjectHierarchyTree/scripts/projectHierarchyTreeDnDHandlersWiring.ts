import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  shouldClearDragSessionWithoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import {
  clearFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import type { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDragCancelWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { runProjectHierarchyTreeBeforeDragStart } from './projectHierarchyTreeDragStartHandlerWiring'
import { scheduleProjectHierarchyTreeDragCommit } from './projectHierarchyTreeDnDScheduleWiring'
import { applyProjectHierarchyTreeHeTreeModelValueUpdate } from './projectHierarchyTreeDnDModelValueUpdateWiring'
import { syncProjectHierarchyTreeSiblingOrderAfterDrop } from './projectHierarchyTreeDragAfterDropSiblingOrderSyncWiring'

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
  dragSiblingOrderSnapshot: {
    get: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    set: (
      value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    ) => void
  }
  captureDragModelValueRevisionAtDrop: () => void
  captureDragParentDocumentIdAtDragStart: (parentDocumentId: string | null) => void
  captureDragSiblingOrderAtDragStart: (orderedDocumentIds: string[] | null) => void
  incrementDragModelValueRevision: () => void
  readDragParentDocumentIdAtDragStart: () => string | null
  readDragSiblingOrderAtDragStart: () => string[] | null
  readDragModelValueSettledForCommit: () => boolean
  resetDragModelValueRevisionForDragStart: () => void
  isTreeDragActive: Ref<boolean>
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  reindexDocumentSiblingsInHierarchy: (input: {
    movedDocumentId: string
    orderedDocumentIds: string[]
    parentDocumentId: string | null
    placementId: string
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

function onTreeAfterDropImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.dragDropCommitted.value = true
  deps.captureDragModelValueRevisionAtDrop()
  syncProjectHierarchyTreeSiblingOrderAfterDrop({
    dragStartOrderedDocumentIds: deps.readDragSiblingOrderAtDragStart(),
    draggedDocumentId: deps.draggedDocumentId.get(),
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    setDragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot.set,
    treeData: deps.treeData.value
  })
  scheduleProjectHierarchyTreeDragCommit({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    draggedDocumentId: deps.draggedDocumentId.get,
    dragExpandedSnapshot: deps.dragExpandedSnapshot.get,
    dragSiblingOrderAtDragStart: deps.readDragSiblingOrderAtDragStart,
    readDragParentDocumentIdAtDragStart: deps.readDragParentDocumentIdAtDragStart,
    readDragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot.get,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    loadChildrenForNode: deps.loadChildrenForNode,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    markNodeClosed: deps.markNodeClosed,
    reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    refreshLayout: deps.refreshLayout,
    removeDragCancelListeners: deps.removeDragCancelListeners,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    setDragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot.set,
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
    deps.dragSiblingOrderSnapshot.set(null)
  }
}

function onTreeDataUpdateImpl (
  deps: T_projectHierarchyTreeDnDHandlerDeps,
  nextNodes: I_faProjectHierarchyTreeHeTreeNode[]
): void {
  applyProjectHierarchyTreeHeTreeModelValueUpdate(deps, nextNodes)
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
    runProjectHierarchyTreeBeforeDragStart(deps, { data: dragNode.data })
  }

  function onBeforeDragStart (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
    if (!deps.documentRowDragHoldWiring.getIsDragHoldArmed()) {
      return
    }
    runProjectHierarchyTreeBeforeDragStart(deps, stat)
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
