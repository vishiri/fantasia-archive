import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

import { mapWorkspaceLayoutToHierarchyTreeSkeleton } from '../functions/mapWorkspaceLayoutToHierarchyTreeSkeleton'
import { mapProjectHierarchyTreeToTopologyKey } from '../functions/projectHierarchyTreeTopologyKey'

function resolveProjectHierarchyTreeWorldStructuralChildCount (
  world: I_faProjectHierarchyTreeWorkspaceWorld
): number {
  const rootPlacementCount = world.placements.filter((placement) => placement.groupId === null).length
  return world.groups.length + rootPlacementCount
}

function resolveProjectHierarchyTreeNodeStructuralChildCount (
  worldNode: I_faProjectHierarchyTreeHeTreeNode
): number {
  return worldNode.children.filter((child) => {
    return child.nodeKind === 'group' || child.nodeKind === 'templatePlacement'
  }).length
}

/**
 * True when tree skeleton matches layout topology and per-world structural child counts.
 */
export function projectHierarchyTreeLayoutStructureMatchesTree (
  treeNodes: I_faProjectHierarchyTreeHeTreeNode[],
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): boolean {
  const nextSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton(worlds)
  if (mapProjectHierarchyTreeToTopologyKey(treeNodes) !== mapProjectHierarchyTreeToTopologyKey(nextSkeleton)) {
    return false
  }
  const worldById = new Map(worlds.map((world) => [world.id, world]))
  for (const worldNode of treeNodes) {
    if (worldNode.nodeKind !== 'world') {
      continue
    }
    const world = worldById.get(worldNode.id)
    if (world === undefined) {
      return false
    }
    const treeChildCount = resolveProjectHierarchyTreeNodeStructuralChildCount(worldNode)
    const layoutChildCount = resolveProjectHierarchyTreeWorldStructuralChildCount(world)
    if (treeChildCount !== layoutChildCount) {
      return false
    }
  }
  return true
}
