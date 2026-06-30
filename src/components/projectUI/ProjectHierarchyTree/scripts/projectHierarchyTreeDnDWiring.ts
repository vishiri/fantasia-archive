import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeDragCancelWiring } from './projectHierarchyTreeDragCancelWiring'
import { createProjectHierarchyTreeDnDHandlers } from './projectHierarchyTreeDnDHandlersWiring'

export function createProjectHierarchyTreeDnDWiring (deps: {
  bumpTreeMountKey: () => void
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  isTreeDragActive: Ref<boolean>
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  moveDocumentInHierarchy: (input: {
    documentId: string
    targetParentDocumentId: string | null
    targetSortOrder: number
  }) => Promise<unknown>
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
  refreshLayout: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (expandedNodeIds: string[]) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}) {
  let draggedDocumentId: string | null = null
  let dragExpandedSnapshot: string[] | null = null

  function clearDragSessionFlags (): void {
    deps.isTreeDragActive.value = false
    deps.dragCommitPending.value = false
    deps.dragCommitScheduled.value = false
    deps.dragDropCommitted.value = false
    draggedDocumentId = null
    dragExpandedSnapshot = null
  }

  function removeDragCancelListeners (): void {
    window.removeEventListener('pointerup', dragCancelWiring.onWindowPointerUpDuringDrag)
    window.removeEventListener('keydown', dragCancelWiring.onWindowKeydownDuringDrag)
  }

  const dragCancelWiring = createProjectHierarchyTreeDragCancelWiring({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    clearDragSessionFlags,
    dragCommitPending: deps.dragCommitPending,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    dragExpandedSnapshot: () => dragExpandedSnapshot,
    nextTick: deps.nextTick,
    removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot
  })

  return createProjectHierarchyTreeDnDHandlers({
    bumpTreeMountKey: deps.bumpTreeMountKey,
    clearDragSessionFlags,
    dragCancelWiring,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    draggedDocumentId: {
      get: () => draggedDocumentId,
      set: (value) => {
        draggedDocumentId = value
      }
    },
    dragExpandedSnapshot: {
      get: () => dragExpandedSnapshot,
      set: (value) => {
        dragExpandedSnapshot = value
      }
    },
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: deps.loadChildrenForNode,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    moveDocumentInHierarchy: deps.moveDocumentInHierarchy,
    nextTick: deps.nextTick,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: deps.queuePersistExpandedNodeIds,
    refreshLayout: deps.refreshLayout,
    removeDragCancelListeners,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}
