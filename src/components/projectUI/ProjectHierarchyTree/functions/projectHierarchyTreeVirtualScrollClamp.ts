/**
 * True when scroll position is at (or past) the virtual list tail.
 */
export function shouldClampProjectHierarchyTreeVirtualScrollTail (
  scrollContainer: HTMLElement
): boolean {
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
  const nextScrollTopPx = Math.max(0, currentScrollTopPx - gapBelowLastRowPx)
  scrollContainer.scrollTop = nextScrollTopPx
  return {
    adjusted: true,
    gapBelowLastRowPx,
    nextScrollTopPx
  }
}
