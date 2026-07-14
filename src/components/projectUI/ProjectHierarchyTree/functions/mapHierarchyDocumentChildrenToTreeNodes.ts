import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_projectHierarchyTreeLazyPlaceholderApi = {
  resolveLazyChildren: (parent: I_faProjectHierarchyTreeHeTreeNode) => I_faProjectHierarchyTreeHeTreeNode[]
}

/**
 * Maps lazy-loaded document child rows into he-tree document nodes.
 */
export function createMapHierarchyDocumentChildrenToTreeNodes (deps: {
  lazyPlaceholderApi: T_projectHierarchyTreeLazyPlaceholderApi
  resolvePlacementDisplayIcon: (icon: string) => string
}) {
  function mapHierarchyDocumentChildrenToTreeNodes (input: {
    items: I_faProjectHierarchyTreeDocumentChild[]
    placementIcon: string
    worldColor: string
    worldId: string
  }): I_faProjectHierarchyTreeHeTreeNode[] {
    const placementIcon = deps.resolvePlacementDisplayIcon(input.placementIcon)
    const orderedItems = [...input.items].sort((left, right) => {
      const sortOrderDelta = left.sortOrder - right.sortOrder
      if (sortOrderDelta !== 0) {
        return sortOrderDelta
      }
      const nameDelta = left.displayName.localeCompare(
        right.displayName,
        undefined,
        {
          sensitivity: 'accent'
        }
      )
      return nameDelta !== 0 ? nameDelta : left.id.localeCompare(right.id)
    })
    return orderedItems.map((item) => {
      const node: I_faProjectHierarchyTreeHeTreeNode = {
        children: [],
        childrenLoaded: false,
        documentBackgroundColor: item.documentBackgroundColor,
        documentId: item.id,
        documentTextColor: item.documentTextColor,
        groupId: null,
        hasChildren: item.hasChildren,
        icon: placementIcon,
        id: item.id,
        label: item.displayName,
        nodeKind: 'document',
        placementId: item.placementId,
        worldColor: input.worldColor,
        worldId: input.worldId
      }
      node.children = deps.lazyPlaceholderApi.resolveLazyChildren(node)
      return node
    })
  }

  return mapHierarchyDocumentChildrenToTreeNodes
}
