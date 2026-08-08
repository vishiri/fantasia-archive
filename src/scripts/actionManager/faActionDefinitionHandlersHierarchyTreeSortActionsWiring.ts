import { ResultAsync } from 'neverthrow'

import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'
import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeDocumentSortBucket } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  getFaComponentTestingProjectContentOverrides,
  hasFaProjectHierarchySortBridge,
  listFaProjectPlacementDocumentChildrenForRenderer,
  reindexFaProjectDocumentSiblingsForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import {
  listFaProjectDocumentsUnderTagForRenderer,
  reorderFaProjectDocumentsUnderTagForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'
import {
  resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId,
  runProjectHierarchyTreeDocumentSort
} from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeDocumentSortRun'
import { sortProjectHierarchyTreeTagDocumentChildren } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeTagDocumentSort'

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

async function runSortHierarchyTreeDocumentsUnderTag (
  payload: I_faActionPayloadMap['sortHierarchyTreeDocuments'],
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void
): Promise<T_faActionHandlerContinuation | void> {
  const tagId = payload.tagId
  if (
    typeof tagId !== 'string' ||
    tagId.trim().length === 0 ||
    payload.scope !== 'direct'
  ) {
    return
  }
  const overrides = getFaComponentTestingProjectContentOverrides()
  const api = window.faContentBridgeAPIs?.projectContent
  if (
    overrides?.documentsUnderTagByTagId === undefined &&
    (
      typeof api?.listDocumentsUnderTag !== 'function' ||
      typeof api?.reorderDocumentsUnderTag !== 'function'
    )
  ) {
    throw new Error('Project hierarchy under-tag sort bridge is unavailable')
  }
  const listed = await listFaProjectDocumentsUnderTagForRenderer({ tagId })
  if (listed.items.length === 0) {
    return {
      payloadPreview: `${payload.scope}:${payload.key}:${payload.direction}:tag`
    }
  }
  const ordered = sortProjectHierarchyTreeTagDocumentChildren(
    listed.items,
    payload.key,
    payload.direction
  )
  const orderedDocumentIds = ordered.map((item) => item.documentId)
  await reorderFaProjectDocumentsUnderTagForRenderer({
    orderedDocumentIds,
    tagId
  })
  refreshHierarchyTreeNodes([tagId])
  return {
    payloadPreview: `${payload.scope}:${payload.key}:${payload.direction}:tag`
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
    if (payload.nodeKind === 'tag') {
      return await runSortHierarchyTreeDocumentsUnderTag(
        payload,
        (nodeIds) => {
          deps.S_FaProjectHierarchyTree().refreshHierarchyTreeNodes(nodeIds)
        }
      )
    }
    const root = resolveSortRootBucket(payload)
    if (root === null) {
      return
    }
    if (!hasFaProjectHierarchySortBridge()) {
      throw new Error('Project hierarchy sort bridge is unavailable')
    }
    const sortResult = await ResultAsync.fromPromise(
      runProjectHierarchyTreeDocumentSort({
        direction: payload.direction,
        key: payload.key,
        listPlacementDocumentChildren: (listInput) => {
          return listFaProjectPlacementDocumentChildrenForRenderer(listInput)
        },
        reindexDocumentSiblingsInHierarchy: (reindexInput) => {
          return reindexFaProjectDocumentSiblingsForRenderer(reindexInput)
        },
        root,
        scope: payload.scope
      }),
      (error): unknown => error
    )
    if (sortResult.isErr()) {
      const error = sortResult.error
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
    const buckets = sortResult.value
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
