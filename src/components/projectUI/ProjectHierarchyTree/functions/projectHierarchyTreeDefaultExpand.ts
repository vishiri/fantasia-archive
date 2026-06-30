import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Default expanded node ids when no hierarchy_tree_ui_state exists yet (worlds, groups, placements with documents).
 */
export function resolveDefaultProjectHierarchyTreeExpandedNodeIds (
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): string[] {
  const expandedNodeIds: string[] = []
  for (const world of worlds) {
    const hasStructure = world.groups.length > 0 || world.placements.length > 0
    if (!hasStructure) {
      continue
    }
    expandedNodeIds.push(world.id)
    for (const group of world.groups) {
      expandedNodeIds.push(group.id)
    }
    for (const placement of world.placements) {
      if (placement.hasChildren) {
        expandedNodeIds.push(placement.id)
      }
    }
  }
  return expandedNodeIds
}

/**
 * True when persisted expand ids predate placement-level defaults (no placement id stored yet).
 */
export function shouldRunProjectHierarchyTreePlacementExpandMerge (
  expandedNodeIds: string[],
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): boolean {
  if (expandedNodeIds.length === 0) {
    return false
  }
  for (const world of worlds) {
    for (const placement of world.placements) {
      if (expandedNodeIds.includes(placement.id)) {
        return false
      }
    }
  }
  return true
}

/**
 * Ensures placements that already have documents stay expanded when persisted UI state predates placement defaults.
 */
export function mergeProjectHierarchyTreePlacementExpandNodeIds (
  expandedNodeIds: string[],
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): string[] {
  const merged = new Set(expandedNodeIds)
  for (const world of worlds) {
    for (const placement of world.placements) {
      if (!placement.hasChildren) {
        continue
      }
      merged.add(world.id)
      if (placement.groupId !== null) {
        merged.add(placement.groupId)
      }
      merged.add(placement.id)
    }
  }
  return [...merged]
}
