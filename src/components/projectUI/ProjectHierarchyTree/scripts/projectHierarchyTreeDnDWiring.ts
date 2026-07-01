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
  bumpTreeMountKey: () => void
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  isTreeDragActive: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  const dragSessionState = createProjectHierarchyTreeDragSessionState({
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    isTreeDragActive: deps.isTreeDragActive
  })

  function removeDragCancelListeners (): void {
    window.removeEventListener('pointerup', dragCancelWiring.onWindowPointerUpDuringDrag)
    window.removeEventListener('keydown', dragCancelWiring.onWindowKeydownDuringDrag)
  }

  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    clearDragSessionFlags: dragSessionState.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: dragSessionState.dragExpandedSnapshot.get,
    nextTick: deps.nextTick,
    removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })

  return createProjectHierarchyTreeDnDHandlers({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    clearDragSessionFlags: dragSessionState.clearDragSessionFlags,
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragCancelWiring,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    draggedDocumentId: dragSessionState.draggedDocumentId,
    dragExpandedSnapshot: dragSessionState.dragExpandedSnapshot,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    nextTick: deps.nextTick,
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
