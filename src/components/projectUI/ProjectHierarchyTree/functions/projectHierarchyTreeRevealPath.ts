import type {
  I_faProjectHierarchyTreeSearchHit,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Builds ordered node ids to open for a hierarchy search hit (world → placement → ancestors → document).
 */
export function buildProjectHierarchyTreeRevealPathFromSearchHit (
  hit: I_faProjectHierarchyTreeSearchHit,
  worlds: I_faProjectHierarchyTreeWorkspaceWorld[]
): string[] {
  const world = worlds.find((row) => row.id === hit.worldId)
  if (world === undefined) {
    return []
  }

  const placement = world.placements.find((row) => row.id === hit.placementId)
  if (placement === undefined) {
    return []
  }

  const path: string[] = [world.id]

  if (placement.groupId !== null) {
    path.push(placement.groupId)
  }

  path.push(placement.id)
  path.push(...hit.ancestorDocumentIds)
  path.push(hit.documentId)

  return path
}
