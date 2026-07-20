import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import type { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import type { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'

import { resolveProjectHierarchyTreeHeTreeNodeKey } from '../functions/projectHierarchyTreeHeTreeNodeKey'

type T_handlersWiring = ReturnType<typeof createProjectHierarchyTreeSessionHandlersWiring>
type T_subWiring = ReturnType<typeof createProjectHierarchyTreeSessionSubWiring>

export function buildProjectHierarchyTreeSessionApi (deps: {
  handlersWiring: T_handlersWiring
  isTreeDragActive: Ref<boolean>
  openIconExpandAnimationWiring: {
    isOpenIconExpandAnimationPending: (nodeId: string) => boolean
    isProjectHierarchyTreeOpenIconExpandedForOpenIcon: (nodeId: string, statOpen: boolean) => boolean
  }
  subWiring: T_subWiring
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
}) {
  return {
    contextMenuAddNewRowIcon: deps.handlersWiring.contextMenuAddNewRowIcon,
    contextMenuAddNewRowLabel: deps.handlersWiring.contextMenuAddNewRowLabel,
    contextMenuAnchorNodeId: deps.handlersWiring.contextMenuAnchorNodeId,
    contextMenuShowsBulkExpandRows: deps.handlersWiring.contextMenuShowsBulkExpandRows,
    contextMenuShowsCopyRows: deps.handlersWiring.contextMenuShowsCopyRows,
    contextMenuShowsSortByRows: deps.handlersWiring.contextMenuShowsSortByRows,
    eachDraggableHandler: deps.handlersWiring.eachDraggableHandler,
    eachDroppableHandler: deps.handlersWiring.eachDroppableHandler,
    isNodeContextMenuOpen: deps.handlersWiring.isNodeContextMenuOpen,
    isOpenIconExpandAnimationPending: deps.openIconExpandAnimationWiring.isOpenIconExpandAnimationPending,
    isProjectHierarchyTreeOpenIconExpandedForOpenIcon:
      deps.openIconExpandAnimationWiring.isProjectHierarchyTreeOpenIconExpandedForOpenIcon,
    isTreeDragActive: deps.isTreeDragActive,
    nodeMenuPointerPosition: deps.handlersWiring.nodeMenuPointerPosition,
    onAddNewDocumentFromContextMenuClick: deps.handlersWiring.onAddNewDocumentFromContextMenuClick,
    onAddNewDocumentUnderThisFromContextMenuClick:
      deps.handlersWiring.onAddNewDocumentUnderThisFromContextMenuClick,
    onCollapseAllUnderNodeClick: deps.handlersWiring.onCollapseAllUnderNodeClick,
    onCopyBackgroundColorFromContextMenuClick: deps.handlersWiring.onCopyBackgroundColorFromContextMenuClick,
    onCopyDocumentFromContextMenuClick: deps.handlersWiring.onCopyDocumentFromContextMenuClick,
    onCopyNameFromContextMenuClick: deps.handlersWiring.onCopyNameFromContextMenuClick,
    onCopyTextColorFromContextMenuClick: deps.handlersWiring.onCopyTextColorFromContextMenuClick,
    onDeleteDocumentFromContextMenuClick: deps.handlersWiring.onDeleteDocumentFromContextMenuClick,
    onDocumentRowAuxClick: deps.handlersWiring.onDocumentRowAuxClick,
    onEditDocumentFromContextMenuClick: deps.handlersWiring.onEditDocumentFromContextMenuClick,
    onExpandAllUnderNodeClick: deps.handlersWiring.onExpandAllUnderNodeClick,
    onNodeClick: deps.handlersWiring.onNodeClick,
    onNodeClose: deps.handlersWiring.onNodeClose,
    onNodeContextMenuHide: deps.handlersWiring.onNodeContextMenuHide,
    onNodeOpen: deps.handlersWiring.onNodeOpen,
    onNodeOpenIconClick: deps.handlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: deps.handlersWiring.onNodeOpenIconPointerDown,
    onNodeRowContextMenu: deps.handlersWiring.onNodeRowContextMenu,
    onOpenDocumentFromContextMenuClick: deps.handlersWiring.onOpenDocumentFromContextMenuClick,
    onSortByItemFromContextMenuClick: deps.handlersWiring.onSortByItemFromContextMenuClick,
    onNonWorldOpenIconClick: deps.handlersWiring.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: deps.handlersWiring.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: deps.handlersWiring.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: deps.handlersWiring.onWorldNodeRowPointerDown,
    onBeforeDragOpen: deps.subWiring.beforeDragOpenWiring.onBeforeDragOpen,
    onTreeAfterDrop: deps.subWiring.dndWiring.onTreeAfterDrop,
    onBeforeDragStart: deps.subWiring.dndWiring.onBeforeDragStart,
    onTreeDataUpdate: deps.subWiring.dndWiring.onTreeDataUpdate,
    onTreeDragEndCleanup: deps.subWiring.dndWiring.onTreeDragEndCleanup,
    heTreeNodeKey: resolveProjectHierarchyTreeHeTreeNodeKey,
    rootDroppableHandler: deps.handlersWiring.rootDroppableHandler,
    setTreeComponentRef: deps.handlersWiring.setTreeComponentRef,
    setTreeScrollHostRef: deps.handlersWiring.setTreeScrollHostRef,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    treeRootClassList: deps.subWiring.treeRootClassList,
    treeStyle: deps.subWiring.treeStyle
  }
}
