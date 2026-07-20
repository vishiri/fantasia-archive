import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'

export function resolveProjectAppControlBarShowWorldTabIndicators (
  projectWorldCount: number
): boolean {
  return projectWorldCount > 1
}

export function resolveProjectAppControlBarTabWorldColor (
  worlds: readonly Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>[],
  worldId: string | null | undefined
): string | null {
  if (worldId === null || worldId === undefined || worldId.length === 0) {
    return null
  }
  const world = worlds.find((row) => row.id === worldId)
  if (world === undefined) {
    return null
  }
  const trimmedColor = world.color.trim()
  if (trimmedColor.length === 0) {
    return null
  }
  return trimmedColor
}

export function resolveProjectAppControlBarTabWorldIndicatorColor (input: {
  projectWorldCount: number
  tab: Pick<I_faOpenedDocumentTab, 'worldId'>
  worlds: readonly Pick<I_faProjectHierarchyTreeWorkspaceWorld, 'color' | 'id'>[]
}): string | null {
  if (!resolveProjectAppControlBarShowWorldTabIndicators(input.projectWorldCount)) {
    return null
  }
  return resolveProjectAppControlBarTabWorldColor(input.worlds, input.tab.worldId)
}
