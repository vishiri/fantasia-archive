import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'
import {
  buildProjectHierarchyTreeNodeContextMenuCopyHandlers,
  buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers,
  buildProjectHierarchyTreeNodeContextMenuSortHandlers
} from './projectHierarchyTreeNodeContextMenuHandlersWiring'
import { createProjectHierarchyTreeNodeContextMenuWiring } from './projectHierarchyTreeNodeContextMenuSessionWiring'
import { buildProjectHierarchyTreeSessionBulkContextMenuApi } from './projectHierarchyTreeSessionBulkContextMenuReturnWiring'
import { createProjectHierarchyTreeTagDialogsWiring } from './projectHierarchyTreeTagDialogsWiring'

type T_projectHierarchyTreeSessionBulkContextMenuWiringDeps = {
  applyOpenedDocumentTabs: (tabs: I_faOpenedDocumentTab[]) => void
  createTemporaryDocument: (input: {
    displayName: string
    initialTagsDraft?: Array<{ id: string, name: string }> | undefined
    openMode: 'leftNavigate' | 'middleBackground'
    parentDocumentId: null
    templateId: string
    worldId: string
  }) => Promise<string>
  dragExpandUiFrozen: Ref<boolean>
  getOpenedDocumentTabs: () => readonly I_faOpenedDocumentTab[]
  getTreeRef: () => import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeHeTreeInstance | null
  lazyLoadWiring: {
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  nextTick: () => Promise<void>
  onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  resyncTreeDataFromLayout: () => void
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    reapplyHeTreeOpenState: () => void
    reapplyLatentDescendantExpandState: (options?: {
      deferHeTreeOpen?: boolean
    }) => Promise<void>
  }
}

export function createProjectHierarchyTreeSessionBulkContextMenuWiring (
  deps: T_projectHierarchyTreeSessionBulkContextMenuWiringDeps
) {
  const bulkExpandCollapseWiring = createProjectHierarchyTreeBulkExpandCollapseWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    getTreeRef: deps.getTreeRef,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.uiStateWiring.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.uiStateWiring.reapplyLatentDescendantExpandState,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
  const nodeContextMenuWiring = createProjectHierarchyTreeNodeContextMenuWiring({
    bulkExpandCollapseWiring,
    onAddNewDocumentRowClick: deps.onAddNewDocumentRowClick,
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    treeData: deps.treeData
  })
  const copyHandlers = buildProjectHierarchyTreeNodeContextMenuCopyHandlers({
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    runFaAction: deps.runFaAction,
    treeData: deps.treeData
  })
  const documentActionHandlers = buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers({
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    runFaAction: deps.runFaAction,
    treeData: deps.treeData
  })
  const sortHandlers = buildProjectHierarchyTreeNodeContextMenuSortHandlers({
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    isNodeContextMenuOpen: nodeContextMenuWiring.isNodeContextMenuOpen,
    runFaAction: deps.runFaAction,
    treeData: deps.treeData
  })
  const tagDialogsWiring = createProjectHierarchyTreeTagDialogsWiring({
    applyOpenedDocumentTabs: deps.applyOpenedDocumentTabs,
    createTemporaryDocument: deps.createTemporaryDocument,
    getOpenedDocumentTabs: deps.getOpenedDocumentTabs,
    refreshHierarchyTreeNodes: deps.refreshHierarchyTreeNodes,
    refreshLayout: deps.refreshLayout,
    resolvePreferredLanguageCode: deps.resolvePreferredLanguageCode,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    treeData: deps.treeData
  })

  function onNodeRowContextMenu (
    node: I_faProjectHierarchyTreeHeTreeNode,
    event: MouseEvent
  ): void {
    tagDialogsWiring.setTagContextMenuAnchorNodeId(node.nodeKind === 'tag' ? node.id : null)
    nodeContextMenuWiring.onNodeRowContextMenu(node, event)
  }
  function onNodeContextMenuHide (): void {
    tagDialogsWiring.setTagContextMenuAnchorNodeId(null)
    nodeContextMenuWiring.onNodeContextMenuHide()
  }
  return buildProjectHierarchyTreeSessionBulkContextMenuApi({
    copyHandlers,
    documentActionHandlers,
    nodeContextMenuWiring,
    onNodeContextMenuHide,
    onNodeRowContextMenu,
    sortHandlers,
    tagDialogsWiring
  })
}
