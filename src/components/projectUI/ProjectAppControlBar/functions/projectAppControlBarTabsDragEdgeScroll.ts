/**
 * Near-edge zone (px) where horizontal tab drag starts auto-scrolling overflow.
 */
export const PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_SENSITIVITY_PX = 56

/**
 * Peak horizontal scroll speed (px/s) at full edge intensity (at or past the strip edge).
 */
export const PROJECT_APP_CONTROL_BAR_TABS_DRAG_EDGE_SCROLL_MAX_SPEED_PX_PER_SEC = 900

/**
 * Smoothstep intensity 0..1 from distance to an edge (negative = past edge → full).
 */
export function resolveProjectAppControlBarTabsDragEdgeScrollIntensity (
  distanceFromEdgePx: number,
  scrollSensitivityPx: number
): number {
  if (scrollSensitivityPx <= 0) {
    return 0
  }
  if (distanceFromEdgePx >= scrollSensitivityPx) {
    return 0
  }
  const linear = Math.min(
    1,
    Math.max(0, (scrollSensitivityPx - distanceFromEdgePx) / scrollSensitivityPx)
  )
  return linear * linear * (3 - (2 * linear))
}

/**
 * Signed scroll velocity (px/s) for drag edge-scroll, or null when no scroll needed.
 * Speed scales with how deep the pointer is in the edge zone for smoother pull-in.
 */
export function resolveProjectAppControlBarTabsDragEdgeScrollVelocityPxPerSec (input: {
  clientWidth: number
  contentLeft: number
  contentRight: number
  maxSpeedPxPerSec: number
  pointerClientX: number
  scrollLeft: number
  scrollSensitivityPx: number
  scrollWidth: number
}): number | null {
  const maxScroll = input.scrollWidth - input.clientWidth
  if (maxScroll <= 0) {
    return null
  }

  const distanceFromLeft = input.pointerClientX - input.contentLeft
  const distanceFromRight = input.contentRight - input.pointerClientX

  const leftIntensity = resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    distanceFromLeft,
    input.scrollSensitivityPx
  )
  if (leftIntensity > 0 && input.scrollLeft > 0) {
    return -(input.maxSpeedPxPerSec * leftIntensity)
  }

  const rightIntensity = resolveProjectAppControlBarTabsDragEdgeScrollIntensity(
    distanceFromRight,
    input.scrollSensitivityPx
  )
  if (rightIntensity > 0 && input.scrollLeft < maxScroll) {
    return input.maxSpeedPxPerSec * rightIntensity
  }

  return null
}
