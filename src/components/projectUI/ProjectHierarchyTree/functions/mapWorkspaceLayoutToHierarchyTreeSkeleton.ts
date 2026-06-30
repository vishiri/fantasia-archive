import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceGroup,
  I_faProjectHierarchyTreeWorkspacePlacement,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

/** Default Material icon for template group rows. */
const PROJECT_HIERARCHY_TREE_GROUP_ICON = 'mdi-database'

type T_rootLayoutItem =
  | { kind: 'group', groupId: string, rootSortOrder: number }
  | { kind: 'placement', placementId: string, rootSortOrder: number }

function createLazyPlaceholderChild (
  parent: Pick<I_faProjectHierarchyTreeHeTreeNode, 'id' | 'placementId' | 'worldColor' | 'worldId'>
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
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

function syncProjectHierarchyTreeNodeLazyChildren (
  node: I_faProjectHierarchyTreeHeTreeNode
): void {
  if (node.nodeKind === 'world' || node.nodeKind === 'group') {
    return
  }
  if (node.childrenLoaded) {
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

function resolvePlacementLabel (placement: I_faProjectHierarchyTreeWorkspacePlacement): string {
  const nickname = placement.nickname.trim()
  if (nickname.length > 0) {
    return nickname
  }
  return placement.displayName
}

function mapPlacementToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  placement: I_faProjectHierarchyTreeWorkspacePlacement
): I_faProjectHierarchyTreeHeTreeNode {
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: placement.groupId,
    hasChildren: placement.hasChildren,
    icon: placement.icon,
    id: placement.id,
    label: resolvePlacementLabel(placement),
    nodeKind: 'templatePlacement',
    placementId: placement.id,
    worldColor: world.color,
    worldId: world.id
  }
  node.children = resolveLazyChildren(node)
  return node
}

function buildGroupChildNodes (
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  groupId: string
): I_faProjectHierarchyTreeHeTreeNode[] {
  return world.placements
    .filter((placement) => placement.groupId === groupId)
    .sort((left, right) => (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0))
    .map((placement) => mapPlacementToNode(world, placement))
}

function mapGroupToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  group: I_faProjectHierarchyTreeWorkspaceGroup
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: buildGroupChildNodes(world, group.id),
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

function buildRootLayoutItems (
  world: I_faProjectHierarchyTreeWorkspaceWorld
): T_rootLayoutItem[] {
  const items: T_rootLayoutItem[] = [
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
  ]
  items.sort((left, right) => left.rootSortOrder - right.rootSortOrder)
  return items
}

function resolveWorldHasChildren (world: I_faProjectHierarchyTreeWorkspaceWorld): boolean {
  if (world.groups.length > 0) {
    return true
  }
  return world.placements.length > 0
}

function mapWorldToNode (
  world: I_faProjectHierarchyTreeWorkspaceWorld
): I_faProjectHierarchyTreeHeTreeNode {
  const groupById = new Map(world.groups.map((group) => [group.id, group]))
  const placementById = new Map(world.placements.map((placement) => [placement.id, placement]))
  const rootItems = buildRootLayoutItems(world)

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
    hasChildren: resolveWorldHasChildren(world),
    icon: '',
    id: world.id,
    label: world.displayName,
    nodeKind: 'world',
    placementId: null,
    worldColor: world.color,
    worldId: world.id
  }
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
    worldNode.hasChildren = resolveWorldHasChildren(world)

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
          placementNode.label = resolvePlacementLabel(placement)
          placementNode.icon = placement.icon
          placementNode.hasChildren = placement.hasChildren
          syncProjectHierarchyTreeNodeLazyChildren(placementNode)
        }
        continue
      }
      const placement = world.placements.find((row) => row.id === child.id)
      if (placement === undefined) {
        continue
      }
      child.label = resolvePlacementLabel(placement)
      child.icon = placement.icon
      child.hasChildren = placement.hasChildren
      syncProjectHierarchyTreeNodeLazyChildren(child)
    }
  }
}

/**
 * Maps lazy-loaded document child rows into he-tree document nodes.
 */
export function mapHierarchyDocumentChildrenToTreeNodes (input: {
  items: I_faProjectHierarchyTreeDocumentChild[]
  worldColor: string
  worldId: string
}): I_faProjectHierarchyTreeHeTreeNode[] {
  return input.items.map((item) => {
    const node: I_faProjectHierarchyTreeHeTreeNode = {
      children: [],
      childrenLoaded: false,
      documentId: item.id,
      groupId: null,
      hasChildren: item.hasChildren,
      icon: '',
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
