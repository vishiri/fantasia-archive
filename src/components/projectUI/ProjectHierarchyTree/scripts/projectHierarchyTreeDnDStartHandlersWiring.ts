import type { Ref } from 'vue'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { shouldAcceptHeTreeModelValueUpdate } from 'app/src/components/dialogs/DialogProjectSettings/scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeCommitPolicy'
import {
  applyFaVerticalDraggableTabsDocumentDragCursor
} from 'app/src/scripts/faDragDrop/faDragDrop_manager'
import { syncProjectHierarchyTreeDocumentHasChildrenFlags } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import { findProjectHierarchyTreeDocumentsWithInvalidPlacementParent } from '../functions/projectHierarchyTreeDocumentPlacementGuard'
import {
  applyExpandedNodeIdsToTree,
  collectExpandedNodeIdsFromTree,
  collectProjectHierarchyTreeDescendantIds,
  findProjectHierarchyTreeNodeById,
  pruneProjectHierarchyTreeExpandedNodeIdsToAncestors
} from '../functions/projectHierarchyTreeExpandState'
import { collectProjectHierarchyTreePersistedExpandedNodeIds } from '../functions/projectHierarchyTreePersistedOpenNodeIds'
import { resolveProjectHierarchyTreeDragSiblingOrderSnapshot } from './projectHierarchyTreeDnDOrderSupportWiring'
import { resolveProjectHierarchyTreeDragSiblingOrderAtDragStart } from './projectHierarchyTreeDnDOrderResolveWiring'
import type { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDnDSessionStateWiring'
import type {
  createProjectHierarchyTreeDocumentRowDragHoldWiring,
  createProjectHierarchyTreeDocumentRowExpandClickGestureWiring
} from './projectHierarchyTreeDocumentRowDragHoldWiring'
import {
  collectProjectHierarchyTreeLiveExpandStateFromDom
} from './projectHierarchyTreeExpandDomWiring'

function pruneOpenNodeIdsByCollapsedVisibleRows (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  openNodeIds: ReadonlySet<string>,
  collapsedVisibleNodeIds: string[]
): Set<string> {
  const next = new Set(openNodeIds)
  for (const collapsedNodeId of collapsedVisibleNodeIds) {
    next.delete(collapsedNodeId)
    const node = findProjectHierarchyTreeNodeById(treeNodes, collapsedNodeId)
    if (node === null) {
      continue
    }
    for (const descendantId of collectProjectHierarchyTreeDescendantIds(node)) {
      next.delete(descendantId)
    }
  }
  return next
}

/**
 * Builds drag expand snapshot from live DOM plus persisted open set.
 * Live rows win for visible collapse; persisted ids fill gaps when drag hides nested rows.
 */
export function resolveProjectHierarchyTreeDragExpandedSnapshot (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  liveExpandedNodeIds: string[],
  collapsedVisibleNodeIds: string[],
  openNodeIds: ReadonlySet<string>,
  scrollHostPresent: boolean
): string[] {
  if (liveExpandedNodeIds.length > 0) {
    const prunedOpenNodeIds = pruneOpenNodeIdsByCollapsedVisibleRows(
      treeNodes,
      openNodeIds,
      collapsedVisibleNodeIds
    )
    const mergedExpandedNodeIds = applyExpandedNodeIdsToTree(
      treeNodes,
      [...new Set([...liveExpandedNodeIds, ...prunedOpenNodeIds])]
    )
    return pruneProjectHierarchyTreeExpandedNodeIdsToAncestors(
      treeNodes,
      mergedExpandedNodeIds
    )
  }
  if (scrollHostPresent) {
    const prunedOpenNodeIds = pruneOpenNodeIdsByCollapsedVisibleRows(
      treeNodes,
      openNodeIds,
      collapsedVisibleNodeIds
    )
    return collectExpandedNodeIdsFromTree(treeNodes, prunedOpenNodeIds)
  }
  return collectExpandedNodeIdsFromTree(treeNodes, openNodeIds)
}

export function captureProjectHierarchyTreeDragExpandSnapshots (input: {
  collapsedVisibleNodeIds: string[]
  liveExpandedNodeIds: string[]
  openNodeIds: ReadonlySet<string>
  scrollHostPresent: boolean
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
    input.liveExpandedNodeIds,
    input.collapsedVisibleNodeIds,
    input.openNodeIds,
    input.scrollHostPresent
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
