import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { shouldAcceptHeTreeModelValueUpdate } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'
import { collectExpandedNodeIdsFromTree } from '../functions/projectHierarchyTreeExpandState'
import { collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import { resolveProjectHierarchyTreeScrollContainer } from '../functions/projectHierarchyTreeScrollContainer'
import { readProjectHierarchyTreeScrollTopPx } from '../functions/projectHierarchyTreeScrollPreserve'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDnDOrderSupportWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderAtDragStart } from './projectHierarchyTreeDnDOrderResolveWiring'
import type { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDnDSessionStateWiring'
import type {
  createProjectHierarchyTreeDocumentRowDragHoldWiring,
  createProjectHierarchyTreeDocumentRowExpandClickGestureWiring
} from './projectHierarchyTreeDocumentRowDragHoldWiring'

/**
 * Drag expand freeze snapshot from the open-node model only.
 * Do not read viewport DOM — under he-tree virtualization off-screen rows are missing.
 */
export function resolveProjectHierarchyTreeDragExpandedSnapshot (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>
): string[] {
  return collectExpandedNodeIdsFromTree(treeNodes, openNodeIds)
}

/**
 * Builds persisted + UI-freeze expand snapshots for drag start from model state.
 */
export function captureProjectHierarchyTreeDragExpandSnapshots (input: {
  openNodeIds: ReadonlySet<string>
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[]
}): {
    persistedExpandSnapshot: string[]
    uiFreezeSnapshot: string[]
  } {
  const persistedExpandSnapshot = collectProjectHierarchyTreePersistedExpandedNodeIds(
    input.treeNodes,
    input.openNodeIds
  )
  const uiFreezeSnapshot = resolveProjectHierarchyTreeDragExpandedSnapshot(
    input.treeNodes,
    input.openNodeIds
  )
  return {
    persistedExpandSnapshot,
    uiFreezeSnapshot
  }
}

type T_projectHierarchyTreeDnDModelValueUpdateDeps = {
  dragCommitPending: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  draggedDocumentId: {
    get: () => string | null
  }
  dragSiblingOrderSnapshot: {
    get: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    set: (
      value: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeDragSiblingOrderSnapshot | null
    ) => void
  }
  incrementDragModelValueRevision: () => void
  isTreeDragActive: Ref<boolean>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

export function applyProjectHierarchyTreeHeTreeModelValueUpdate (
  deps: T_projectHierarchyTreeDnDModelValueUpdateDeps,
  nextNodes: I_faProjectHierarchyTreeHeTreeNode[]
): void {
  if (!shouldAcceptHeTreeModelValueUpdate({
    dragCommitPending: deps.dragCommitPending.value,
    dragDropCommitted: deps.dragDropCommitted.value,
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
  deps.incrementDragModelValueRevision()
  syncProjectHierarchyTreeDocumentHasChildrenFlags(deps.treeData.value)
  const draggedDocumentId = deps.draggedDocumentId.get()
  if (draggedDocumentId !== null) {
    deps.dragSiblingOrderSnapshot.set(
      resolveProjectHierarchyTreeDragSiblingOrderSnapshot(deps.treeData.value, draggedDocumentId)
    )
  }
}

export function runProjectHierarchyTreeBeforeDragStart (deps: {
  captureDragParentDocumentIdAtDragStart: (parentDocumentId: string | null) => void
  captureDragScrollTopPxAtDragStart: (scrollTopPx: number) => void
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
  deps.captureDragScrollTopPxAtDragStart(
    readProjectHierarchyTreeScrollTopPx(
      resolveProjectHierarchyTreeScrollContainer(deps.getTreeScrollHost())
    )
  )
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
  const { persistedExpandSnapshot, uiFreezeSnapshot } = captureProjectHierarchyTreeDragExpandSnapshots({
    openNodeIds: deps.openNodeIds.value,
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
