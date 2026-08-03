import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { createProjectHierarchyTreeDragCancelWiring, createProjectHierarchyTreeDragSessionState } from './projectHierarchyTreeDnDSessionStateWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring, createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeDnDHandlers } from './projectHierarchyTreeDnDHandlersWiring'
import { isProjectHierarchyTreeNodeDroppable, isProjectHierarchyTreeRootDroppable } from '../functions/projectHierarchyTreeDnD'
import { collectProjectHierarchyTreeAncestorIds } from '../functions/projectHierarchyTreeExpandState'

function createProjectHierarchyTreeDnDCancelFromSession (deps: {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshotGet: () => string[] | null
  getTreeScrollHost: () => HTMLElement | null
  nextTick: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
}) {
  return createProjectHierarchyTreeDragCancelWiring({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: deps.dragExpandedSnapshotGet,
    getTreeScrollHost: deps.getTreeScrollHost,
    nextTick: deps.nextTick,
    requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
}

type T_projectHierarchyTreeDnDWiringDeps = {
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
  getPersistedScrollTopPx: () => number
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
}

export function createProjectHierarchyTreeDnDWiring (
  deps: T_projectHierarchyTreeDnDWiringDeps
) {
  const dragSessionState = createProjectHierarchyTreeDragSessionState({
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    isTreeDragActive: deps.isTreeDragActive
  })
  const dragCancelWiring = createProjectHierarchyTreeDnDCancelFromSession({
    clearDragSessionFlags: dragSessionState.clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshotGet: dragSessionState.dragExpandedSnapshot.get,
    getTreeScrollHost: deps.getTreeScrollHost,
    nextTick: deps.nextTick,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })
  return createProjectHierarchyTreeDnDHandlers(
    buildProjectHierarchyTreeDnDHandlerDeps(deps, dragSessionState, dragCancelWiring)
  )
}

function buildProjectHierarchyTreeDnDHandlerDeps (
  deps: T_projectHierarchyTreeDnDWiringDeps,
  dragSessionState: ReturnType<typeof createProjectHierarchyTreeDragSessionState>,
  dragCancelWiring: ReturnType<typeof createProjectHierarchyTreeDragCancelWiring>
) {
  return {
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
    captureDragParentDocumentIdAtDragStart: dragSessionState.captureDragParentDocumentIdAtDragStart,
    captureDragScrollTopPxAtDragStart: dragSessionState.captureDragScrollTopPxAtDragStart,
    captureDragSiblingOrderAtDragStart: dragSessionState.captureDragSiblingOrderAtDragStart,
    incrementDragModelValueRevision: dragSessionState.incrementDragModelValueRevision,
    readDragSiblingOrderAtDragStart: dragSessionState.readDragSiblingOrderAtDragStart,
    readDragParentDocumentIdAtDragStart: dragSessionState.readDragParentDocumentIdAtDragStart,
    readDragScrollTopPxAtDragStart: dragSessionState.readDragScrollTopPxAtDragStart,
    readDragModelValueSettledForCommit: dragSessionState.readDragModelValueSettledForCommit,
    resetDragModelValueRevisionForDragStart: dragSessionState.resetDragModelValueRevisionForDragStart,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getPersistedScrollTopPx: deps.getPersistedScrollTopPx,
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
    removeDragCancelListeners: dragCancelWiring.removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  }
}

export function createProjectHierarchyTreeBeforeDragOpenWiring (deps: {
  lazyLoadWiring: {
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
}) {
  async function onBeforeDragOpen (
    stat: { data: I_faProjectHierarchyTreeHeTreeNode }
  ): Promise<void> {
    const node = stat.data
    if (node.nodeKind !== 'document' && node.nodeKind !== 'templatePlacement') {
      return
    }
    await deps.lazyLoadWiring.loadChildrenForNode(node)
  }

  return {
    onBeforeDragOpen
  }
}

export function createProjectHierarchyTreeDroppableHandlers (deps: {
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  function eachDroppableHandler (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): boolean {
    return isProjectHierarchyTreeNodeDroppable(
      stat.data,
      deps.dragContext,
      deps.treeData.value
    )
  }

  function rootDroppableHandler (): boolean {
    return isProjectHierarchyTreeRootDroppable(deps.dragContext)
  }

  return {
    eachDroppableHandler,
    rootDroppableHandler
  }
}

function shouldSuppressPostDragExpandNodeClose (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  dragExpandedSnapshotNodeIds: string[] | null,
  nodeId: string
): boolean {
  if (dragExpandedSnapshotNodeIds === null || dragExpandedSnapshotNodeIds.length === 0) {
    return false
  }
  const snapshotSet = new Set(dragExpandedSnapshotNodeIds)
  if (snapshotSet.has(nodeId)) {
    return true
  }
  for (const snapshotNodeId of dragExpandedSnapshotNodeIds) {
    const ancestors = collectProjectHierarchyTreeAncestorIds(treeNodes, snapshotNodeId)
    if (ancestors?.includes(nodeId) === true) {
      return true
    }
  }
  return false
}

export function runProjectHierarchyTreePostDragExpandCloseGuard (deps: {
  dragExpandPostCommitGuard: () => boolean
  getDragExpandedSnapshotNodeIds: () => string[] | null
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  node: I_faProjectHierarchyTreeHeTreeNode
  nodeId: string
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): void {
  if (deps.dragExpandPostCommitGuard()) {
    return
  }
  const snapshotNodeIds = deps.getDragExpandedSnapshotNodeIds()
  if (
    shouldSuppressPostDragExpandNodeClose(
      deps.treeData.value,
      snapshotNodeIds,
      deps.nodeId
    )
  ) {
    return
  }
  deps.markNodeClosed(deps.nodeId, deps.node)
}
