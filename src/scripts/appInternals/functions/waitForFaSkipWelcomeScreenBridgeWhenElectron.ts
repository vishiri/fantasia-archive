const FA_SKIP_WELCOME_SCREEN_BRIDGE_POLL_MS = 100
const FA_SKIP_WELCOME_SCREEN_BRIDGE_TIMEOUT_MS = 30_000

export function createWaitForFaSkipWelcomeScreenBridgeWhenElectron (deps: {
  getMode: () => string | undefined
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  isSkipWelcomeScreenBridgeReady: () => boolean
}): () => Promise<void> {
  return async function waitForFaSkipWelcomeScreenBridgeWhenElectron (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    const deadlineMs = deps.nowMs() + FA_SKIP_WELCOME_SCREEN_BRIDGE_TIMEOUT_MS

    while (deps.nowMs() < deadlineMs) {
      if (deps.isSkipWelcomeScreenBridgeReady()) {
        return
      }

      await deps.sleepMs(FA_SKIP_WELCOME_SCREEN_BRIDGE_POLL_MS)
    }

    throw new Error('Timed out waiting for skip-welcome screen preload bridges.')
  }
}
