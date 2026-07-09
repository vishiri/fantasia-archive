import type { Ref } from 'vue'
import type { watch as watchFn } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
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
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
}): Promise<void> {
  for (const nodeId of deps.nodeIds) {
    await deps.refreshNodeChildrenFromDatabase(nodeId)
  }
}

export function bindProjectHierarchyTreeSessionPendingRefresh (deps: {
  hierarchyStore: {
    clearPendingDocumentRefreshIds: () => void
    clearPendingHierarchyNodeRefreshIds: () => void
  }
  pendingDocumentRefreshIds: Ref<string[]>
  pendingHierarchyNodeRefreshIds: Ref<string[]>
  refreshNodeChildrenFromDatabase: (nodeId: string) => Promise<void>
  treeData: Ref<I_faProjectHierarchyTreeHeTreeNode[]>
  watch: typeof watchFn
}): void {
  wireProjectHierarchyTreePendingDocumentRefresh({
    clearPendingDocumentRefreshIds: () => deps.hierarchyStore.clearPendingDocumentRefreshIds(),
    clearPendingHierarchyNodeRefreshIds: () => deps.hierarchyStore.clearPendingHierarchyNodeRefreshIds(),
    pendingDocumentRefreshIds: deps.pendingDocumentRefreshIds,
    pendingHierarchyNodeRefreshIds: deps.pendingHierarchyNodeRefreshIds,
    refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase,
    treeData: deps.treeData,
    watch: deps.watch
  })
}

export function wireProjectHierarchyTreePendingDocumentRefresh (deps: {
  clearPendingDocumentRefreshIds: () => void
  clearPendingHierarchyNodeRefreshIds: () => void
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
        refreshNodeChildrenFromDatabase: deps.refreshNodeChildrenFromDatabase
      })
    }
  )
}
