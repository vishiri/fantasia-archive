import type { Ref } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeInstance, I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { isProjectHierarchyTreeDragExpandUiFrozen } from '../functions/projectHierarchyTreeDragExpandFreeze'
import { runProjectHierarchyTreePostDragExpandCloseGuard } from './projectHierarchyTreePostDragExpandCloseGuardWiring'
import { createProjectHierarchyTreeExpandRowClickRouting } from './projectHierarchyTreeExpandRowClickRoutingWiring'
import { createProjectHierarchyTreeSessionExpandOpenHandlersWiring } from './projectHierarchyTreeSessionExpandOpenHandlersWiring'
import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'

export function createProjectHierarchyTreeSessionExpandHandlersWiring (deps: {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  getDragExpandedSnapshotNodeIds: () => string[] | null
  lazyLoadWiring: {
    flushDeferredTreeRevisionPublish: () => void | Promise<void>
    loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  }
  suppressTreeEmit: Ref<boolean>
  treeComponentRef: Ref<I_faProjectHierarchyTreeHeTreeInstance | null>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  uiStateWiring: {
    markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
    markNodeOpen: (nodeId: string) => void
    reapplyLatentDescendantExpandState: () => Promise<void>
  }
}) {
  function shouldIgnoreExpandPersistMutation (): boolean {
    return isProjectHierarchyTreeDragExpandUiFrozen({
      dragExpandUiFrozen: deps.dragExpandUiFrozen.value
    }) || deps.suppressTreeEmit.value
  }

  function onNodeClose (stat: { data: I_faProjectHierarchyTreeHeTreeNode }): void {
    if (shouldIgnoreExpandPersistMutation()) {
      return
    }
    runProjectHierarchyTreePostDragExpandCloseGuard({
      dragExpandPostCommitGuard: () => deps.dragExpandPostCommitGuard.value,
      getDragExpandedSnapshotNodeIds: deps.getDragExpandedSnapshotNodeIds,
      markNodeClosed: deps.uiStateWiring.markNodeClosed,
      node: stat.data,
      nodeId: stat.data.id,
      treeData: deps.treeData
    })
  }

  const expandOpenHandlersWiring = createProjectHierarchyTreeSessionExpandOpenHandlersWiring({
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    lazyLoadWiring: deps.lazyLoadWiring,
    onNodeClose,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeComponentRef: deps.treeComponentRef,
    uiStateWiring: deps.uiStateWiring
  })

  const expandRowClickRouting = createProjectHierarchyTreeExpandRowClickRouting({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    onNodeOpenIconClick: expandOpenHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: expandOpenHandlersWiring.onNodeOpenIconPointerDown
  })

  return {
    onNodeClose,
    onNodeOpen: expandOpenHandlersWiring.onNodeOpen,
    onNodeOpenIconClick: expandOpenHandlersWiring.onNodeOpenIconClick,
    onNodeOpenIconPointerDown: expandOpenHandlersWiring.onNodeOpenIconPointerDown,
    onNonWorldOpenIconClick: expandRowClickRouting.onNonWorldOpenIconClick,
    onNonWorldOpenIconPointerDown: expandRowClickRouting.onNonWorldOpenIconPointerDown,
    onWorldNodeRowClick: expandRowClickRouting.onWorldNodeRowClick,
    onWorldNodeRowPointerDown: expandRowClickRouting.onWorldNodeRowPointerDown
  }
}
