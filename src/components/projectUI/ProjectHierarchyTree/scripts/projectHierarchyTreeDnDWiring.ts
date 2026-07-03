import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDragCancelWiring'
import { createProjectHierarchyTreeDragSessionState } from './projectHierarchyTreeDragSessionStateWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeDnDHandlers } from './projectHierarchyTreeDnDHandlersWiring'

export function createProjectHierarchyTreeDnDWiring (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  isTreeDragActive: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
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
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const dragSessionState = createProjectHierarchyTreeDragSessionState({
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    isTreeDragActive: deps.isTreeDragActive
  })

  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring({
    clearDragSessionFlags: dragSessionState.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: dragSessionState.dragExpandedSnapshot.get,
    nextTick: deps.nextTick,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
  const removeDragCancelListeners = dragCancelWiring.removeDragCancelListeners

  return createProjectHierarchyTreeDnDHandlers({
    clearDragSessionFlags: dragSessionState.clearDragSessionFlags,
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragCancelWiring,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    draggedDocumentId: dragSessionState.draggedDocumentId,
    dragExpandedSnapshot: dragSessionState.dragExpandedSnapshot,
    dragSiblingOrderSnapshot: dragSessionState.dragSiblingOrderSnapshot,
    captureDragModelValueRevisionAtDrop: dragSessionState.captureDragModelValueRevisionAtDrop,
    captureDragSiblingOrderAtDragStart: dragSessionState.captureDragSiblingOrderAtDragStart,
    incrementDragModelValueRevision: dragSessionState.incrementDragModelValueRevision,
    readDragSiblingOrderAtDragStart: dragSessionState.readDragSiblingOrderAtDragStart,
    readDragModelValueSettledForCommit: dragSessionState.readDragModelValueSettledForCommit,
    resetDragModelValueRevisionForDragStart: dragSessionState.resetDragModelValueRevisionForDragStart,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: deps.loadChildrenForNode,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    refreshLayout: deps.refreshLayout,
    removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}
