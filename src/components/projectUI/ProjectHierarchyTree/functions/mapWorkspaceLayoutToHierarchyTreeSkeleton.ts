import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceGroup,
  I_faProjectHierarchyTreeWorkspacePlacement,
  I_faProjectHierarchyTreeWorkspaceWorld
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

/** Default Material icon for template group rows. */
const PROJECT_HIERARCHY_TREE_GROUP_ICON = 'mdi-database'

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

function patchDocumentSubtreeIconsInPlace (
  nodes: I_faProjectHierarchyTreeHeTreeNode[],
  placementIcon: string
): void {
  for (const node of nodes) {
    if (node.nodeKind !== 'document') {
      continue
    }
    node.icon = placementIcon
    if (node.childrenLoaded && node.children.length > 0) {
      patchDocumentSubtreeIconsInPlace(node.children, placementIcon)
    }
  }
}

function syncProjectHierarchyTreeNodeLazyChildren (
  node: I_faProjectHierarchyTreeHeTreeNode
): void {
  if (node.nodeKind === 'world' || node.nodeKind === 'group' || node.childrenLoaded) {
    return
  }
  if (!node.hasChildren) {
    node.children = []
    return
  }
  const lazyChildId = `${node.id}__lazy`
  const hasOnlyLazyPlaceholder = node.children.length === 1 && node.children[0]?.id === lazyChildId
  if (node.children.length === 0 || hasOnlyLazyPlaceholder) {
    node.children = resolveLazyChildren(node)
  }
}

function mapPlacementToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  placement: I_faProjectHierarchyTreeWorkspacePlacement
): I_faProjectHierarchyTreeHeTreeNode {
  const nickname = placement.nickname.trim()
  const placementIcon = resolvePlacementDisplayIcon(placement.icon)
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: placement.groupId,
    hasChildren: placement.hasChildren,
    icon: placementIcon,
    id: placement.id,
    label: nickname.length > 0 ? nickname : placement.displayName,
    nodeKind: 'templatePlacement',
    placementId: placement.id,
    worldColor: world.color,
    worldId: world.id
  }
  node.children = resolveLazyChildren(node)
  return node
}

function mapGroupToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  group: I_faProjectHierarchyTreeWorkspaceGroup
): I_faProjectHierarchyTreeHeTreeNode {
  const children = world.placements
    .filter((placement) => placement.groupId === group.id)
    .sort((left, right) => (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0))
    .map((placement) => mapPlacementToNode(world, placement))
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId: group.id,
    hasChildren: group.hasChildren,
    icon: PROJECT_HIERARCHY_TREE_GROUP_ICON,
    id: group.id,
    label: group.displayName,
    nodeKind: 'group',
    placementId: null,
    worldColor: world.color,
    worldId: world.id
  }
}

function mapWorldToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld
): I_faProjectHierarchyTreeHeTreeNode {
  const groupById = new Map(world.groups.map((group) => [group.id, group]))
  const placementById = new Map(world.placements.map((placement) => [placement.id, placement]))
  const rootItems = [
    ...world.groups.map((group) => ({
      groupId: group.id,
      kind: 'group' as const,
      rootSortOrder: group.rootSortOrder
    })),
    ...world.placements
      .filter((placement) => placement.groupId === null)
      .map((placement) => ({
        kind: 'placement' as const,
        placementId: placement.id,
        rootSortOrder: placement.rootSortOrder ?? 0
      }))
  ].sort((left, right) => left.rootSortOrder - right.rootSortOrder)
  const children = rootItems.map((item) => {
    if (item.kind === 'group') {
      return mapGroupToNode(world, groupById.get(item.groupId)!)
    }
    return mapPlacementToNode(world, placementById.get(item.placementId)!)
  })
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: world.groups.length > 0 || world.placements.length > 0,
    icon: '',
    id: world.id,
    label: world.displayName,
    nodeKind: 'world',
    placementId: null,
    worldColor: world.color,
    worldId: world.id
  }
}

function patchPlacementNodeInPlace (
  placementNode: I_faProjectHierarchyTreeHeTreeNode,
  placement: I_faProjectHierarchyTreeWorkspacePlacement
): void {
  const nickname = placement.nickname.trim()
  const placementIcon = resolvePlacementDisplayIcon(placement.icon)
  placementNode.label = nickname.length > 0 ? nickname : placement.displayName
  placementNode.icon = placementIcon
  placementNode.hasChildren = placement.hasChildren
  patchDocumentSubtreeIconsInPlace(placementNode.children, placementIcon)
  syncProjectHierarchyTreeNodeLazyChildren(placementNode)
}

/**
 * Maps workspace layout IPC snapshot to he-tree skeleton nodes without document rows.
 */
export function mapWorkspaceLayoutToHierarchyTreeSkeleton (
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): I_faProjectHierarchyTreeHeTreeNode[] {
  return worlds
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((world) => mapWorldToNode(world))
}

/**
 * Patches display labels on an existing skeleton when layout metadata changes but topology matches.
 */
export function patchHierarchyTreeSkeletonLabelsInPlace (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): void {
  const worldById = new Map(worlds.map((world) => [world.id, world]))

  for (const worldNode of treeNodes) {
    const world = worldById.get(worldNode.id)
    if (world === undefined) {
      continue
    }
    worldNode.label = world.displayName
    worldNode.worldColor = world.color
    worldNode.hasChildren = world.groups.length > 0 || world.placements.length > 0

    for (const child of worldNode.children) {
      if (child.nodeKind === 'group') {
        const group = world.groups.find((row) => row.id === child.id)
        if (group === undefined) {
          continue
        }
        child.label = group.displayName
        child.hasChildren = group.hasChildren
        for (const placementNode of child.children) {
          const placement = world.placements.find((row) => row.id === placementNode.id)
          if (placement === undefined) {
            continue
          }
          patchPlacementNodeInPlace(placementNode, placement)
        }
        continue
      }
      const placement = world.placements.find((row) => row.id === child.id)
      if (placement === undefined) {
        continue
      }
      patchPlacementNodeInPlace(child, placement)
    }
  }
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
  return input.items.map((item) => {
    const node: I_faProjectHierarchyTreeHeTreeNode = {
      children: [],
      childrenLoaded: false,
      documentId: item.id,
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
