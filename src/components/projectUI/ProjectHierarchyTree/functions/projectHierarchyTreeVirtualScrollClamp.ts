/**
 * True when scroll position is at (or past) the virtual list tail.
 * Skip when content is not taller than the viewport — common during virt remount
 * when scrollHeight collapses and clamping would yank scrollTop to 0.
 */
export function shouldClampProjectHierarchyTreeVirtualScrollTail (
  scrollContainer: HTMLElement
): boolean {
  if (scrollContainer.scrollHeight <= scrollContainer.clientHeight + 2) {
    return false
  }
  return scrollContainer.scrollTop + scrollContainer.clientHeight >=
    scrollContainer.scrollHeight - 2
}

/**
 * Pixels of empty viewport below the last rendered tree row.
 */
export function readProjectHierarchyTreeLastDomRowViewportGapPx (
  scrollContainer: HTMLElement
): number | null {
  const inner = scrollContainer.querySelector('.vtlist-inner')
  if (!(inner instanceof HTMLElement)) {
    return null
  }
  const treeNodes = inner.querySelectorAll('.tree-node:not(.drag-placeholder-wrapper)')
  if (treeNodes.length === 0) {
    return null
  }
  const lastNode = treeNodes[treeNodes.length - 1]
  if (!(lastNode instanceof HTMLElement)) {
    return null
  }
  const containerRect = scrollContainer.getBoundingClientRect()
  const lastRect = lastNode.getBoundingClientRect()
  const style = getComputedStyle(scrollContainer)
  const paddingBottomPx = Number.parseFloat(style.paddingBottom) || 0
  const lastRowBottomInViewportPx = lastRect.bottom - containerRect.top
  return scrollContainer.clientHeight - paddingBottomPx - lastRowBottomInViewportPx
}

export function readProjectHierarchyTreeVtlistInnerMetrics (
  scrollContainer: HTMLElement
): {
  gapBelowLastRowPx: number | null
  innerOffsetHeight: number
  marginBottomPx: number
  marginTopPx: number
  mountedNodeCount: number
} | null {
  const inner = scrollContainer.querySelector('.vtlist-inner')
  if (!(inner instanceof HTMLElement)) {
    return null
  }
  const style = inner.style
  const marginTopPx = Number.parseFloat(style.marginTop) || 0
  const marginBottomPx = Number.parseFloat(style.marginBottom) || 0
  const treeNodes = inner.querySelectorAll('.tree-node:not(.drag-placeholder-wrapper)')
  return {
    gapBelowLastRowPx: readProjectHierarchyTreeLastDomRowViewportGapPx(scrollContainer),
    innerOffsetHeight: inner.offsetHeight,
    marginBottomPx,
    marginTopPx,
    mountedNodeCount: treeNodes.length
  }
}

/**
 * True when the gap below the last mounted row is too large to trust as a real
 * overscroll tail (incomplete virt window after expand/remount).
 */
export function isProjectHierarchyTreeVirtualScrollGapUnreliable (
  gapBelowLastRowPx: number,
  clientHeightPx: number
): boolean {
  return gapBelowLastRowPx > clientHeightPx * 0.5
}

export function clampProjectHierarchyTreeScrollTopToLastDomRow (
  scrollContainer: HTMLElement
): { adjusted: boolean, gapBelowLastRowPx: number | null, nextScrollTopPx: number } {
  const gapBelowLastRowPx = readProjectHierarchyTreeLastDomRowViewportGapPx(scrollContainer)
  const currentScrollTopPx = scrollContainer.scrollTop
  if (gapBelowLastRowPx === null || gapBelowLastRowPx <= 1) {
    return {
      adjusted: false,
      gapBelowLastRowPx,
      nextScrollTopPx: currentScrollTopPx
    }
  }
  if (isProjectHierarchyTreeVirtualScrollGapUnreliable(
    gapBelowLastRowPx,
    scrollContainer.clientHeight
  )) {
    return {
      adjusted: false,
      gapBelowLastRowPx,
      nextScrollTopPx: currentScrollTopPx
    }
  }
  const nextScrollTopPx = Math.max(0, currentScrollTopPx - gapBelowLastRowPx)
  scrollContainer.scrollTop = nextScrollTopPx
  return {
    adjusted: true,
    gapBelowLastRowPx,
    nextScrollTopPx
  }
}
