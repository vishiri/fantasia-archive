import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDraggable
} from '../functions/projectHierarchyTreeDnD'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeDroppableHandlers } from './projectHierarchyTreeDroppableHandlerWiring'
import { createProjectHierarchyTreeDocumentOpenHandlers } from './projectHierarchyTreeDocumentOpenHandlersWiring'
import { createProjectHierarchyTreeAddNewDocumentClickHandlers } from './projectHierarchyTreeAddNewDocumentClickHandlersWiring'
import { createProjectHierarchyTreeSessionExpandHandlersWiring } from './projectHierarchyTreeSessionExpandHandlersWiring'
import { createProjectHierarchyTreeSessionHandlersClickWiring } from './projectHierarchyTreeSessionHandlersClickWiring'
import { createProjectHierarchyTreeSessionBulkContextMenuWiring } from './projectHierarchyTreeSessionBulkContextMenuWiring'

type T_projectHierarchyTreeSessionHandlersWiringDeps = {
  createTemporaryDocument: (input: {
    displayName: string
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  getDragExpandedSnapshotNodeIds: () => string[] | null
  lazyLoadWiring: {
    commitStagedLoadedChildren?: () => boolean
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  nextTick: () => Promise<void>
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
  openNodeIds: Ref<Set<string>>
  openIconExpandAnimationWiring: {
    scheduleOpenIconExpandAnimation: (nodeId: string) => void
  }
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  treeScrollHostRef: Ref<HTMLElement | null>
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
}

function buildProjectHierarchyTreeSessionHandlersReturn (input: {
  bulkContextMenuWiring: ReturnType<typeof createProjectHierarchyTreeSessionBulkContextMenuWiring>
  clickHandlersWiring: ReturnType<typeof createProjectHierarchyTreeSessionHandlersClickWiring>
  droppableHandlers: ReturnType<typeof createProjectHierarchyTreeDroppableHandlers>
  eachDraggableHandler: (stat: { data: I_faProjectHierarchyTreeHeTreeNode }) => boolean
  expandHandlersWiring: ReturnType<typeof createProjectHierarchyTreeSessionExpandHandlersWiring>
  setTreeComponentRef: (instance: I_faProjectHierarchyTreeHeTreeInstance | null) => void
  setTreeScrollHostRef: (element: HTMLElement | null) => void
}) {
  const eachDroppableHandler = input.droppableHandlers.eachDroppableHandler
  const rootDroppableHandler = input.droppableHandlers.rootDroppableHandler
  return {
    eachDraggableHandler: input.eachDraggableHandler,
    eachDroppableHandler,
    contextMenuAddNewRowIcon: input.bulkContextMenuWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: input.bulkContextMenuWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: input.bulkContextMenuWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: input.bulkContextMenuWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: input.bulkContextMenuWiring.contextMenuShowsCopyRows,
    contextMenuShowsSortByRows: input.bulkContextMenuWiring.contextMenuShowsSortByRows,
    isNodeContextMenuOpen: input.bulkContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuPointerPosition: input.bulkContextMenuWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: input.bulkContextMenuWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      input.bulkContextMenuWiring.onAddNewDocumentUnderThisFromContextMenuClick,
    onCollapseAllUnderNodeClick: input.bulkContextMenuWiring.onCollapseAllUnderNodeClick,
    onCopyBackgroundColorFromContextMenuClick:
      input.bulkContextMenuWiring.onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick: input.bulkContextMenuWiring.onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick: input.bulkContextMenuWiring.onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick: input.bulkContextMenuWiring.onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick: input.bulkContextMenuWiring.onDeleteDocumentFromContextMenuClick,
    onDocumentRowAuxClick: input.clickHandlersWiring.onDocumentRowAuxClick,
    onEditDocumentFromContextMenuClick: input.bulkContextMenuWiring.onEditDocumentFromContextMenuClick,
    onExpandAllUnderNodeClick: input.bulkContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeClick: input.clickHandlersWiring.onNodeClick,
    onNodeContextMenuHide: input.bulkContextMenuWiring.onNodeContextMenuHide,
    onNodeRowContextMenu: input.bulkContextMenuWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: input.bulkContextMenuWiring.onOpenDocumentFromContextMenuClick,
    onSortByItemFromContextMenuClick: input.bulkContextMenuWiring.onSortByItemFromContextMenuClick,
    onNodeClose: input.expandHandlersWiring.onNodeClose,
    onNodeOpen: input.expandHandlersWiring.onNodeOpen,
    onNodeOpenIconClick: input.expandHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: input.expandHandlersWiring.onNodeOpenIconPointerDown,
    onNonWorldOpenIconClick: input.expandHandlersWiring.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: input.expandHandlersWiring.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: input.expandHandlersWiring.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: input.expandHandlersWiring.onWorldNodeRowPointerDown,
    rootDroppableHandler,
    setTreeComponentRef: input.setTreeComponentRef,
    setTreeScrollHostRef: input.setTreeScrollHostRef
  }
}

export function createProjectHierarchyTreeSessionHandlersWiring (
  deps: T_projectHierarchyTreeSessionHandlersWiringDeps
) {
  const expandHandlersWiring = createProjectHierarchyTreeSessionExpandHandlersWiring({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getDragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds,
    lazyLoadWiring: deps.lazyLoadWiring,
    openIconExpandAnimationWiring: deps.openIconExpandAnimationWiring,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeComponentRef: deps.treeComponentRef,
    treeData: deps.treeData,
    uiStateWiring: deps.uiStateWiring
  })
  const droppableHandlers = createProjectHierarchyTreeDroppableHandlers({
    dragContext: deps.dragContext,
    treeData: deps.treeData
  })
  const documentOpenHandlers = createProjectHierarchyTreeDocumentOpenHandlers({
    onDocumentOpenRequest: deps.onDocumentOpenRequest
  })
  const addNewDocumentClickHandlers = createProjectHierarchyTreeAddNewDocumentClickHandlers({
    createTemporaryDocument: deps.createTemporaryDocument,
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode
  })
  const clickHandlersWiring = createProjectHierarchyTreeSessionHandlersClickWiring({
    addNewDocumentClickHandlers,
    documentOpenHandlers
  })
  const bulkContextMenuWiring = createProjectHierarchyTreeSessionBulkContextMenuWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    lazyLoadWiring: deps.lazyLoadWiring,
    nextTick: deps.nextTick,
    onAddNewDocumentRowClick: addNewDocumentClickHandlers.onAddNewDocumentRowClick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    runFaAction: deps.runFaAction,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    uiStateWiring: deps.uiStateWiring
  })

  function eachDraggableHandler (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): boolean {
    return isProjectHierarchyTreeNodeDraggable(stat.data)
  }

  function setTreeComponentRef (
    instance: I_faProjectHierarchyTreeHeTreeInstance | null
  ): void {
    deps.treeComponentRef.value = instance
  }

  function setTreeScrollHostRef (element: HTMLElement | null): void {
    deps.treeScrollHostRef.value = element
  }

  return buildProjectHierarchyTreeSessionHandlersReturn({
    bulkContextMenuWiring,
    clickHandlersWiring,
    droppableHandlers,
    eachDraggableHandler,
    expandHandlersWiring,
    setTreeComponentRef,
    setTreeScrollHostRef
  })
}
