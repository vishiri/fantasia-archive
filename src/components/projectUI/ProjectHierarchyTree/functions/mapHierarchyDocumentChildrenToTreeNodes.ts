import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'

/** Sync with PROJECT_HIERARCHY_TREE_DOCUMENT_TEMPLATE_DEFAULT_ICON in projectHierarchyTreeConstants.ts */
const DEFAULT_PLACEMENT_ICON = 'mdi-file-outline'

function resolvePlacementDisplayIcon (icon: string): string {
  const trimmed = icon.trim()
  if (trimmed.length > 0) {
    return trimmed
  }
  return DEFAULT_PLACEMENT_ICON
}

function createLazyPlaceholderChild (
  parent: Pick<I_faProjectHierarchyTreeHeTreeNode, 'icon' | 'id' | 'placementId' | 'worldColor' | 'worldId'>
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: parent.icon,
    id: `${parent.id}__lazy`,
    label: '',
    nodeKind: 'document',
    placementId: parent.placementId,
    worldColor: parent.worldColor,
    worldId: parent.worldId
  }
}

function resolveLazyChildren (
  parent: I_faProjectHierarchyTreeHeTreeNode
): I_faProjectHierarchyTreeHeTreeNode[] {
  if (!parent.hasChildren) {
    return []
  }
  return [createLazyPlaceholderChild(parent)]
}

/**
 * Maps lazy-loaded document child rows into he-tree document nodes.
 */
export function mapHierarchyDocumentChildrenToTreeNodes (input: {
  items: I_faProjectHierarchyTreeDocumentChild[]
  placementIcon: string
  worldColor: string
  worldId: string
}): I_faProjectHierarchyTreeHeTreeNode[] {
  const placementIcon = resolvePlacementDisplayIcon(input.placementIcon)
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
    node.children = resolveLazyChildren(node)
    return node
  })
}
