/**
 * Reads vertical scrollTop from a hierarchy tree scroll container.
 */
export function readProjectHierarchyTreeScrollTopPx (
  scrollContainer: HTMLElement | null
): number {
  if (scrollContainer === null) {
    return 0
  }
  return scrollContainer.scrollTop
}

/**
 * Writes vertical scrollTop onto a hierarchy tree scroll container.
 */
export function writeProjectHierarchyTreeScrollTopPx (
  scrollContainer: HTMLElement | null,
  scrollTopPx: number
): void {
  if (scrollContainer === null) {
    return
  }
  scrollContainer.scrollTop = scrollTopPx
}
