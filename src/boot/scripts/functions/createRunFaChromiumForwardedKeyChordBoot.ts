export function createRunFaChromiumForwardedKeyChordBoot (deps: {
  ensureFaChromiumForwardedKeyChordListener: () => void
  getMode: () => string | undefined
  hasChromiumCtrlShiftShortcutBridge: () => boolean
  nowMs: () => number
  sleepMs: (ms: number) => Promise<void>
  waitFaChromiumCtrlShiftShortcutBridgeOrTimeout: (args: {
    hasChromiumCtrlShiftShortcutBridge: () => boolean
    nowMs: () => number
    sleepMs: (ms: number) => Promise<void>
  }) => Promise<void>
}): () => Promise<void> {
  return async function runFaChromiumForwardedKeyChordBoot (): Promise<void> {
    if (deps.getMode() !== 'electron') {
      return
    }

    await deps.waitFaChromiumCtrlShiftShortcutBridgeOrTimeout({
      hasChromiumCtrlShiftShortcutBridge: deps.hasChromiumCtrlShiftShortcutBridge,
      nowMs: deps.nowMs,
      sleepMs: deps.sleepMs
    })

    deps.ensureFaChromiumForwardedKeyChordListener()
  }
}
