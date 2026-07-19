import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceGroup,
  I_faProjectHierarchyTreeWorkspacePlacement,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

type T_projectHierarchyTreeLazyPlaceholderApi = {
  resolveLazyChildren: (parent: I_faProjectHierarchyTreeHeTreeNode) => I_faProjectHierarchyTreeHeTreeNode[]
  syncProjectHierarchyTreeNodeLazyChildren: (node: I_faProjectHierarchyTreeHeTreeNode) => void
}

type T_workspaceLayoutSkeletonMapDeps = {
  groupIcon: string
  lazyPlaceholderApi: T_projectHierarchyTreeLazyPlaceholderApi
  resolvePlacementDisplayIcon: (icon: string) => string
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

function mapPlacementToNode (
  deps: T_workspaceLayoutSkeletonMapDeps,
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
    titlePluralTranslations: placement.titlePluralTranslations,
    titleSingularTranslations: placement.titleSingularTranslations,
    worldColor: world.color,
    worldId: world.id
  }
  node.children = deps.lazyPlaceholderApi.resolveLazyChildren(node)
  return node
}

function mapGroupToNode (
  deps: T_workspaceLayoutSkeletonMapDeps,
  world: I_faProjectHierarchyTreeWorkspaceWorld,
  group: I_faProjectHierarchyTreeWorkspaceGroup
): I_faProjectHierarchyTreeHeTreeNode {
  const children = world.placements
    .filter((placement) => placement.groupId === group.id)
    .sort((left, right) => (left.groupSortOrder ?? 0) - (right.groupSortOrder ?? 0))
    .map((placement) => mapPlacementToNode(deps, world, placement))
  return {
    children,
    childrenLoaded: true,
    documentId: null,
    groupId: group.id,
    hasChildren: group.hasChildren,
    icon: deps.groupIcon,
    id: group.id,
    label: group.displayName,
    nodeKind: 'group',
    placementId: null,
    worldColor: world.color,
    worldId: world.id
  }
}

function mapWorldToNode (
  deps: T_workspaceLayoutSkeletonMapDeps,
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
      return mapGroupToNode(deps, world, groupById.get(item.groupId)!)
    }
    return mapPlacementToNode(deps, world, placementById.get(item.placementId)!)
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
  deps: T_workspaceLayoutSkeletonMapDeps,
  placementNode: I_faProjectHierarchyTreeHeTreeNode,
  placement: I_faProjectHierarchyTreeWorkspacePlacement
): void {
  const nickname = placement.nickname.trim()
  const placementIcon = deps.resolvePlacementDisplayIcon(placement.icon)
  placementNode.label = nickname.length > 0 ? nickname : placement.displayName
  placementNode.icon = placementIcon
  placementNode.hasChildren = true
  placementNode.documentTemplateId = placement.documentTemplateId
  placementNode.titlePluralTranslations = placement.titlePluralTranslations
  placementNode.titleSingularTranslations = placement.titleSingularTranslations
  placementNode.documentCount = placement.documentCount
  placementNode.categoryCount = placement.categoryCount
  patchDocumentSubtreeIconsInPlace(placementNode.children, placementIcon)
  deps.lazyPlaceholderApi.syncProjectHierarchyTreeNodeLazyChildren(placementNode)
}

export function createMapWorkspaceLayoutToHierarchyTreeSkeleton (deps: T_workspaceLayoutSkeletonMapDeps) {
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
            patchPlacementNodeInPlace(deps, placementNode, placement)
          }
          continue
        }
        const placement = world.placements.find((row) => row.id === child.id)
        if (placement === undefined) {
          continue
        }
        patchPlacementNodeInPlace(deps, child, placement)
      }
    }
  }

  return {
    mapWorkspaceLayoutToHierarchyTreeSkeleton,
    patchHierarchyTreeSkeletonLabelsInPlace
  }
}
