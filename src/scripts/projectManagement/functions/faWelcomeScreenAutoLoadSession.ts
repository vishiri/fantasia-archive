/**
 * Prevents a second welcome auto-load on SplashPage mount after boot already attempted skip (which would open the next MRU row after a missing head was pruned).
 */
let welcomeScreenAutoLoadBootAttempted = false

/**
 * After the MRU head file is missing, blocks further automatic welcome auto-load for this app session (manual resume still allowed).
 */
let welcomeScreenAutoLoadMruHeadFailed = false

let welcomeScreenAutoLoadBootCompletion: Promise<void> | undefined
let resolveWelcomeScreenAutoLoadBootCompletion: (() => void) | undefined

function ensureWelcomeScreenAutoLoadBootCompletionPromise (): Promise<void> {
  if (welcomeScreenAutoLoadBootCompletion === undefined) {
    welcomeScreenAutoLoadBootCompletion = new Promise((resolve) => {
      resolveWelcomeScreenAutoLoadBootCompletion = resolve
    })
  }
  return welcomeScreenAutoLoadBootCompletion
}

export function markWelcomeScreenAutoLoadBootAttempted (): void {
  welcomeScreenAutoLoadBootAttempted = true
  ensureWelcomeScreenAutoLoadBootCompletionPromise()
}

export function awaitWelcomeScreenAutoLoadBootCompletion (): Promise<void> {
  if (!welcomeScreenAutoLoadBootAttempted) {
    return Promise.resolve()
  }
  return ensureWelcomeScreenAutoLoadBootCompletionPromise()
}

export function markWelcomeScreenAutoLoadBootCompletion (): void {
  resolveWelcomeScreenAutoLoadBootCompletion?.()
  resolveWelcomeScreenAutoLoadBootCompletion = undefined
  welcomeScreenAutoLoadBootCompletion = undefined
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
  welcomeScreenAutoLoadBootCompletion = undefined
  resolveWelcomeScreenAutoLoadBootCompletion = undefined
}
