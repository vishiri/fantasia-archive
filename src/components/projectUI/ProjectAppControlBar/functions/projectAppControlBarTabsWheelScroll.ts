/**
 * Prefer trackpad horizontal delta; otherwise map vertical wheel to horizontal
 * (Shift+wheel and plain vertical wheel both report mainly on deltaY in Chromium).
 */
export function resolveProjectAppControlBarTabsHorizontalWheelDelta (input: {
  deltaX: number
  deltaY: number
}): number {
  if (Math.abs(input.deltaX) > Math.abs(input.deltaY)) {
    return input.deltaX
  }
  return input.deltaY
}

/**
 * scrollLeft range for overflow tabs. RTL uses the CSSOM range 0 down to -extent.
 */
export function resolveProjectAppControlBarTabsScrollLeftBounds (input: {
  clientWidth: number
  direction?: 'ltr' | 'rtl'
  scrollWidth: number
}): {
  maxScrollLeft: number
  minScrollLeft: number
} | null {
  const extent = input.scrollWidth - input.clientWidth
  if (extent <= 0) {
    return null
  }
  if (input.direction === 'rtl') {
    const maxScrollLeft = 0
    const minScrollLeft = -extent
    return {
      maxScrollLeft,
      minScrollLeft
    }
  }
  const maxScrollLeft = extent
  const minScrollLeft = 0
  return {
    maxScrollLeft,
    minScrollLeft
  }
}

/**
 * Next scrollLeft after applying wheel delta, or null when overflow tabs cannot move.
 * Positive delta moves toward the inline end (left in RTL).
 */
export function resolveProjectAppControlBarTabsWheelScrollLeft (input: {
  clientWidth: number
  delta: number
  direction?: 'ltr' | 'rtl'
  scrollLeft: number
  scrollWidth: number
}): number | null {
  const bounds = resolveProjectAppControlBarTabsScrollLeftBounds(input)
  if (bounds === null || input.delta === 0) {
    return null
  }
  const signedDelta = input.direction === 'rtl' ? -input.delta : input.delta
  const unclampedScrollLeft = input.scrollLeft + signedDelta
  const nextScrollLeft = Math.min(
    bounds.maxScrollLeft,
    Math.max(bounds.minScrollLeft, unclampedScrollLeft)
  )
  if (nextScrollLeft === input.scrollLeft) {
    return null
  }
  return nextScrollLeft
}

/**
 * True when q-tabs content has no right-side clip (no overflow, or scrolled to inline end).
 * 1px slack covers sub-pixel scrollLeft vs maxScroll mismatch.
 */
export function resolveProjectAppControlBarTabsIsScrolledToInlineEnd (input: {
  clientWidth: number
  direction?: 'ltr' | 'rtl'
  scrollLeft: number
  scrollWidth: number
}): boolean {
  const bounds = resolveProjectAppControlBarTabsScrollLeftBounds(input)
  if (bounds === null) {
    return true
  }
  if (input.direction === 'rtl') {
    return input.scrollLeft <= bounds.minScrollLeft + 1
  }
  return input.scrollLeft >= bounds.maxScrollLeft - 1
}
