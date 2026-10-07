import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput
} from 'app/types/I_faProjectHierarchyTreeDomain'
import { getActivePinia } from 'pinia'

import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { getFaComponentTestingProjectContentOverrides } from './faComponentTestingProjectContentOverridesWiring'
import {
  applyFaComponentTestingDocumentsByIdParentFromReindex,
  applyFaComponentTestingPlacementDocumentChildrenReindex,
  buildFaComponentTestingPlacementDocumentChildrenKey
} from './functions/faComponentTestingPlacementDocumentChildren'

/**
 * Active hierarchy tree store, or null when Pinia is not installed (some unit tests).
 */
export function tryGetFaProjectHierarchyTreeStoreForRenderer ():
ReturnType<typeof S_FaProjectHierarchyTree> | null {
  if (getActivePinia() === undefined) {
    return null
  }
  return S_FaProjectHierarchyTree()
}

/**
 * Lists placement document children from overrides when present, else the session document index.
 */
export async function listFaProjectPlacementDocumentChildrenForRenderer (
  input: I_faProjectHierarchyTreeListPlacementChildrenInput
): Promise<{ items: I_faProjectHierarchyTreeDocumentChild[] }> {
  const overridesMap = getFaComponentTestingProjectContentOverrides()?.placementDocumentChildrenByKey
  if (overridesMap !== undefined) {
    const key = buildFaComponentTestingPlacementDocumentChildrenKey(
      input.placementId,
      input.parentDocumentId ?? null
    )
    const items = overridesMap[key]
    if (items !== undefined) {
      const copiedItems = [...items]
      return {
        items: copiedItems
      }
    }
    const emptyItems: I_faProjectHierarchyTreeDocumentChild[] = []
    return {
      items: emptyItems
    }
  }
  const store = tryGetFaProjectHierarchyTreeStoreForRenderer()
  if (store === null) {
    const emptyItems: I_faProjectHierarchyTreeDocumentChild[] = []
    return {
      items: emptyItems
    }
  }
  await store.ensureDocumentIndexLoaded()
  const indexedItems = store.listIndexedPlacementChildren(input)
  return {
    items: indexedItems
  }
}

let documentHierarchyWriteTail: Promise<unknown> = Promise.resolve()

/**
 * Runs hierarchy order writes one at a time so an earlier drop cannot finish after a later move.
 */
export function enqueueFaProjectDocumentHierarchyWrite<T> (
  run: () => Promise<T>
): Promise<T> {
  const previous = documentHierarchyWriteTail
  const result = previous.then(run, run)
  const settled = result.then(() => undefined, () => undefined)
  documentHierarchyWriteTail = settled
  return result
}

/**
 * Reindexes sibling document order in overrides when present, else bridge.
 */
async function reindexFaProjectDocumentSiblingsNow (
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
): Promise<unknown> {
  const overrides = getFaComponentTestingProjectContentOverrides()
  const overridesMap = overrides?.placementDocumentChildrenByKey
  if (overridesMap !== undefined) {
    applyFaComponentTestingPlacementDocumentChildrenReindex(overridesMap, input)
    const documentsById = overrides?.documentsById
    if (documentsById !== undefined) {
      const targetKey = buildFaComponentTestingPlacementDocumentChildrenKey(
        input.placementId,
        input.parentDocumentId
      )
      const targetItems = overridesMap[targetKey] ?? []
      const orderedDocumentIds = targetItems.map((item) => item.id)
      applyFaComponentTestingDocumentsByIdParentFromReindex(documentsById, {
        movedDocumentId: input.movedDocumentId,
        orderedDocumentIds,
        parentDocumentId: input.parentDocumentId,
        placementId: input.placementId
      })
    }
    tryGetFaProjectHierarchyTreeStoreForRenderer()?.applyIndexedReindexBucket(input)
    return true
  }
  const api = window.faContentBridgeAPIs?.projectContent
  if (typeof api?.reindexDocumentSiblingsInHierarchy !== 'function') {
    throw new Error('projectContent.reindexDocumentSiblingsInHierarchy unavailable')
  }
  const result = await api.reindexDocumentSiblingsInHierarchy(input)
  tryGetFaProjectHierarchyTreeStoreForRenderer()?.applyIndexedReindexBucket(input)
  return result
}

/**
 * Sibling reindex writes share the hierarchy order chain.
 */
export async function reindexFaProjectDocumentSiblingsForRenderer (
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
): Promise<unknown> {
  return await enqueueFaProjectDocumentHierarchyWrite(() => {
    return reindexFaProjectDocumentSiblingsNow(input)
  })
}
