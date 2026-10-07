/**
 * Places Project overview Apex tip above a column and centers it.
 * Always prefers above (may extend past the canvas top) — never flips below.
 */
export function computeProjectOverviewApexTooltipAboveBarPosition (input: {
  barLeft: number
  barTop: number
  barWidth: number
  gapPx: number
  tooltipHeight: number
  tooltipWidth: number
  wrapLeft: number
  wrapTop: number
  wrapWidth: number
}): {
    leftPx: number
    placement: 'top'
    topPx: number
  } {
  const barCenterX = input.barLeft + (input.barWidth / 2)
  const maxLeft = Math.max(0, input.wrapWidth - input.tooltipWidth)
  const leftPx = Math.min(
    maxLeft,
    Math.max(0, barCenterX - input.wrapLeft - (input.tooltipWidth / 2))
  )
  const topPx = input.barTop - input.wrapTop - input.tooltipHeight - input.gapPx

  return {
    leftPx,
    placement: 'top',
    topPx
  }
}

/**
 * Unions stacked column segment rects into one top-of-column anchor box.
 */
export function resolveProjectOverviewApexStackedColumnAnchorRect (
  segmentRects: ReadonlyArray<{
    bottom: number
    left: number
    right: number
    top: number
  }>
): {
  left: number
  top: number
  width: number
} | null {
  if (segmentRects.length === 0) {
    return null
  }

  let left = Number.POSITIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY

  for (const rect of segmentRects) {
    if (rect.left < left) {
      left = rect.left
    }
    if (rect.top < top) {
      top = rect.top
    }
    if (rect.right > right) {
      right = rect.right
    }
  }

  if (!Number.isFinite(left) || !Number.isFinite(top) || !Number.isFinite(right)) {
    return null
  }

  const width = right - left
  return {
    left,
    top,
    width
  }
}
