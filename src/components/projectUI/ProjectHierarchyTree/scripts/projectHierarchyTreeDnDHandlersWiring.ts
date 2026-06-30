import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeDragExpandedSnapshot } from './projectHierarchyTreeDragExpandSnapshotWiring'
import { logProjectHierarchyTreeDebugSession } from './projectHierarchyTreeDebugSessionLogWiring'
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
import { scheduleProjectHierarchyTreeDragCommit } from './projectHierarchyTreeDnDScheduleWiring'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'

type T_projectHierarchyTreeDnDHandlerDeps = {
  bumpTreeMountKey: () => void
  clearDragSessionFlags: () => void
  dragCancelWiring: ReturnType<typeof createProjectHierarchyTreeDragCancelWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
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
  removeDragCancelListeners: () => void
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
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
  logProjectHierarchyTreeDebugSession({
    data: {
      collapsedVisibleNodeIds: liveExpandState.collapsedVisibleNodeIds,
      documentId: stat.data.documentId,
      liveExpandedNodeIds: liveExpandState.expandedNodeIds,
      openNodeIds: [...deps.openNodeIds.value],
      rowCount: liveExpandState.rowCount,
      scrollHostPresent: liveExpandState.scrollHostPresent,
      snapshot
    },
    hypothesisId: 'H1-H6',
    location: 'projectHierarchyTreeDnDHandlersWiring.ts:onBeforeDragStart',
    message: 'drag start expand snapshot',
    runId: 'post-fix'
  })
  deps.dragDropCommitted.value = false
  deps.dragCommitScheduled.value = false
  deps.isTreeDragActive.value = true
  deps.dragCommitPending.value = true
  deps.dragExpandUiFrozen.value = true
  applyFaVerticalDraggableTabsDocumentDragCursor()
  window.addEventListener('pointerup', deps.dragCancelWiring.onWindowPointerUpDuringDrag)
  window.addEventListener('keydown', deps.dragCancelWiring.onWindowKeydownDuringDrag)
}

function onTreeAfterDropImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.dragDropCommitted.value = true
  scheduleProjectHierarchyTreeDragCommit({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: deps.dragExpandedSnapshot.get,
    draggedDocumentId: deps.draggedDocumentId.get,
    getTreeRef: deps.getTreeRef,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    nextTick: deps.nextTick,
    refreshLayout: deps.refreshLayout,
    removeDragCancelListeners: deps.removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}

function onTreeDragEndCleanupImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
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
  deps.treeData.value = nextNodes
  const emptiedParentDocumentIds = syncProjectHierarchyTreeDocumentHasChildrenFlags(deps.treeData.value)
  if (emptiedParentDocumentIds.length > 0) {
    // #region agent log
    logProjectHierarchyTreeDebugSession({
      data: {
        emptiedParentDocumentIds
      },
      hypothesisId: 'S3',
      location: 'projectHierarchyTreeDnDHandlersWiring.ts:onTreeDataUpdate',
      message: 'synced hasChildren after optimistic drag tree update',
      runId: 'stat-not-found'
    })
    // #endregion
  }
}

function onUnmountedCleanupImpl (deps: T_projectHierarchyTreeDnDHandlerDeps): void {
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  deps.dragExpandUiFrozen.value = false
  deps.clearDragSessionFlags()
}

export function createProjectHierarchyTreeDnDHandlers (
  deps: T_projectHierarchyTreeDnDHandlerDeps
) {
  function onBeforeDragStart (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
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
    onBeforeDragStart,
    onTreeAfterDrop,
    onTreeDataUpdate,
    onTreeDragEndCleanup,
    onUnmountedCleanup
  }
}
