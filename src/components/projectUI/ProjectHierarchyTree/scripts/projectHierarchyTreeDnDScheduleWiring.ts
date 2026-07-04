import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  shouldScheduleDragLayoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { createWaitForProjectHierarchyTreeDragGetDataOrderStable } from './projectHierarchyTreeDragGetDataOrderStableWiring'
import { applyProjectHierarchyTreeDragCommitSiblingOrderPatch } from './projectHierarchyTreeSiblingOrderPatchWiring'
import {
  PROJECT_HIERARCHY_TREE_DRAG_COMMIT_SUPPRESS_WAIT_MAX_ATTEMPTS,
  PROJECT_HIERARCHY_TREE_DRAG_MODEL_SETTLE_MAX_ATTEMPTS
} from '../functions/projectHierarchyTreeConstants'
import { createWaitForProjectHierarchyTreeDragCommitWindow } from '../functions/waitForProjectHierarchyTreeDragCommitWindow'
import { finalizeProjectHierarchyTreeDragCommitAfterPersist } from './projectHierarchyTreeDnDCommitAfterPersistWiring'
import { commitProjectHierarchyTreeDraggedDocumentMove } from './projectHierarchyTreeDnDCommitWiring'
import {
  prepareProjectHierarchyTreeDragCommitOrderSnapshot,
  readProjectHierarchyTreeDragSiblingOrderFromGetData
} from './projectHierarchyTreeDragCommitOrderCaptureWiring'
import { areProjectHierarchyTreeOrderedDocumentIdsEqual } from '../functions/projectHierarchyTreeOrderedDocumentIdsEqual'

type T_projectHierarchyTreeDragCommitScheduleDeps = {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  dragSiblingOrderAtDragStart: () => string[] | null
  readDragParentDocumentIdAtDragStart: () => string | null
  readDragSiblingOrderSnapshot: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  draggedDocumentId: () => string | null
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  loadChildrenForNode: (node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  markNodeClosed: (nodeId: string, node: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeNode) => void
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  reindexDocumentSiblingsInHierarchy: (input: {
    movedDocumentId: string
    orderedDocumentIds: string[]
    parentDocumentId: string | null
    placementId: string
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
  setDragSiblingOrderSnapshot: (
    value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  ) => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function runProjectHierarchyTreeDragCommitPersistPhase (deps: {
  dragSiblingOrderSnapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  draggedDocumentId: string | null
  getDataSettle: { attempts: number, settled: boolean }
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  suppressWait: { attempts: number, ready: boolean }
  suppressTreeEmit: boolean
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
} & Pick<T_projectHierarchyTreeDragCommitScheduleDeps,
  'reindexDocumentSiblingsInHierarchy' | 'refreshLayout' | 'resyncTreeDataFromLayout'
>): Promise<import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragCommitResult> {
  const commitResult = await commitProjectHierarchyTreeDraggedDocumentMove({
    documentId: deps.draggedDocumentId,
    dragCommitSuppressWaitAttempts: deps.suppressWait.attempts,
    dragCommitSuppressWaitReady: deps.suppressWait.ready,
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    modelSettleAttempts: deps.getDataSettle.attempts,
    modelSettleReady: deps.getDataSettle.settled,
    reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
    refreshLayout: deps.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData.value
  })
  if (
    commitResult.committed &&
    commitResult.reloadChildrenNodeId !== null
  ) {
    await deps.refreshNodeChildrenFromDatabase(commitResult.reloadChildrenNodeId)
  }
  applyProjectHierarchyTreeDragCommitSiblingOrderPatch({
    committed: commitResult.committed,
    draggedDocumentId: deps.draggedDocumentId,
    dragSiblingOrderSnapshot: deps.dragSiblingOrderSnapshot,
    treeData: deps.treeData.value
  })
  return commitResult
}

function resolveProjectHierarchyTreeDragCommitGate (input: {
  dragParentDocumentIdAtDragStart: string | null
  dragSiblingOrderSnapshot: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  dragStartOrder: string[] | null
}): {
    orderChangedFromDragStart: boolean
    parentChangedFromDragStart: boolean
  } {
  const parentChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    input.dragParentDocumentIdAtDragStart !== input.dragSiblingOrderSnapshot.parentDocumentId
  const orderChangedFromDragStart = input.dragSiblingOrderSnapshot !== null &&
    (input.dragStartOrder === null ||
      parentChangedFromDragStart ||
      !areProjectHierarchyTreeOrderedDocumentIdsEqual(
        input.dragSiblingOrderSnapshot.orderedDocumentIds,
        input.dragStartOrder
      ))
  return {
    orderChangedFromDragStart,
    parentChangedFromDragStart
  }
}

async function finishProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps
): Promise<void> {
  deps.dragCommitScheduled.value = false
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  const waitForDragCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: PROJECT_HIERARCHY_TREE_DRAG_COMMIT_SUPPRESS_WAIT_MAX_ATTEMPTS,
    nextTick: deps.nextTick,
    readSuppressTreeEmit: () => deps.suppressTreeEmit.value
  })
  const suppressWait = await waitForDragCommitWindow()
  const draggedDocumentId = deps.draggedDocumentId()
  const waitForGetDataOrderStable = createWaitForProjectHierarchyTreeDragGetDataOrderStable({
    maxAttempts: PROJECT_HIERARCHY_TREE_DRAG_MODEL_SETTLE_MAX_ATTEMPTS,
    nextTick: deps.nextTick,
    readSiblingOrderFromGetData: () => readProjectHierarchyTreeDragSiblingOrderFromGetData({
      documentId: draggedDocumentId,
      getTreeRef: deps.getTreeRef
    })
  })
  const getDataSettle = await waitForGetDataOrderStable()
  const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
  const expandedSnapshotSet = new Set(expandedSnapshot)
  const dragSiblingOrderSnapshot = prepareProjectHierarchyTreeDragCommitOrderSnapshot({
    dragSiblingOrderAtDragStart: deps.dragSiblingOrderAtDragStart(),
    draggedDocumentId,
    existingDragSiblingOrderSnapshot: deps.readDragSiblingOrderSnapshot(),
    getDataOrderReady: getDataSettle.settled,
    getDataSettleAttempts: getDataSettle.attempts,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    setDragSiblingOrderSnapshot: deps.setDragSiblingOrderSnapshot,
    treeData: deps.treeData.value
  })
  const dragStartOrder = deps.dragSiblingOrderAtDragStart()
  const dragParentDocumentIdAtDragStart = deps.readDragParentDocumentIdAtDragStart()
  const { orderChangedFromDragStart } = resolveProjectHierarchyTreeDragCommitGate({
    dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot,
    dragStartOrder
  })
  let commitResult: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragCommitResult
  if (orderChangedFromDragStart) {
    commitResult = await runProjectHierarchyTreeDragCommitPersistPhase({
      dragSiblingOrderSnapshot,
      draggedDocumentId,
      getDataSettle,
      refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
      reindexDocumentSiblingsInHierarchy: deps.reindexDocumentSiblingsInHierarchy,
      refreshLayout: deps.refreshLayout,
      resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
      suppressTreeEmit: deps.suppressTreeEmit.value,
      suppressWait,
      treeData: deps.treeData
    })
  } else {
    commitResult = {
      committed: false,
      emptiedParentDocumentIds: [],
      nestParentDocumentId: null,
      reloadChildrenNodeId: null
    }
  }
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    commitResult,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    expandedSnapshot,
    expandedSnapshotSet,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    requestAnimationFrame: deps.requestAnimationFrame,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    treeData: deps.treeData
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
