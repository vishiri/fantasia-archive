import type { Ref } from 'vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { isProjectHierarchyTreeNodeDraggable } from '../functions/projectHierarchyTreeDnD'
import { projectHierarchyTreeNodeShowsOpenIcon } from '../functions/projectHierarchyTreeDocumentHasChildrenSync'
import type {
  createProjectHierarchyTreeDocumentRowDragHoldWiring,
  createProjectHierarchyTreeDocumentRowExpandClickGestureWiring
} from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeSessionExpandCloseHandler } from './projectHierarchyTreeSessionExpandCloseWiring'
import { createProjectHierarchyTreeSessionExpandOpenHandlersWiring } from './projectHierarchyTreeSessionExpandOpenWiring'

function shouldRouteHierarchyTreeRowExpandClick (
  node: I_faProjectHierarchyTreeHeTreeNode,
  stat: { children: unknown[], open: boolean }
): boolean {
  if (node.nodeKind === 'addNewDocument') {
    return false
  }
  if (
    node.nodeKind === 'world' ||
    node.nodeKind === 'group' ||
    node.nodeKind === 'templatePlacement'
  ) {
    return true
  }
  if (node.nodeKind === 'document') {
    return projectHierarchyTreeNodeShowsOpenIcon(node, stat.children.length)
  }
  return false
}

function shouldStopHierarchyTreeRowExpandPointerDown (
  node: I_faProjectHierarchyTreeHeTreeNode
): boolean {
  return node.nodeKind !== 'document'
}

export function createProjectHierarchyTreeExpandRowClickRouting (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  onNodeOpenIconClick: (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ) => Promise<void>
  onNodeOpenIconPointerDown: (stat: { open: boolean }) => void
}) {
  function onNonWorldOpenIconPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { open: boolean }
  ): void {
    if (node.nodeKind === 'world') {
      return
    }
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onNonWorldOpenIconClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean }
  ): Promise<void> {
    if (node.nodeKind === 'world') {
      return
    }
    await deps.onNodeOpenIconClick(node, stat)
  }

  function onWorldNodeRowPointerDown (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean },
    event: PointerEvent
  ): void {
    if (isProjectHierarchyTreeNodeDraggable(node)) {
      deps.documentRowDragHoldWiring.handleDocumentRowPointerDown(event)
    }
    if (!shouldRouteHierarchyTreeRowExpandClick(node, stat)) {
      return
    }
    if (node.nodeKind === 'document') {
      deps.documentRowExpandClickGesture.beginDocumentRowGesture(event)
    }
    if (shouldStopHierarchyTreeRowExpandPointerDown(node)) {
      event.stopPropagation()
    }
    deps.onNodeOpenIconPointerDown(stat)
  }

  async function onWorldNodeRowClick (
    node: I_faProjectHierarchyTreeHeTreeNode,
    stat: { children: unknown[], open: boolean },
    event: MouseEvent
  ): Promise<void> {
    if (!shouldRouteHierarchyTreeRowExpandClick(node, stat)) {
      return
    }
    if (node.nodeKind === 'document') {
      const shouldToggleExpand = deps.documentRowExpandClickGesture.shouldDocumentRowClickToggleExpand(event)
      deps.documentRowExpandClickGesture.clearDocumentRowGesture()
      if (!shouldToggleExpand) {
        return
      }
    }
    event.stopPropagation()
    await deps.onNodeOpenIconClick(node, stat)
  }

  return {
    onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick,
    onWorldNodeRowPointerDown
  }
}

export function createProjectHierarchyTreeSessionExpandHandlersWiring (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  getDragExpandedSnapshotNodeIds: () => string[] | null
  getPersistedScrollTopPx: () => number
  getTreeScrollHost: () => HTMLElement | null
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  openIconExpandAnimationWiring: {
    scheduleOpenIconExpandAnimation: (nodeId: string) => void
  }
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  requestAnimationFrame: (callback: () => void) => number
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    awaitHeTreeResyncIdle: () => Promise<void>
    isProgrammaticHeTreeResyncActive: () => boolean
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
    reapplyHeTreeOpenState: () => void
    reapplyLatentDescendantExpandState: (options?: {
      deferHeTreeOpen?: boolean
    }) => Promise<void>
    resyncHeTreeAfterExpandPublish: (nodeId: string) => Promise<void>
  }
}) {
  const onNodeClose = createProjectHierarchyTreeSessionExpandCloseHandler({
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getDragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds,
    requestAnimationFrame: deps.requestAnimationFrame,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeComponentRef: deps.treeComponentRef,
    treeData: deps.treeData,
    uiStateWiring: deps.uiStateWiring
  })

  const expandOpenHandlersWiring = createProjectHierarchyTreeSessionExpandOpenHandlersWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getPersistedScrollTopPx: deps.getPersistedScrollTopPx,
    getTreeScrollHost: deps.getTreeScrollHost,
    lazyLoadWiring: deps.lazyLoadWiring,
    onNodeClose,
    openIconExpandAnimationWiring: deps.openIconExpandAnimationWiring,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    requestAnimationFrame: deps.requestAnimationFrame,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeComponentRef: deps.treeComponentRef,
    treeData: deps.treeData,
    uiStateWiring: deps.uiStateWiring
  })

  const expandRowClickRouting = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    onNodeOpenIconClick: expandOpenHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: expandOpenHandlersWiring.onNodeOpenIconPointerDown
  })

  return {
    onNodeClose,
    onNodeOpen: expandOpenHandlersWiring.onNodeOpen,
    onNodeOpenIconClick: expandOpenHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: expandOpenHandlersWiring.onNodeOpenIconPointerDown,
    onNonWorldOpenIconClick: expandRowClickRouting.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: expandRowClickRouting.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: expandRowClickRouting.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: expandRowClickRouting.onWorldNodeRowPointerDown
  }
}
