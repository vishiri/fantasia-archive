import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import type { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDragCancelWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { captureProjectHierarchyTreeDragExpandSnapshots } from './projectHierarchyTreeDragExpandSnapshotWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderAtDragStart } from './projectHierarchyTreeDragSiblingOrderResolveWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDragSiblingOrderSnapshotWiring'
import { collectProjectHierarchyTreeLiveExpandStateFromDom } from './projectHierarchyTreeLiveExpandDomWiring'
export function runProjectHierarchyTreeBeforeDragStart (deps: {
  captureDragParentDocumentIdAtDragStart: (parentDocumentId: string | null) => void
  captureDragSiblingOrderAtDragStart: (orderedDocumentIds: string[] | null) => void
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCancelWiring: ReturnType<typeof createProjectHierarchyTreeDragCancelWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  draggedDocumentId: {
    set: (value: string | null) => void
  }
  dragExpandedSnapshot: {
    set: (value: string[] | null) => void
  }
  dragSiblingOrderSnapshot: {
    set: (
      value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    ) => void
  }
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  isTreeDragActive: Ref<boolean>
  openNodeIds: Ref<Set<string>>
  resetDragModelValueRevisionForDragStart: () => void
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}, stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
  if (stat.data.nodeKind !== 'document' || stat.data.documentId === null) {
    return
  }
  deps.documentRowDragHoldWiring.markDragStartedFromHold()
  deps.documentRowExpandClickGesture.markDragStartedForGesture()
  deps.draggedDocumentId.set(stat.data.documentId)
  deps.resetDragModelValueRevisionForDragStart()
  const dragStartOrder = resolveProjectHierarchyTreeDragSiblingOrderAtDragStart({
    documentId: stat.data.documentId,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    treeData: deps.treeData.value
  })
  deps.captureDragSiblingOrderAtDragStart(dragStartOrder.orderedDocumentIds)
  const dragStartParentSnapshot = resolveProjectHierarchyTreeDragSiblingOrderSnapshot(
    deps.treeData.value,
    stat.data.documentId
  )
  deps.captureDragParentDocumentIdAtDragStart(
    dragStartParentSnapshot?.parentDocumentId ?? null
  )
  const liveExpandState = collectProjectHierarchyTreeLiveExpandStateFromDom(
    deps.getTreeScrollHost()
  )
  const { persistedExpandSnapshot, uiFreezeSnapshot } = captureProjectHierarchyTreeDragExpandSnapshots({
    collapsedVisibleNodeIds: liveExpandState.collapsedVisibleNodeIds,
    liveExpandedNodeIds: liveExpandState.expandedNodeIds,
    openNodeIds: deps.openNodeIds.value,
    scrollHostPresent: liveExpandState.scrollHostPresent,
    treeNodes: deps.treeData.value
  })
  deps.dragExpandedSnapshot.set([...persistedExpandSnapshot])
  deps.dragSiblingOrderSnapshot.set(null)
  deps.openNodeIds.value = new Set(uiFreezeSnapshot)
  deps.dragDropCommitted.value = false
  deps.dragCommitScheduled.value = false
  deps.isTreeDragActive.value = true
  deps.dragCommitPending.value = true
  deps.dragExpandPostCommitGuard.value = true
  deps.dragExpandUiFrozen.value = true
  applyFaVerticalDraggableTabsDocumentDragCursor()
  deps.dragCancelWiring.attachDragCancelListeners()
}
