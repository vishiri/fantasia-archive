import type { Ref } from 'vue'

import type {
  I_faOpenedDocumentTreeOpenMeta,
  T_faOpenedDocumentOpenMode
} from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  isProjectHierarchyTreeNodeDraggable
} from '../functions/projectHierarchyTreeDnD'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeDroppableHandlers } from './projectHierarchyTreeDroppableHandlerWiring'
import { createProjectHierarchyTreeDocumentOpenHandlers } from './projectHierarchyTreeDocumentOpenHandlersWiring'
import { createProjectHierarchyTreeSessionExpandHandlersWiring } from './projectHierarchyTreeSessionExpandHandlersWiring'

export function createProjectHierarchyTreeSessionHandlersWiring (deps: {
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
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  onDocumentOpenRequest: (
    documentId: string,
    mode: T_faOpenedDocumentOpenMode,
    treeMeta: I_faOpenedDocumentTreeOpenMeta
  ) => void
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  treeScrollHostRef: Ref<HTMLElement | null>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
    reapplyLatentDescendantExpandState: () => Promise<void>
  }
}) {
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
    onDocumentRowAuxClick: documentOpenHandlers.onDocumentRowAuxClick,
    onNodeClick: documentOpenHandlers.onNodeClick,
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
