export function createResolveProjectHierarchyTreePlacementDisplayIcon (deps: {
  defaultPlacementIcon: string
}) {
  function resolveProjectHierarchyTreePlacementDisplayIcon (icon: string): string {
    const trimmed = icon.trim()
    if (trimmed.length > 0) {
      return trimmed
    }
    return deps.defaultPlacementIcon
  }

  return resolveProjectHierarchyTreePlacementDisplayIcon
}
