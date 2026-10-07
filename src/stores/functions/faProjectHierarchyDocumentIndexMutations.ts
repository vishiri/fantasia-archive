import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeListPlacementChildrenInput,
  I_faProjectHierarchyTreeMoveDocumentInput,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_faProjectHierarchyDocumentIndex = {
  bucketIdsByKey: Map<string, Set<string>>
  byId: Map<string, I_faProjectDocument>
  childCountByParentId: Map<string, number>
}

type T_faProjectHierarchyDocumentIndexMutationDeps = {
  listPlacementChildren: (
    index: T_faProjectHierarchyDocumentIndex,
    input: I_faProjectHierarchyTreeListPlacementChildrenInput
  ) => I_faProjectHierarchyTreeDocumentChild[]
  upsertDocument: (
    index: T_faProjectHierarchyDocumentIndex,
    document: I_faProjectDocument
  ) => void
}

export function shiftFaProjectHierarchyDocumentIndexSiblingSortOrders (
  index: T_faProjectHierarchyDocumentIndex,
  placementId: string,
  parentDocumentId: string | null,
  fromSortOrder: number,
  delta: number,
  excludeDocumentId: string
): void {
  if (delta === 0) {
    return
  }
  for (const document of index.byId.values()) {
    if (document.id === excludeDocumentId) {
      continue
    }
    if (document.placementId !== placementId) {
      continue
    }
    if (document.parentDocumentId !== parentDocumentId) {
      continue
    }
    if (document.sortOrder < fromSortOrder) {
      continue
    }
    document.sortOrder += delta
  }
}

function compactFaProjectHierarchyDocumentIndexBucket (
  index: T_faProjectHierarchyDocumentIndex,
  placementId: string,
  parentDocumentId: string | null,
  deps: T_faProjectHierarchyDocumentIndexMutationDeps
): void {
  const children = deps.listPlacementChildren(index, {
    parentDocumentId,
    placementId
  })
  children.forEach((child, sortOrder) => {
    const document = index.byId.get(child.id)
    if (document === undefined) {
      return
    }
    if (document.sortOrder === sortOrder) {
      return
    }
    deps.upsertDocument(index, {
      ...document,
      sortOrder
    })
  })
}

/**
 * Mirrors SQLite moveDocumentInHierarchy sibling shifts, then updates parent + sortOrder.
 */
export function applyFaProjectHierarchyDocumentIndexMove (
  index: T_faProjectHierarchyDocumentIndex,
  input: I_faProjectHierarchyTreeMoveDocumentInput,
  deps: T_faProjectHierarchyDocumentIndexMutationDeps
): void {
  const existing = index.byId.get(input.documentId)
  if (existing === undefined) {
    return
  }
  if (existing.placementId === null) {
    return
  }
  const placementId = existing.placementId
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders(
    index,
    placementId,
    existing.parentDocumentId,
    existing.sortOrder + 1,
    -1,
    input.documentId
  )
  shiftFaProjectHierarchyDocumentIndexSiblingSortOrders(
    index,
    placementId,
    input.targetParentDocumentId,
    input.targetSortOrder,
    1,
    input.documentId
  )
  deps.upsertDocument(index, {
    ...existing,
    parentDocumentId: input.targetParentDocumentId,
    sortOrder: input.targetSortOrder,
    updatedAtMs: Date.now()
  })
}

function mergeFaProjectHierarchyCrossParentSiblingOrder (
  existingDestinationIds: readonly string[],
  orderedDocumentIds: readonly string[]
): string[] {
  const orderedSet = new Set(orderedDocumentIds)
  const existingIndex = new Map<string, number>()
  existingDestinationIds.forEach((id, index) => {
    existingIndex.set(id, index)
  })
  const merged: string[] = []
  const seen = new Set<string>()
  let missingCursor = 0
  for (const orderedId of orderedDocumentIds) {
    const anchorIndex = existingIndex.get(orderedId)
    if (anchorIndex !== undefined) {
      while (missingCursor < anchorIndex) {
        const missingId = existingDestinationIds[missingCursor]
        missingCursor += 1
        if (missingId === undefined || orderedSet.has(missingId) || seen.has(missingId)) {
          continue
        }
        merged.push(missingId)
        seen.add(missingId)
      }
      missingCursor = anchorIndex + 1
    }
    if (seen.has(orderedId)) {
      continue
    }
    merged.push(orderedId)
    seen.add(orderedId)
  }
  while (missingCursor < existingDestinationIds.length) {
    const missingId = existingDestinationIds[missingCursor]
    missingCursor += 1
    if (missingId === undefined || orderedSet.has(missingId) || seen.has(missingId)) {
      continue
    }
    merged.push(missingId)
    seen.add(missingId)
  }
  return merged
}

function uniqueOrderedDocumentIds (orderedDocumentIds: readonly string[]): string[] {
  return orderedDocumentIds.filter((documentId, index, ids) => {
    return ids.indexOf(documentId) === index
  })
}

/**
 * Mirrors SQLite reindexDocumentSiblingsInHierarchy: assign 0..n-1, compact source bucket.
 */
export function applyFaProjectHierarchyDocumentIndexReindex (
  index: T_faProjectHierarchyDocumentIndex,
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput,
  deps: T_faProjectHierarchyDocumentIndexMutationDeps
): void {
  const moved = index.byId.get(input.movedDocumentId)
  const previousParentDocumentId = moved === undefined
    ? input.parentDocumentId
    : moved.parentDocumentId
  const orderedUniqueIds = uniqueOrderedDocumentIds(input.orderedDocumentIds)
  const destinationIds = previousParentDocumentId === input.parentDocumentId
    ? []
    : deps.listPlacementChildren(index, {
      parentDocumentId: input.parentDocumentId,
      placementId: input.placementId
    }).map((child) => child.id)
  const orderedIdsForSort = previousParentDocumentId === input.parentDocumentId
    ? orderedUniqueIds
    : mergeFaProjectHierarchyCrossParentSiblingOrder(destinationIds, orderedUniqueIds)
  orderedIdsForSort.forEach((documentId, sortOrder) => {
    const document = index.byId.get(documentId)
    if (document === undefined) {
      return
    }
    deps.upsertDocument(index, {
      ...document,
      parentDocumentId: input.parentDocumentId,
      sortOrder,
      updatedAtMs: Date.now()
    })
  })
  compactFaProjectHierarchyDocumentIndexBucket(
    index,
    input.placementId,
    input.parentDocumentId,
    deps
  )
  if (previousParentDocumentId !== input.parentDocumentId) {
    compactFaProjectHierarchyDocumentIndexBucket(
      index,
      input.placementId,
      previousParentDocumentId,
      deps
    )
  }
}
