/**
 * Increments a modal dialog open counter after a surface becomes visible.
 */
export function incrementDialogOpenCount (count: number): number {
  return count + 1
}

/**
 * Decrements a modal dialog open counter when a surface hides; never goes below zero.
 */
export function decrementDialogOpenCountNonNegative (count: number): number {
  return Math.max(0, count - 1)
}
