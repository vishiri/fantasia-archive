import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveFaDocumentTreeOrderNumberBadgeLabel } from 'app/src/scripts/openedDocuments/functions/openedDocumentTreeOrderNumber'
import { resolveProjectHierarchyTreePlacementCountSegments } from '../functions/projectHierarchyTreePlacementCountSegments'

export function createProjectHierarchyTreeNodeDisplayBindings (deps: {
  resolvePlacementCountDisplayForCounts: (
    counts: {
      categoryCount: number
      documentCount: number
    }
  ) => ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
  showsOrderNumberBadge: I_computedRef<boolean>
}): {
    resolveOrderNumberBadgeLabelForNode: (
      node: I_faProjectHierarchyTreeHeTreeNode
    ) => string | null
    resolvePlacementCountDisplayForNode: (
      node: I_faProjectHierarchyTreeHeTreeNode
    ) => {
      categoryCount: number
      display: ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
      documentCount: number
    } | null
  } {
  function resolveOrderNumberBadgeLabelForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): string | null {
    if (!deps.showsOrderNumberBadge.value || node.nodeKind !== 'document') {
      return null
    }
    return resolveFaDocumentTreeOrderNumberBadgeLabel(node.treeOrderNumber)
  }

  function resolvePlacementCountDisplayForNode (
    node: I_faProjectHierarchyTreeHeTreeNode
  ): {
    categoryCount: number
    display: ReturnType<typeof resolveProjectHierarchyTreePlacementCountSegments>
    documentCount: number
  } | null {
    if (node.nodeKind !== 'templatePlacement') {
      return null
    }
    const documentCount = node.documentCount ?? 0
    const categoryCount = node.categoryCount ?? 0
    return {
      categoryCount,
      display: deps.resolvePlacementCountDisplayForCounts({
        categoryCount,
        documentCount
      }),
      documentCount
    }
  }

  return {
    resolveOrderNumberBadgeLabelForNode,
    resolvePlacementCountDisplayForNode
  }
}
