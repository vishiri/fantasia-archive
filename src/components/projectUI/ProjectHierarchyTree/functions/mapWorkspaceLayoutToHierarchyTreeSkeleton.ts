import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeSkeletonDeps,
  I_faProjectHierarchyTreeWorkspaceGroup,
  I_faProjectHierarchyTreeWorkspacePlacement,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

function mapPlacementToNode (
  deps: I_faProjectHierarchyTreeSkeletonDeps,
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  placement: I_faProjectHierarchyTreeWorkspacePlacement
): I_faProjectHierarchyTreeHeTreeNode {
  const nickname = placement.nickname.trim()
  const placementIcon = deps.resolvePlacementDisplayIcon(placement.icon)
  const node: I_faProjectHierarchyTreeHeTreeNode = {
    categoryCount: placement.categoryCount,
    children: [],
    childrenLoaded: false,
    documentCount: placement.documentCount,
    documentId: null,
    documentTemplateId: placement.documentTemplateId,
    groupId: placement.groupId,
    hasChildren: true,
    icon: placementIcon,
    id: placement.id,
    label: nickname.length > 0 ? nickname : placement.displayName,
    nodeKind: 'templatePlacement',
    placementId: placement.id,
    tagId: null,
    titlePluralTranslations: placement.titlePluralTranslations,
    titleSingularTranslations: placement.titleSingularTranslations,
    worldColor: world.color,
    worldId: world.id
  }
  node.children = deps.lazyPlaceholderApi.resolveLazyChildren(node)
  return node
}

function mapGroupToNode (
  deps: I_faProjectHierarchyTreeSkeletonDeps,
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  group: I_faProjectHierarchyTreeWorkspaceGroup
): I_faProjectHierarchyTreeHeTreeNode {
  const children = world.placements
    .filter((placement) => placement.groupId === group.id)
    .sort((left, right) => (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0))
    .map((placement) => mapPlacementToNode(deps, world, placement))
  const groupId = group.id
  const hasChildren = group.hasChildren
  const icon = deps.groupIcon
  const id = group.id
  const label = group.displayName
  const worldColor = world.color
  const worldId = world.id
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId,
    hasChildren,
    icon,
    id,
    label,
    nodeKind: 'group',
    placementId: null,
    tagId: null,
    worldColor,
    worldId
  }
}

function mapStructuralWorldChildren (
  deps: I_faProjectHierarchyTreeSkeletonDeps,
  world: I_faProjectHierarchyTreeWorkspaceWorld
): I_faProjectHierarchyTreeHeTreeNode[] {
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
  return rootItems.map((item) => {
    if (item.kind === 'group') {
      return mapGroupToNode(deps, world, groupById.get(item.groupId)!)
    }
    return mapPlacementToNode(deps, world, placementById.get(item.placementId)!)
  })
}

function mapWorldToNode (
  deps: I_faProjectHierarchyTreeSkeletonDeps,
  world: I_faProjectHierarchyTreeWorkspaceWorld
): I_faProjectHierarchyTreeHeTreeNode {
  const tagSettings = deps.resolveTagSettings()
  const structuralChildren = mapStructuralWorldChildren(deps, world)
  const tagBranchNodes = deps.tagBranchApi.resolveTagBranchNodes({
    lazyPlaceholderApi: deps.lazyPlaceholderApi,
    tagSettings,
    tagsLabel: deps.resolveTagsLabel(),
    world
  })
  const children = deps.tagBranchApi.mergeWorldChildrenWithTags({
    structuralChildren,
    tagBranchNodes,
    tagsAtTop: tagSettings.tagsAtTop
  })
  const hasStructuralChildren = world.groups.length > 0 || world.placements.length > 0
  const hasChildren = hasStructuralChildren || tagBranchNodes.length > 0
  const id = world.id
  const label = world.displayName
  const worldColor = world.color
  const worldId = world.id
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren,
    icon: '',
    id,
    label,
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor,
    worldId
  }
}

function patchStructuralWorldChildrenInPlace (
  deps: I_faProjectHierarchyTreeSkeletonDeps,
  worldNode: I_faProjectHierarchyTreeHeTreeNode,
  world: I_faProjectHierarchyTreeWorkspaceWorld
): void {
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
        deps.patchPlacementNodeInPlace({
          lazyPlaceholderApi: deps.lazyPlaceholderApi,
          placement,
          placementNode,
          resolvePlacementDisplayIcon: deps.resolvePlacementDisplayIcon
        })
      }
      continue
    }
    if (child.nodeKind !== 'templatePlacement') {
      continue
    }
    const placement = world.placements.find((row) => row.id === child.id)
    if (placement === undefined) {
      continue
    }
    deps.patchPlacementNodeInPlace({
      lazyPlaceholderApi: deps.lazyPlaceholderApi,
      placement,
      placementNode: child,
      resolvePlacementDisplayIcon: deps.resolvePlacementDisplayIcon
    })
  }
}

export function createMapWorkspaceLayoutToHierarchyTreeSkeleton (deps: I_faProjectHierarchyTreeSkeletonDeps) {
  function mapWorkspaceLayoutToHierarchyTreeSkeleton (
    worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
  ): I_faProjectHierarchyTreeHeTreeNode[] {
    return worlds
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((world) => mapWorldToNode(deps, world))
  }

  function patchHierarchyTreeSkeletonLabelsInPlace (
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
      const tagBranchNodes = deps.tagBranchApi.resolveTagBranchNodes({
        lazyPlaceholderApi: deps.lazyPlaceholderApi,
        tagSettings: deps.resolveTagSettings(),
        tagsLabel: deps.resolveTagsLabel(),
        world
      })
      worldNode.hasChildren =
        world.groups.length > 0 || world.placements.length > 0 || tagBranchNodes.length > 0
      patchStructuralWorldChildrenInPlace(deps, worldNode, world)
      deps.tagBranchApi.patchTagBranchLabelsInPlace({
        lazyPlaceholderApi: deps.lazyPlaceholderApi,
        resolveTagsLabel: deps.resolveTagsLabel,
        tagSettings: deps.resolveTagSettings(),
        world,
        worldNode
      })
    }
  }

  return {
    mapWorkspaceLayoutToHierarchyTreeSkeleton,
    patchHierarchyTreeSkeletonLabelsInPlace
  }
}
