import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDraggable
} from '../functions/projectHierarchyTreeDnD'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeDroppableHandlers } from './projectHierarchyTreeDroppableHandlerWiring'
import { createProjectHierarchyTreeSessionExpandHandlersWiring } from './projectHierarchyTreeSessionExpandHandlersWiring'

export function createProjectHierarchyTreeSessionHandlersWiring (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragContext: {
    dragNode: {
      data: I_faProjectHierarchyTreeHeTreeNode
    } | null
  }
  dragExpandUiFrozen: Ref<boolean>
  lazyLoadWiring: {
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  onDocumentClick: (documentId: string) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeScrollHostRef: Ref<HTMLElement | null>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
  }
}) {
  const expandHandlersWiring = createProjectHierarchyTreeSessionExpandHandlersWiring({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    lazyLoadWiring: deps.lazyLoadWiring,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeComponentRef: deps.treeComponentRef,
    uiStateWiring: deps.uiStateWiring
  })
  const droppableHandlers = createProjectHierarchyTreeDroppableHandlers({
    dragContext: deps.dragContext,
    treeData: deps.treeData
  })

  function onNodeClick (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
    if (stat.data.nodeKind !== 'document' || stat.data.documentId === null) {
      return
    }
    deps.onDocumentClick(stat.data.documentId)
  }

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
    onNodeClick,
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
