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
  subWiring: T_subWiring
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
}) {
  return {
    eachDraggableHandler: deps.handlersWiring.eachDraggableHandler,
    eachDroppableHandler: deps.handlersWiring.eachDroppableHandler,
    isTreeDragActive: deps.isTreeDragActive,
    onAddNewDocumentRowContextMenu: deps.handlersWiring.onAddNewDocumentRowContextMenu,
    onNodeClick: deps.handlersWiring.onNodeClick,
    onDocumentRowAuxClick: deps.handlersWiring.onDocumentRowAuxClick,
    onNodeClose: deps.handlersWiring.onNodeClose,
    onNodeOpen: deps.handlersWiring.onNodeOpen,
    onNodeOpenIconClick: deps.handlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: deps.handlersWiring.onNodeOpenIconPointerDown,
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
