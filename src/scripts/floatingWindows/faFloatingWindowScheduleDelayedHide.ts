/**
 * Clears an optional pending timer, then schedules a one-shot callback (used for post-transition teardown).
 */
export function scheduleFaFloatingWindowDelayedHide (
  prevTimerId: number | null,
  delayMs: number,
  onFire: () => void
): number {
  if (prevTimerId !== null) {
    clearTimeout(prevTimerId)
  }
  return setTimeout(onFire, delayMs) as unknown as number
}
