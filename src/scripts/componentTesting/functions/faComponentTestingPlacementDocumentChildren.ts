import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeReindexDocumentSiblingsInput
} from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Map key for placement document children overrides (root parent uses '__root__').
 */
export function buildFaComponentTestingPlacementDocumentChildrenKey (
  placementId: string,
  parentDocumentId: string | null
): string {
  return `${placementId}::${parentDocumentId ?? '__root__'}`
}

function mergeFaComponentTestingCrossParentSiblingOrder (
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

function uniqueFaComponentTestingOrderedDocumentIds (
  orderedDocumentIds: readonly string[]
): string[] {
  return orderedDocumentIds.filter((documentId, index, ids) => {
    return ids.indexOf(documentId) === index
  })
}

function collectFaComponentTestingPlacementDocumentChildrenById (
  childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]>
): Map<string, I_faProjectHierarchyTreeDocumentChild> {
  const byId = new Map<string, I_faProjectHierarchyTreeDocumentChild>()
  for (const items of Object.values(childrenByKey)) {
    for (const item of items) {
      byId.set(item.id, item)
    }
  }
  return byId
}

function compactFaComponentTestingPlacementDocumentChildrenSortOrder (
  items: readonly I_faProjectHierarchyTreeDocumentChild[]
): I_faProjectHierarchyTreeDocumentChild[] {
  return items.map((item, sortOrder) => {
    return {
      ...item,
      sortOrder
    }
  })
}

function markFaComponentTestingPlacementParentHasChildren (
  childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]>,
  parentDocumentId: string
): void {
  for (const [key, items] of Object.entries(childrenByKey)) {
    childrenByKey[key] = items.map((item) => {
      if (item.id !== parentDocumentId) {
        return item
      }
      return {
        ...item,
        hasChildren: true
      }
    })
  }
}

/**
 * Reorders an override children list to match 'orderedDocumentIds'. Unknown ids are dropped.
 * Assigns sequential 'sortOrder' so mapHierarchyDocumentChildrenToTreeNodes keeps the new order.
 */
export function reindexFaComponentTestingPlacementDocumentChildren (
  items: readonly I_faProjectHierarchyTreeDocumentChild[],
  orderedDocumentIds: readonly string[]
): I_faProjectHierarchyTreeDocumentChild[] {
  const byId = new Map(items.map((item) => {
    return [item.id, item] as const
  }))
  const next: I_faProjectHierarchyTreeDocumentChild[] = []
  for (const documentId of orderedDocumentIds) {
    const item = byId.get(documentId)
    if (item === undefined) {
      continue
    }
    next.push({
      ...item,
      sortOrder: next.length
    })
  }
  return next
}

/**
 * Mirrors SQLite reindexDocumentSiblingsInHierarchy for component-testing maps:
 * pull ordered ids from any bucket, write the target parent list, strip those ids
 * from other buckets so a nest drop does not leave a duplicate sibling row.
 */
export function applyFaComponentTestingPlacementDocumentChildrenReindex (
  childrenByKey: Record<string, I_faProjectHierarchyTreeDocumentChild[]>,
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
): void {
  const targetKey = buildFaComponentTestingPlacementDocumentChildrenKey(
    input.placementId,
    input.parentDocumentId
  )
  const byId = collectFaComponentTestingPlacementDocumentChildrenById(childrenByKey)
  const orderedUniqueIds = uniqueFaComponentTestingOrderedDocumentIds(input.orderedDocumentIds)
  const destinationItems = childrenByKey[targetKey] ?? []
  const movedAlreadyInTarget = destinationItems.some((item) => item.id === input.movedDocumentId)
  const destinationIds = destinationItems
    .map((item) => item.id)
    .filter((id) => id !== input.movedDocumentId)
  const orderedIdsForSort = movedAlreadyInTarget
    ? orderedUniqueIds
    : mergeFaComponentTestingCrossParentSiblingOrder(destinationIds, orderedUniqueIds)
  const nextTarget = reindexFaComponentTestingPlacementDocumentChildren(
    [...byId.values()],
    orderedIdsForSort
  ).map((item) => {
    const parentDocumentId = input.parentDocumentId
    return {
      ...item,
      parentDocumentId
    }
  })
  childrenByKey[targetKey] = nextTarget
  const movedIds = new Set(nextTarget.map((item) => item.id))
  for (const key of Object.keys(childrenByKey)) {
    if (key === targetKey) {
      continue
    }
    const remaining = (childrenByKey[key] ?? []).filter((item) => {
      return !movedIds.has(item.id)
    })
    childrenByKey[key] = compactFaComponentTestingPlacementDocumentChildrenSortOrder(remaining)
  }
  if (input.parentDocumentId !== null && nextTarget.length > 0) {
    markFaComponentTestingPlacementParentHasChildren(childrenByKey, input.parentDocumentId)
  }
}

/**
 * Updates documentsById parent and sortOrder to match a sibling reindex, including nest moves.
 */
export function applyFaComponentTestingDocumentsByIdParentFromReindex (
  documentsById: Record<string, I_faProjectDocument>,
  input: I_faProjectHierarchyTreeReindexDocumentSiblingsInput
): void {
  const orderedUniqueIds = uniqueFaComponentTestingOrderedDocumentIds(input.orderedDocumentIds)
  orderedUniqueIds.forEach((documentId, sortOrder) => {
    const document = documentsById[documentId]
    if (document === undefined) {
      return
    }
    documentsById[documentId] = {
      ...document,
      parentDocumentId: input.parentDocumentId,
      sortOrder
    }
  })
}
