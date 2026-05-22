/**
 * Prevents a second welcome auto-load on SplashPage mount after boot already attempted skip (which would open the next MRU row after a missing head was pruned).
 */
let welcomeScreenAutoLoadBootAttempted = false

/**
 * After the MRU head file is missing, blocks further automatic welcome auto-load for this app session (manual resume still allowed).
 */
let welcomeScreenAutoLoadMruHeadFailed = false

export function markWelcomeScreenAutoLoadBootAttempted (): void {
  welcomeScreenAutoLoadBootAttempted = true
}

export function hasWelcomeScreenAutoLoadBootBeenAttempted (): boolean {
  return welcomeScreenAutoLoadBootAttempted
}

export function markWelcomeScreenAutoLoadMruHeadFailed (): void {
  welcomeScreenAutoLoadMruHeadFailed = true
}

export function hasWelcomeScreenAutoLoadMruHeadFailed (): boolean {
  return welcomeScreenAutoLoadMruHeadFailed
}

/**
 * Vitest-only reset for session flag isolation.
 */
export function resetWelcomeScreenAutoLoadBootAttemptedForTests (): void {
  welcomeScreenAutoLoadBootAttempted = false
  welcomeScreenAutoLoadMruHeadFailed = false
}
