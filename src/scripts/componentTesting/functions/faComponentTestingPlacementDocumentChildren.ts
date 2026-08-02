import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Map key for placement document children overrides (root parent uses '__root__').
 */
export function buildFaComponentTestingPlacementDocumentChildrenKey (
  placementId: string,
  parentDocumentId: string | null
): string {
  return `${placementId}::${parentDocumentId ?? '__root__'}`
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
