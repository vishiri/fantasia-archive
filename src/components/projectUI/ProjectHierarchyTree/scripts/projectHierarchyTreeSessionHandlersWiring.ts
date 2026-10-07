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
    placementId?: string | null | undefined
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
  const {
    bulkContextMenuWiring,
    clickHandlersWiring,
    droppableHandlers,
    eachDraggableHandler,
    expandHandlersWiring,
    setTreeComponentRef,
    setTreeScrollHostRef
  } = input
  const { onDocumentRowAuxClick, onNodeClick } = clickHandlersWiring
  return {
    ...bulkContextMenuWiring,
    ...droppableHandlers,
    ...expandHandlersWiring,
    eachDraggableHandler,
    onDocumentRowAuxClick,
    onNodeClick,
    setTreeComponentRef,
    setTreeScrollHostRef
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
