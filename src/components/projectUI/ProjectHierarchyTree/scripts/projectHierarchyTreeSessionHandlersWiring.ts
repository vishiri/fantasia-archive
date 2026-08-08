import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTab,
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDraggable
} from '../functions/projectHierarchyTreeDnD'
import type {
  createProjectHierarchyTreeDocumentRowDragHoldWiring,
  createProjectHierarchyTreeDocumentRowExpandClickGestureWiring
} from './projectHierarchyTreeDocumentRowDragHoldWiring'
import { createProjectHierarchyTreeDroppableHandlers } from './projectHierarchyTreeDnDWiring'
import { createProjectHierarchyTreeDocumentOpenHandlers } from './projectHierarchyTreeSessionHandlersSupportWiring'
import { createProjectHierarchyTreeAddNewDocumentClickHandlers } from './projectHierarchyTreeSyncMapperWiring'
import { createProjectHierarchyTreeSessionExpandHandlersWiring } from './projectHierarchyTreeSessionExpandHandlersWiring'
import { createProjectHierarchyTreeSessionHandlersClickWiring } from './projectHierarchyTreeSessionHandlersSupportWiring'
import { createProjectHierarchyTreeSessionBulkContextMenuWiring } from './projectHierarchyTreeSessionBulkContextMenuWiring'

type T_projectHierarchyTreeSessionHandlersWiringDeps = {
  applyOpenedDocumentTabs?: ((tabs: I_faOpenedDocumentTab[]) => void) | undefined
  createTemporaryDocument: (input: {
    displayName: string
    initialTagsDraft?: import('app/types/I_faProjectTagDomain').I_faProjectDocumentTagAssignmentInput[] | undefined
    openMode: T_faOpenedDocumentOpenMode
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  getOpenedDocumentTabs?: (() => readonly I_faOpenedDocumentTab[]) | undefined
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
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
  refreshHierarchyTreeNodes?: ((nodeIds: string[]) => void) | undefined
  refreshLayout?: (() => Promise<void>) | undefined
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  requestAnimationFrame: (callback: () => void) => number
  resyncTreeDataFromLayout?: (() => void) | undefined
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
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
    contextMenuShowsDocumentOpenEditRows: input.bulkContextMenuWiring.contextMenuShowsDocumentOpenEditRows,
    contextMenuShowsSortByRows: input.bulkContextMenuWiring.contextMenuShowsSortByRows,
    contextMenuSortByDirectScopeOnly: input.bulkContextMenuWiring.contextMenuSortByDirectScopeOnly,
    contextMenuShowsTagMenuRows: input.bulkContextMenuWiring.contextMenuShowsTagMenuRows,
    addDocumentPlacementOptions: input.bulkContextMenuWiring.addDocumentPlacementOptions,
    deleteTagConfirmOpen: input.bulkContextMenuWiring.deleteTagConfirmOpen,
    deleteTagName: input.bulkContextMenuWiring.deleteTagName,
    isNodeContextMenuOpen: input.bulkContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuPointerPosition: input.bulkContextMenuWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: input.bulkContextMenuWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentToThisTagFromContextMenuClick:
      input.bulkContextMenuWiring.onAddNewDocumentToThisTagFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      input.bulkContextMenuWiring.onAddNewDocumentUnderThisFromContextMenuClick,
    onCollapseAllUnderNodeClick: input.bulkContextMenuWiring.onCollapseAllUnderNodeClick,
    onConfirmDeleteTag: input.bulkContextMenuWiring.onConfirmDeleteTag,
    onConfirmRenameTag: input.bulkContextMenuWiring.onConfirmRenameTag,
    onCopyBackgroundColorFromContextMenuClick:
      input.bulkContextMenuWiring.onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick: input.bulkContextMenuWiring.onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick: input.bulkContextMenuWiring.onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick: input.bulkContextMenuWiring.onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick: input.bulkContextMenuWiring.onDeleteDocumentFromContextMenuClick,
    onDeleteTagFromContextMenuClick: input.bulkContextMenuWiring.onDeleteTagFromContextMenuClick,
    onDismissDeleteTagDialog: input.bulkContextMenuWiring.onDismissDeleteTagDialog,
    onDismissRenameTagDialog: input.bulkContextMenuWiring.onDismissRenameTagDialog,
    onDocumentRowAuxClick: input.clickHandlersWiring.onDocumentRowAuxClick,
    onEditDocumentFromContextMenuClick: input.bulkContextMenuWiring.onEditDocumentFromContextMenuClick,
    onExpandAllUnderNodeClick: input.bulkContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeClick: input.clickHandlersWiring.onNodeClick,
    onNodeContextMenuHide: input.bulkContextMenuWiring.onNodeContextMenuHide,
    onNodeRowContextMenu: input.bulkContextMenuWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: input.bulkContextMenuWiring.onOpenDocumentFromContextMenuClick,
    onRenameTagFromContextMenuClick: input.bulkContextMenuWiring.onRenameTagFromContextMenuClick,
    onSortByItemFromContextMenuClick: input.bulkContextMenuWiring.onSortByItemFromContextMenuClick,
    renameTagCanConfirm: input.bulkContextMenuWiring.renameTagCanConfirm,
    renameTagCurrentName: input.bulkContextMenuWiring.renameTagCurrentName,
    renameTagDialogOpen: input.bulkContextMenuWiring.renameTagDialogOpen,
    renameTagMergeWarning: input.bulkContextMenuWiring.renameTagMergeWarning,
    renameTagNameDraft: input.bulkContextMenuWiring.renameTagNameDraft,
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
    getPersistedScrollTopPx: deps.getPersistedScrollTopPx,
    getTreeScrollHost: deps.getTreeScrollHost,
    lazyLoadWiring: deps.lazyLoadWiring,
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
    applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs ?? (() => undefined),
    createTemporaryDocument: deps.createTemporaryDocument,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getOpenedDocumentTabs: deps.getOpenedDocumentTabs ?? (() => []),
    getTreeRef: () => deps.treeComponentRef.value,
    lazyLoadWiring: deps.lazyLoadWiring,
    nextTick: deps.nextTick,
    onAddNewDocumentRowClick: addNewDocumentClickHandlers.onAddNewDocumentRowClick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    refreshHierarchyTreeNodes: deps.refreshHierarchyTreeNodes ?? (() => undefined),
    refreshLayout: deps.refreshLayout ?? (async () => undefined),
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout ?? (() => undefined),
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    runFaAction: deps.runFaAction,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
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
