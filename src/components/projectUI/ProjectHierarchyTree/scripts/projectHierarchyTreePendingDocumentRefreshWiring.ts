import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { openProjectHierarchyTreeNodeInHeTree } from './projectHierarchyTreeNestParentOpenWiring'
import type { createProjectHierarchyTreeSessionEarlyWiring } from './projectHierarchyTreeSessionEarlyWiring'
import { collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh } from '../functions/projectHierarchyTreeDocumentParentBucket'

export async function flushPendingProjectHierarchyTreeDocumentRefresh (deps: {
  documentIds: readonly string[]
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
}): Promise<void> {
  if (deps.documentIds.length === 0) {
    return
  }
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    deps.treeData.value,
    deps.documentIds
  )
  for (const parentNodeId of parentNodeIds) {
    await deps.refreshNodeChildrenFromDatabase(parentNodeId)
  }
}

export async function flushPendingProjectHierarchyTreeNodeRefresh (deps: {
  nodeIds: readonly string[]
  openRefreshedNodeInTree?: ((nodeId: string) => Promise<void>) | undefined
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
}): Promise<void> {
  for (const nodeId of deps.nodeIds) {
    await deps.refreshNodeChildrenFromDatabase(nodeId)
    if (deps.openRefreshedNodeInTree !== undefined) {
      await deps.openRefreshedNodeInTree(nodeId)
    }
  }
}

export function bindProjectHierarchyTreeSessionPendingRefresh (deps: {
  hierarchyStore: {
    clearPendingDocumentRefreshIds: () => void
    clearPendingHierarchyNodeRefreshIds: () => void
  }
  openRefreshedNodeInTree?: ((nodeId: string) => Promise<void>) | undefined
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
}): void {
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => deps.hierarchyStore.clearPendingDocumentRefreshIds(),
    clearPendingHierarchyNodeRefreshIds: () => deps.hierarchyStore.clearPendingHierarchyNodeRefreshIds(),
    openRefreshedNodeInTree: deps.openRefreshedNodeInTree,
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds: deps.pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData,
    watch: deps.watch
  })
}

export function bindProjectHierarchyTreeSessionPendingRefreshFromEarlyWiring (deps: {
  earlyWiring: ReturnType<typeof createProjectHierarchyTreeSessionEarlyWiring>
  hierarchyStore: {
    clearPendingDocumentRefreshIds: () => void
    clearPendingHierarchyNodeRefreshIds: () => void
  }
  nextTick: () => Promise<void>
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
}): void {
  bindProjectHierarchyTreeSessionPendingRefresh({
    hierarchyStore: deps.hierarchyStore,
    openRefreshedNodeInTree: async (nodeId) => {
      await openProjectHierarchyTreeNodeInHeTree({
        getTreeRef: () => deps.earlyWiring.bootstrap.sessionRefs.treeComponentRef.value,
        markNodeOpen: deps.earlyWiring.subWiring.uiStateWiring.markNodeOpen,
        nextTick: deps.nextTick,
        nodeId,
        treeData: deps.treeData
      })
    },
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds: deps.pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase: deps.earlyWiring.subWiring.lazyLoadWiring.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData,
    watch: deps.watch
  })
}

export function wireProjectHierarchyTreePendingDocumentRefresh (deps: {
  clearPendingDocumentRefreshIds: () => void
  clearPendingHierarchyNodeRefreshIds: () => void
  openRefreshedNodeInTree?: ((nodeId: string) => Promise<void>) | undefined
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
}): void {
  deps.watch(
    () => [...deps.pendingDocumentRefreshIds.value],
    () => {
      const documentIds = deps.pendingDocumentRefreshIds.value
      if (documentIds.length === 0) {
        return
      }
      deps.clearPendingDocumentRefreshIds()
      void flushPendingProjectHierarchyTreeDocumentRefresh({
        documentIds,
        refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
        treeData: deps.treeData
      })
    }
  )
  deps.watch(
    () => [...deps.pendingHierarchyNodeRefreshIds.value],
    () => {
      const nodeIds = deps.pendingHierarchyNodeRefreshIds.value
      if (nodeIds.length === 0) {
        return
      }
      deps.clearPendingHierarchyNodeRefreshIds()
      void flushPendingProjectHierarchyTreeNodeRefresh({
        nodeIds,
        openRefreshedNodeInTree: deps.openRefreshedNodeInTree,
        refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase
      })
    }
  )
}
