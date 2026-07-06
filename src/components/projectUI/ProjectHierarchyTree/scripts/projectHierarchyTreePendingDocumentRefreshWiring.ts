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

export function wireProjectHierarchyTreePendingDocumentRefresh (deps: {
  clearPendingDocumentRefreshIds: () => void
  pendingDocumentRefreshIds: Ref<string[]>
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
}
