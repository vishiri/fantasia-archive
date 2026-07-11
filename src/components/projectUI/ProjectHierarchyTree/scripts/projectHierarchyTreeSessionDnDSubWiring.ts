import type { Ref } from 'vue'

import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

import type { createProjectHierarchyTreeDocumentRowDragHoldWiring } from './projectHierarchyTreeDocumentRowDragHoldWiring'
import type { createProjectHierarchyTreeDocumentRowExpandClickGestureWiring } from './projectHierarchyTreeDocumentRowExpandClickGestureWiring'
import { createProjectHierarchyTreeDnDWiring } from './projectHierarchyTreeDnDWiring'
import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'

type T_sessionDnDSubDeps = {
  documentRowDragHoldWiring: ReturnType<typeof createProjectHierarchyTreeDocumentRowDragHoldWiring>
  documentRowExpandClickGesture: ReturnType<typeof createProjectHierarchyTreeDocumentRowExpandClickGestureWiring>
  dragCommitPending: Ref<boolean>
  dragCommitScheduled: Ref<boolean>
  dragDropCommitted: Ref<boolean>
  dragExpandPostCommitGuard: Ref<boolean>
  dragExpandUiFrozen: Ref<boolean>
  flushDeferredTreeRevisionPublish: () => void | Promise<void>
  flushUiStatePersist: () => void
  getTreeRef: () => I_faProjectHierarchyTreeHeTreeInstance | null
  getTreeScrollHost: () => HTMLElement | null
  hierarchyStore: {
    flushUiStatePersist: () => void
    queuePersistExpandedNodeIds: (expandedNodeIds: string[]) => void
    refreshLayout: () => Promise<void>
  }
  isTreeDragActive: Ref<boolean>
  loadChildrenForNode: (node: I_faProjectHierarchyTreeHeTreeNode) => Promise<void>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  markNodeClosed: (nodeId: string, node: I_faProjectHierarchyTreeHeTreeNode) => void
  markNodeOpen: (nodeId: string) => void
  nextTick: () => Promise<void>
  openNodeIds: Ref<Set<string>>
  reapplyHeTreeOpenState: () => void
  reapplyLatentDescendantExpandState: () => Promise<void>
  resyncTreeDataFromLayout: () => void
  restoreExpandedSnapshot: (
    expandedNodeIds: string[],
    restoreOptions?: import('app/types/I_faProjectHierarchyTreeDomain').I_faProjectHierarchyTreeExpandedSnapshotRestoreOptions
  ) => Promise<void>
  suppressTreeEmit: Ref<boolean>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}

export function createProjectHierarchyTreeSessionDnDSubWiring (deps: T_sessionDnDSubDeps) {
  return createProjectHierarchyTreeDnDWiring({
    documentRowDragHoldWiring: deps.documentRowDragHoldWiring,
    documentRowExpandClickGesture: deps.documentRowExpandClickGesture,
    dragCommitPending: deps.dragCommitPending,
    dragCommitScheduled: deps.dragCommitScheduled,
    dragDropCommitted: deps.dragDropCommitted,
    dragExpandPostCommitGuard: deps.dragExpandPostCommitGuard,
    dragExpandUiFrozen: deps.dragExpandUiFrozen,
    flushDeferredTreeRevisionPublish: deps.flushDeferredTreeRevisionPublish,
    flushUiStatePersist: deps.flushUiStatePersist,
    getTreeRef: deps.getTreeRef,
    getTreeScrollHost: deps.getTreeScrollHost,
    isTreeDragActive: deps.isTreeDragActive,
    loadChildrenForNode: deps.loadChildrenForNode,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    markNodeClosed: deps.markNodeClosed,
    markNodeOpen: deps.markNodeOpen,
    reindexDocumentSiblingsInHierarchy: async (input) => {
      const api = window.faContentBridgeAPIs?.projectContent
      if (typeof api?.reindexDocumentSiblingsInHierarchy !== 'function') {
        throw new Error('reindexDocumentSiblingsInHierarchy unavailable')
      }
      return await api.reindexDocumentSiblingsInHierarchy(input) as I_faProjectHierarchyTreeDocumentChild
    },
    nextTick: deps.nextTick,
    reapplyHeTreeOpenState: deps.reapplyHeTreeOpenState,
    reapplyLatentDescendantExpandState: deps.reapplyLatentDescendantExpandState,
    openNodeIds: deps.openNodeIds,
    queuePersistExpandedNodeIds: (expandedNodeIds) => {
      deps.hierarchyStore.queuePersistExpandedNodeIds(expandedNodeIds)
    },
    refreshLayout: deps.hierarchyStore.refreshLayout,
    resyncTreeDataFromLayout: deps.resyncTreeDataFromLayout,
    restoreExpandedSnapshot: deps.restoreExpandedSnapshot,
    suppressTreeEmit: deps.suppressTreeEmit,
    treeData: deps.treeData
  })
}
