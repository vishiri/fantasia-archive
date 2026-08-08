/**
 * Returns the first non-empty sibling document id list from ordered candidates.
 */
export function pickFirstProjectHierarchyTreeSiblingOrder<TSource extends string> (candidates: Array<{
  orderSource: TSource
  orderedDocumentIds: string[] | null
}>): {
    orderSource: TSource | null
    orderedDocumentIds: string[] | null
  } {
  for (const candidate of candidates) {
    if (candidate.orderedDocumentIds !== null && candidate.orderedDocumentIds.length > 0) {
      return candidate
    }
  }
  return {
    orderSource: null,
    orderedDocumentIds: null
  }
}
