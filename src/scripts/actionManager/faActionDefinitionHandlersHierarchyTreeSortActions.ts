import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'
import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeDocumentSortBucket } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId,
  runProjectHierarchyTreeDocumentSort
} from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeDocumentSortRun'

type T_sortHierarchyTreeDocumentsHandlerDeps = {
  S_FaProjectHierarchyTree: () => {
    refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  }
}

type T_sortHierarchyTreeDocumentsRootBucket = {
  parentDocumentId: string | null
  placementId: string
}

function hasSortCompletedBuckets (
  error: unknown
): error is Error & { completedBuckets: I_faProjectHierarchyTreeDocumentSortBucket[] } {
  if (!(error instanceof Error)) {
    return false
  }
  return Array.isArray((error as Error & { completedBuckets?: unknown }).completedBuckets)
}

function resolveSortRootBucket (
  payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
): T_sortHierarchyTreeDocumentsRootBucket | null {
  if (payload.placementId.trim().length === 0) {
    return null
  }
  if (payload.nodeKind === 'templatePlacement') {
    return {
      parentDocumentId: null,
      placementId: payload.placementId
    }
  }
  const documentId = payload.documentId
  if (documentId === null || documentId === undefined || documentId.trim().length === 0) {
    return null
  }
  return {
    parentDocumentId: documentId,
    placementId: payload.placementId
  }
}

export function createFaActionDefinitionHandlersHierarchyTreeSortActions (
  deps: T_sortHierarchyTreeDocumentsHandlerDeps
): {
    handleSortHierarchyTreeDocuments: (
      payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  async function handleSortHierarchyTreeDocuments (
    payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
  ): Promise<T_faActionHandlerContinuation | void> {
    const root = resolveSortRootBucket(payload)
    if (root === null) {
      return
    }
    const api = window.faContentBridgeAPIs?.projectContent
    if (
      typeof api?.listPlacementDocumentChildren !== 'function' ||
      typeof api?.reindexDocumentSiblingsInHierarchy !== 'function'
    ) {
      throw new Error('Project hierarchy sort bridge is unavailable')
    }
    let buckets
    try {
      buckets = await runProjectHierarchyTreeDocumentSort({
        direction: payload.direction,
        key: payload.key,
        listPlacementDocumentChildren: (listInput) => api.listPlacementDocumentChildren(listInput),
        reindexDocumentSiblingsInHierarchy: (reindexInput) => {
          return api.reindexDocumentSiblingsInHierarchy(reindexInput)
        },
        root,
        scope: payload.scope
      })
    } catch (error) {
      if (hasSortCompletedBuckets(error)) {
        const partialTreeNodeIds = error.completedBuckets.map(
          resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId
        )
        if (partialTreeNodeIds.length > 0) {
          deps.S_FaProjectHierarchyTree().refreshHierarchyTreeNodes(partialTreeNodeIds)
        }
      }
      throw error
    }
    const treeNodeIds = buckets.map(resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId)
    deps.S_FaProjectHierarchyTree().refreshHierarchyTreeNodes(treeNodeIds)
    return {
      payloadPreview: `${payload.scope}:${payload.key}:${payload.direction}`
    }
  }

  return {
    handleSortHierarchyTreeDocuments
  }
}
