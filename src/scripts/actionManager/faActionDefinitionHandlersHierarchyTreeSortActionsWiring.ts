import { ResultAsync } from 'neverthrow'

import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'
import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectHierarchyTreeDocumentSortBucket } from 'app/types/I_faProjectHierarchyTreeDomain'

import { FaActionUserCanceledError } from './functions/faActionUserCanceledError'

import { captureFaHierarchyTreeSortStep } from 'app/src/scripts/actionManager/faHierarchyTreeSortStepCaptureWiring'
import {
  listFaProjectPlacementDocumentChildrenForRenderer,
  reindexFaProjectDocumentSiblingsForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentDocumentIndexWiring'
import { getFaComponentTestingProjectContentOverrides, hasFaProjectHierarchySortBridge } from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import {
  listFaProjectDocumentsUnderTagForRenderer,
  reorderFaProjectDocumentsUnderTagForRenderer
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentTagsOverridesWiring'
import {
  resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId,
  runProjectHierarchyTreeDocumentSort
} from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeDocumentSortRun'
import { sortProjectHierarchyTreeTagDocumentChildren } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreeTagDocumentSort'
import {
  enqueueFaHierarchyTreeDocumentSort,
  resolveFaHierarchyTreeDocumentSortQueueKey
} from './faHierarchyTreeDocumentSortQueueWiring'

type T_sortHierarchyTreeDocumentsHandlerDeps = {
  S_FaProjectHierarchyTree: () => {
    refreshHierarchyTreeNodes: (nodeIds: string[]) => void
  }
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
}

function hierarchySortEpochMoved (
  epochAtStart: number | undefined,
  readProjectContentEpoch: (() => number) | undefined,
  isProjectReplacementInFlight?: () => boolean
): boolean {
  if (isProjectReplacementInFlight?.() === true) {
    return true
  }
  if (epochAtStart === undefined || readProjectContentEpoch === undefined) {
    return false
  }
  return readProjectContentEpoch() !== epochAtStart
}

function throwIfHierarchySortEpochMoved (
  epochAtStart: number | undefined,
  readProjectContentEpoch: (() => number) | undefined,
  isProjectReplacementInFlight?: () => boolean
): void {
  if (hierarchySortEpochMoved(
    epochAtStart,
    readProjectContentEpoch,
    isProjectReplacementInFlight
  )) {
    throw new FaActionUserCanceledError()
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
    const placementId = payload.placementId
    return {
      parentDocumentId: null,
      placementId
    }
  }
  const documentId = payload.documentId
  if (documentId === null || documentId === undefined || documentId.trim().length === 0) {
    return null
  }
  const placementId = payload.placementId
  return {
    parentDocumentId: documentId,
    placementId
  }
}

async function runSortHierarchyTreeDocumentsUnderTag (
  payload: I_faActionPayloadMap['sortHierarchyTreeDocuments'],
  refreshHierarchyTreeNodes: (nodeIds: string[]) => void,
  epochAtStart: number | undefined,
  readProjectContentEpoch: (() => number) | undefined,
  isProjectReplacementInFlight?: () => boolean
): Promise<T_faActionHandlerContinuation | void> {
  const tagId = payload.tagId
  if (
    typeof tagId !== 'string' ||
    tagId.trim().length === 0 ||
    payload.scope !== 'direct'
  ) {
    return
  }
  const payloadPreview = `${payload.scope}:${payload.key}:${payload.direction}:tag`
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
  if (hierarchySortEpochMoved(epochAtStart, readProjectContentEpoch, isProjectReplacementInFlight)) {
    return
  }
  const listed = await listFaProjectDocumentsUnderTagForRenderer({ tagId })
  if (hierarchySortEpochMoved(epochAtStart, readProjectContentEpoch, isProjectReplacementInFlight)) {
    return
  }
  if (listed.items.length === 0) {
    return {
      payloadPreview
    }
  }
  const ordered = sortProjectHierarchyTreeTagDocumentChildren(
    listed.items,
    payload.key,
    payload.direction
  )
  const orderedDocumentIds = ordered.map((item) => item.documentId)
  if (hierarchySortEpochMoved(epochAtStart, readProjectContentEpoch, isProjectReplacementInFlight)) {
    return
  }
  await reorderFaProjectDocumentsUnderTagForRenderer({
    orderedDocumentIds,
    tagId
  })
  if (hierarchySortEpochMoved(epochAtStart, readProjectContentEpoch, isProjectReplacementInFlight)) {
    return
  }
  refreshHierarchyTreeNodes([tagId])
  return {
    payloadPreview
  }
}

export function createFaActionDefinitionHandlersHierarchyTreeSortActions (
  deps: T_sortHierarchyTreeDocumentsHandlerDeps
): {
    handleSortHierarchyTreeDocuments: (
      payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  async function executeSortHierarchyTreeDocuments (
    payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
  ): Promise<T_faActionHandlerContinuation | void> {
    const epochAtStart = deps.readProjectContentEpoch?.()
    if (payload.nodeKind === 'tag') {
      return await runSortHierarchyTreeDocumentsUnderTag(
        payload,
        (nodeIds) => {
          deps.S_FaProjectHierarchyTree().refreshHierarchyTreeNodes(nodeIds)
        },
        epochAtStart,
        deps.readProjectContentEpoch,
        deps.isProjectReplacementInFlight
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
        captureError: captureFaHierarchyTreeSortStep,
        direction: payload.direction,
        key: payload.key,
        listPlacementDocumentChildren: async (listInput) => {
          throwIfHierarchySortEpochMoved(epochAtStart, deps.readProjectContentEpoch, deps.isProjectReplacementInFlight)
          const listed = await listFaProjectPlacementDocumentChildrenForRenderer(listInput)
          throwIfHierarchySortEpochMoved(epochAtStart, deps.readProjectContentEpoch, deps.isProjectReplacementInFlight)
          return listed
        },
        reindexDocumentSiblingsInHierarchy: async (reindexInput) => {
          throwIfHierarchySortEpochMoved(epochAtStart, deps.readProjectContentEpoch, deps.isProjectReplacementInFlight)
          const reindexed = await reindexFaProjectDocumentSiblingsForRenderer(reindexInput)
          throwIfHierarchySortEpochMoved(epochAtStart, deps.readProjectContentEpoch, deps.isProjectReplacementInFlight)
          return reindexed
        },
        root,
        scope: payload.scope
      }),
      (error): unknown => error
    )
    if (sortResult.isErr()) {
      const error = sortResult.error
      if (error instanceof FaActionUserCanceledError) {
        return
      }
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
    if (hierarchySortEpochMoved(epochAtStart, deps.readProjectContentEpoch, deps.isProjectReplacementInFlight)) {
      return
    }
    const buckets = sortResult.value
    const treeNodeIds = buckets.map(resolveProjectHierarchyTreeDocumentSortBucketTreeNodeId)
    deps.S_FaProjectHierarchyTree().refreshHierarchyTreeNodes(treeNodeIds)
    const payloadPreview = `${payload.scope}:${payload.key}:${payload.direction}`
    return {
      payloadPreview
    }
  }

  async function handleSortHierarchyTreeDocuments (
    payload: I_faActionPayloadMap['sortHierarchyTreeDocuments']
  ): Promise<T_faActionHandlerContinuation | void> {
    const queueKey = resolveFaHierarchyTreeDocumentSortQueueKey(payload)
    return await enqueueFaHierarchyTreeDocumentSort(queueKey, () => {
      return executeSortHierarchyTreeDocuments(payload)
    })
  }

  return {
    handleSortHierarchyTreeDocuments
  }
}
