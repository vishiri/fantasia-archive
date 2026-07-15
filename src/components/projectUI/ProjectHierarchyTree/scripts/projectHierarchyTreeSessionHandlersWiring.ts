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
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  treeScrollHostRef: Ref<HTMLElement | null>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
    reapplyHeTreeOpenState: () => void
    reapplyLatentDescendantExpandState: () => Promise<void>
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

  return {
    eachDraggableHandler,
    eachDroppableHandler: droppableHandlers.eachDroppableHandler,
    contextMenuAddNewRowIcon: bulkContextMenuWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: bulkContextMenuWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: bulkContextMenuWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: bulkContextMenuWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: bulkContextMenuWiring.contextMenuShowsCopyRows,
    isNodeContextMenuOpen: bulkContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuPointerPosition: bulkContextMenuWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: bulkContextMenuWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      bulkContextMenuWiring.onAddNewDocumentUnderThisFromContextMenuClick,
    onCollapseAllUnderNodeClick: bulkContextMenuWiring.onCollapseAllUnderNodeClick,
    onCopyBackgroundColorFromContextMenuClick: bulkContextMenuWiring.onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick: bulkContextMenuWiring.onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick: bulkContextMenuWiring.onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick: bulkContextMenuWiring.onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick: bulkContextMenuWiring.onDeleteDocumentFromContextMenuClick,
    onDocumentRowAuxClick: clickHandlersWiring.onDocumentRowAuxClick,
    onEditDocumentFromContextMenuClick: bulkContextMenuWiring.onEditDocumentFromContextMenuClick,
    onExpandAllUnderNodeClick: bulkContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeClick: clickHandlersWiring.onNodeClick,
    onNodeContextMenuHide: bulkContextMenuWiring.onNodeContextMenuHide,
    onNodeRowContextMenu: bulkContextMenuWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: bulkContextMenuWiring.onOpenDocumentFromContextMenuClick,
    onNodeClose: expandHandlersWiring.onNodeClose,
    onNodeOpen: expandHandlersWiring.onNodeOpen,
    onNodeOpenIconClick: expandHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: expandHandlersWiring.onNodeOpenIconPointerDown,
    onNonWorldOpenIconClick: expandHandlersWiring.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: expandHandlersWiring.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: expandHandlersWiring.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: expandHandlersWiring.onWorldNodeRowPointerDown,
    rootDroppableHandler: droppableHandlers.rootDroppableHandler,
    setTreeComponentRef,
    setTreeScrollHostRef
  }
}
