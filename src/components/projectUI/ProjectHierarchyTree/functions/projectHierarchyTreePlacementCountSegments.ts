import type {
  I_projectHierarchyTreePlacementCountDisplay,
  I_projectHierarchyTreePlacementCountSegment
} from 'app/types/I_projectHierarchyTreePlacementCount'

export function resolveProjectHierarchyTreePlacementCountSegments (input: {
  categoryCount: number
  disableCategoryCount: boolean
  disableDocumentCounts: boolean
  documentCount: number
  invertCategoryPosition: boolean
}): I_projectHierarchyTreePlacementCountDisplay {
  const documentSegment: I_projectHierarchyTreePlacementCountSegment = {
    kind: 'document',
    value: input.documentCount
  }
  const categorySegment: I_projectHierarchyTreePlacementCountSegment = {
    kind: 'category',
    value: input.categoryCount
  }

  if (input.disableDocumentCounts && input.disableCategoryCount) {
    return {
      segments: [],
      showDivider: false,
      shows: false
    }
  }

  if (input.disableDocumentCounts) {
    return {
      segments: [categorySegment],
      showDivider: false,
      shows: true
    }
  }

  if (input.disableCategoryCount) {
    return {
      segments: [documentSegment],
      showDivider: false,
      shows: true
    }
  }

  const segments = input.invertCategoryPosition
    ? [categorySegment, documentSegment]
    : [documentSegment, categorySegment]

  return {
    segments,
    showDivider: true,
    shows: true
  }
}
