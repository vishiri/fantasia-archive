import { ensureFaChromiumForwardedKeyChordListener } from 'app/src/scripts/keybinds/faChromiumForwardedKeyChordInstall_manager'

import { createRunFaChromiumForwardedKeyChordBoot } from './functions/createRunFaChromiumForwardedKeyChordBoot'
import { waitFaChromiumCtrlShiftShortcutBridgeOrTimeout } from './functions/faChromiumCtrlShiftShortcutBridgePoll'

export const runFaChromiumForwardedKeyChordBoot = createRunFaChromiumForwardedKeyChordBoot({
  ensureFaChromiumForwardedKeyChordListener,
  getMode: () => process.env.MODE,
  hasChromiumCtrlShiftShortcutBridge: () => {
    const peek = window.faContentBridgeAPIs?.faChromiumCtrlShiftShortcut

    return typeof peek?.installForwardedKeyChordListener === 'function'
  },
  nowMs: () => Date.now(),
  sleepMs: (ms) => new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms)
  }),
  waitFaChromiumCtrlShiftShortcutBridgeOrTimeout
})
