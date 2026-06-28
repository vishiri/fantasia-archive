import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
import type { I_faProjectWorkspaceWorldListItem } from 'app/types/I_faProjectWorkspaceWorldsDomain'

/**
 * Maps persisted world rows to sidebar list items preserving API sort order.
 */
export function mapFaProjectWorldsToWorkspaceListItems (
  worlds: I_faProjectWorld[],
  resolveItemDisplayName: (world: I_faProjectWorld) => string
): I_faProjectWorkspaceWorldListItem[] {
  return worlds.map((world) => {
    const displayName = resolveItemDisplayName(world)

    return {
      displayName,
      id: world.id
    }
  })
}
