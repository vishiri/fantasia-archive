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
 * Next scrollLeft after applying wheel delta, or null when overflow tabs cannot move.
 */
export function resolveProjectAppControlBarTabsWheelScrollLeft (input: {
  clientWidth: number
  delta: number
  scrollLeft: number
  scrollWidth: number
}): number | null {
  const maxScroll = input.scrollWidth - input.clientWidth
  if (maxScroll <= 0) {
    return null
  }
  if (input.delta === 0) {
    return null
  }

  const nextScrollLeft = Math.min(
    maxScroll,
    Math.max(0, input.scrollLeft + input.delta)
  )
  if (nextScrollLeft === input.scrollLeft) {
    return null
  }

  return nextScrollLeft
}
