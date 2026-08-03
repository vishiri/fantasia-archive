import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'

/**
 * Maps hierarchy workspace worlds to sidebar list items preserving layout order.
 */
export function mapFaProjectHierarchyWorldsToWorkspaceListItems (
  worlds: ReadonlyArray<{
    displayName: string
    id: string
  }>
): I_faProjectWorkspaceWorldListItem[] {
  return worlds.map((world) => {
    return {
      displayName: world.displayName,
      id: world.id
    }
  })
}
