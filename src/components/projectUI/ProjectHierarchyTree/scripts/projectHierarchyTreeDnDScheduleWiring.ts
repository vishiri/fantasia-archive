import type { Ref } from 'vue'

import { ResultAsync } from 'neverthrow'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  shouldScheduleDragLayoutCommit
} from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import { clearFaVerticalDraggableTabsDocumentDragCursor } from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { createWaitForProjectHierarchyTreeDragGetDataOrderStable } from './projectHierarchyTreeDnDOrderPostDropWiring'
import {
  PROJECT_HIERARCHY_TREE_DRAG_COMMIT_SUPPRESS_WAIT_MAX_ATTEMPTS,
  PROJECT_HIERARCHY_TREE_DRAG_MODEL_SETTLE_MAX_ATTEMPTS
} from '../functions/projectHierarchyTreeConstants'
import { createWaitForProjectHierarchyTreeDragCommitWindow } from '../functions/waitForProjectHierarchyTreeDragCommitWindow'
import { finalizeProjectHierarchyTreeDragCommitAfterPersist } from './projectHierarchyTreeDnDCommitAfterPersistWiring'
import { runProjectHierarchyTreeDragCommitPersistPhase } from './projectHierarchyTreeDnDCommitWiring'
import {
  prepareDragCommitOrderSnapshotFromSchedule,
  readProjectHierarchyTreeDragSiblingOrderFromGetData
} from './projectHierarchyTreeDnDOrderCaptureWiring'
import { runWithPreservedProjectHierarchyTreeScrollTop } from './projectHierarchyTreeScrollPreserveWiring'
import {
  beginProjectHierarchyTreeDragCommitSerial,
  isProjectHierarchyTreeDragCommitSerialCurrent,
  releaseProjectHierarchyTreeDragCommitWhenProjectChanged,
  resolveProjectHierarchyTreeDragCommitGate
} from './projectHierarchyTreeDnDCommitGateWiring'

type T_projectHierarchyTreeDragCommitScheduleDeps = {
  clearDragSessionFlags: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  dragExpandedSnapshot: () => string[] | null
  dragSiblingOrderAtDragStart: () => string[] | null
  getPersistedScrollTopPx: () => number
  readDragParentDocumentIdAtDragStart: () => string | null
  readDragScrollTopPxAtDragStart: () => number
  readDragSiblingOrderSnapshot: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
  draggedDocumentId: () => string | null
  draggedTreeNodeId?: () => string | null
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
  scrollTopPx?: number
  setDragSiblingOrderSnapshot: (
    value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
  ) => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

async function settleProjectHierarchyTreeDragCommitBeforePersist (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps,
  draggedDocumentId: string | null
): Promise<{
  getDataSettle: { attempts: number, settled: boolean }
  suppressWait: { attempts: number, ready: boolean }
}> {
  const waitForDragCommitWindow = createWaitForProjectHierarchyTreeDragCommitWindow({
    maxAttempts: PROJECT_HIERARCHY_TREE_DRAG_COMMIT_SUPPRESS_WAIT_MAX_ATTEMPTS,
    nextTick: deps.nextTick,
    readSuppressTreeEmit: () => deps.suppressTreeEmit.value
  })
  const suppressWait = await waitForDragCommitWindow()
  const waitForGetDataOrderStable = createWaitForProjectHierarchyTreeDragGetDataOrderStable({
    maxAttempts: PROJECT_HIERARCHY_TREE_DRAG_MODEL_SETTLE_MAX_ATTEMPTS,
    nextTick: deps.nextTick,
    readSiblingOrderFromGetData: () => readProjectHierarchyTreeDragSiblingOrderFromGetData({
      documentId: draggedDocumentId,
      getTreeRef: deps.getTreeRef,
      preferredNodeId: deps.draggedTreeNodeId?.() ?? null
    })
  })
  const getDataSettle = await waitForGetDataOrderStable()
  return {
    getDataSettle,
    suppressWait
  }
}

async function finishProjectHierarchyTreeDragCommit (
  deps: T_projectHierarchyTreeDragCommitScheduleDeps,
  epochAtSchedule: number | undefined,
  commitSerial: number
): Promise<void> {
  const dragCommitStillCurrent = (): boolean => {
    return isProjectHierarchyTreeDragCommitSerialCurrent(
      deps.dragCommitScheduled,
      commitSerial
    )
  }
  deps.dragCommitScheduled.value = false
  deps.removeDragCancelListeners()
  clearFaVerticalDraggableTabsDocumentDragCursor()
  const draggedDocumentId = deps.draggedDocumentId()
  const { getDataSettle, suppressWait } = await settleProjectHierarchyTreeDragCommitBeforePersist(
    deps,
    draggedDocumentId
  )
  const expandedSnapshot = deps.dragExpandedSnapshot() ?? []
  const expandedSnapshotSet = new Set(expandedSnapshot)
  const dragSiblingOrderSnapshot = prepareDragCommitOrderSnapshotFromSchedule(
    deps,
    draggedDocumentId,
    getDataSettle
  )
  const dragStartOrder = deps.dragSiblingOrderAtDragStart()
  const dragParentDocumentIdAtDragStart = deps.readDragParentDocumentIdAtDragStart()
  const { orderChangedFromDragStart, parentChangedFromDragStart } = resolveProjectHierarchyTreeDragCommitGate({
    dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot,
    dragStartOrder
  })
  if (releaseProjectHierarchyTreeDragCommitWhenProjectChanged(deps, epochAtSchedule)) {
    return
  }
  if (!dragCommitStillCurrent()) {
    return
  }
  let commitResult: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragCommitResult
  if (orderChangedFromDragStart) {
    commitResult = await runProjectHierarchyTreeDragCommitPersistPhase({
      dragSiblingOrderSnapshot,
      draggedDocumentId,
      getDataSettle,
      isDragCommitStillCurrent: dragCommitStillCurrent,
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
  if (releaseProjectHierarchyTreeDragCommitWhenProjectChanged(deps, epochAtSchedule)) {
    return
  }
  if (!dragCommitStillCurrent()) {
    return
  }
  await finalizeProjectHierarchyTreeDragCommitAfterPersist({
    clearDragSessionFlags: deps.clearDragSessionFlags,
    commitResult,
    isDragCommitStillCurrent: dragCommitStillCurrent,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragParentDocumentIdAtDragStart,
    dragSiblingOrderSnapshot,
    expandedSnapshot,
    expandedSnapshotSet,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    parentChangedFromDragStart,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
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
  const commitSerial = beginProjectHierarchyTreeDragCommitSerial(deps.dragCommitScheduled)
  const epochAtSchedule = deps.readProjectContentEpoch?.()
  const logNextTickFailure = (err: unknown): void => {
    console.error('[ProjectHierarchyTree] drag commit nextTick chain failed', err)
  }
  void ResultAsync.fromPromise(
    runWithPreservedProjectHierarchyTreeScrollTop({
      dragSessionScrollTopPx: deps.readDragScrollTopPxAtDragStart(),
      getPersistedScrollTopPx: deps.getPersistedScrollTopPx,
      getTreeScrollHost: deps.getTreeScrollHost,
      nextTick: deps.nextTick,
      requestAnimationFrame: deps.requestAnimationFrame,
      ...(deps.scrollTopPx === undefined ? {} : { scrollTopPx: deps.scrollTopPx }),
      run: async () => {
        await deps.nextTick()
        await deps.nextTick()
        await finishProjectHierarchyTreeDragCommit(deps, epochAtSchedule, commitSerial)
      }
    }),
    (error): unknown => error
  ).match(
    () => undefined,
    logNextTickFailure
  )
}
