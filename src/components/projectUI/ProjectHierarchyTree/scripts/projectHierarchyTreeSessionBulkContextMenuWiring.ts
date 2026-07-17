import type { Ref } from 'vue'

import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeBulkExpandCollapseWiring } from './projectHierarchyTreeBulkExpandCollapseWiring'
import { buildProjectHierarchyTreeNodeContextMenuCopyHandlers } from './projectHierarchyTreeNodeContextMenuCopyWiring'
import { buildProjectHierarchyTreeNodeContextMenuDocumentActionHandlers } from './projectHierarchyTreeNodeContextMenuDocumentActionWiring'
import { createProjectHierarchyTreeNodeContextMenuWiring } from './projectHierarchyTreeNodeContextMenuWiring'

export function createProjectHierarchyTreeSessionBulkContextMenuWiring (deps: {
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  nextTick: () => Promise<void>
  onAddNewDocumentRowClick: (node: I_faProjectHierarchyTreeHeTreeNode) => void
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  resolvePreferredLanguageCode: () => import('app/types/faUserSettingsLanguageRegistry').T_faUserSettingsLanguageCode
  runDeferredLazyLoadBatch: (runBatch: () => Promise<void>) => Promise<void>
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
  uiStateWiring: {
    reapplyHeTreeOpenState: () => void
    reapplyLatentDescendantExpandState: (options?: {
      deferHeTreeOpen?: boolean
    }) => Promise<void>
  }
}) {
  const bulkExpandCollapseWiring = createProjectHierarchyTreeBulkExpandCollapseWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    reapplyHeTreeOpenState: deps.uiStateWiring.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.uiStateWiring.reapplyLatentDescendantExpandState,
    runDeferredLazyLoadBatch: deps.runDeferredLazyLoadBatch,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey
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

  return {
    contextMenuAddNewRowIcon: nodeContextMenuWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: nodeContextMenuWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: nodeContextMenuWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: nodeContextMenuWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: nodeContextMenuWiring.contextMenuShowsCopyRows,
    isNodeContextMenuOpen: nodeContextMenuWiring.isNodeContextMenuOpen,
    nodeMenuPointerPosition: nodeContextMenuWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: nodeContextMenuWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      documentActionHandlers.onAddNewDocumentUnderThisClick,
    onCollapseAllUnderNodeClick: nodeContextMenuWiring.onCollapseAllUnderNodeClick,
    onCopyBackgroundColorFromContextMenuClick: copyHandlers.onCopyBackgroundColorClick,
    onCopyDocumentFromContextMenuClick: documentActionHandlers.onCopyDocumentClick,
    onCopyNameFromContextMenuClick: copyHandlers.onCopyNameClick,
    onCopyTextColorFromContextMenuClick: copyHandlers.onCopyTextColorClick,
    onDeleteDocumentFromContextMenuClick: documentActionHandlers.onDeleteDocumentClick,
    onEditDocumentFromContextMenuClick: documentActionHandlers.onEditDocumentClick,
    onExpandAllUnderNodeClick: nodeContextMenuWiring.onExpandAllUnderNodeClick,
    onNodeContextMenuHide: nodeContextMenuWiring.onNodeContextMenuHide,
    onNodeRowContextMenu: nodeContextMenuWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: documentActionHandlers.onOpenDocumentClick
  }
}
