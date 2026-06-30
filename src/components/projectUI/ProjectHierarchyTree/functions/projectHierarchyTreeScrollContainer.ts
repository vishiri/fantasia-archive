/** Root class on the he-tree Draggable scroll container. */
const PROJECT_HIERARCHY_TREE_ROOT_CLASS = 'projectHierarchyTree'

/**
 * Resolves the he-tree Draggable root used as the vertical scroll container.
 */
export function resolveProjectHierarchyTreeScrollContainer (
  host: HTMLElement | null | undefined
): HTMLElement | null {
  if (host == null) {
    return null
  }
  if (host.classList.contains(PROJECT_HIERARCHY_TREE_ROOT_CLASS)) {
    return host
  }
  const tree = host.querySelector(`.${PROJECT_HIERARCHY_TREE_ROOT_CLASS}`)
  if (tree instanceof HTMLElement) {
    return tree
  }
  return host
}
