import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import type { createProjectHierarchyTreeSessionHandlersWiring } from './projectHierarchyTreeSessionHandlersWiring'
import type { createProjectHierarchyTreeSessionSubWiring } from './projectHierarchyTreeSessionSubWiring'

type T_handlersWiring = ReturnType<typeof createProjectHierarchyTreeSessionHandlersWiring>
type T_subWiring = ReturnType<typeof createProjectHierarchyTreeSessionSubWiring>

export function buildProjectHierarchyTreeSessionApi (deps: {
  handlersWiring: T_handlersWiring
  subWiring: T_subWiring
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeMountKey: Ref<number>
}) {
  return {
    eachDraggableHandler: deps.handlersWiring.eachDraggableHandler,
    eachDroppableHandler: deps.handlersWiring.eachDroppableHandler,
    onNodeClick: deps.handlersWiring.onNodeClick,
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
    rootDroppableHandler: deps.handlersWiring.rootDroppableHandler,
    setTreeComponentRef: deps.handlersWiring.setTreeComponentRef,
    setTreeScrollHostRef: deps.handlersWiring.setTreeScrollHostRef,
    treeData: deps.treeData,
    treeMountKey: deps.treeMountKey,
    treeRootClassList: deps.subWiring.treeRootClassList,
    treeStyle: deps.subWiring.treeStyle
  }
}
