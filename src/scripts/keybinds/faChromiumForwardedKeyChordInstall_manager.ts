import { dispatchFaChromiumForwardedKeyChord } from 'app/src/scripts/keybinds/functions/dispatchFaChromiumForwardedKeyChord'

import { createEnsureFaChromiumForwardedKeyChordListener } from './functions/createEnsureFaChromiumForwardedKeyChordListener'

let faChromiumForwardedKeyChordListenerInstalled = false

export const ensureFaChromiumForwardedKeyChordListener = createEnsureFaChromiumForwardedKeyChordListener({
  dispatchForwardedKeyChord: (payload) => {
    dispatchFaChromiumForwardedKeyChord(
      {
        KeyboardEvent,
        dispatchEvent: (event) => window.dispatchEvent(event)
      },
      payload
    )
  },
  getListenerAlreadyInstalled: () => faChromiumForwardedKeyChordListenerInstalled,
  hasChromiumCtrlShiftShortcutBridge: () => {
    const peek = window.faContentBridgeAPIs?.faChromiumCtrlShiftShortcut

    return typeof peek?.installForwardedKeyChordListener === 'function'
  },
  installForwardedKeyChordListener: (handler) => {
    window.faContentBridgeAPIs?.faChromiumCtrlShiftShortcut?.installForwardedKeyChordListener(
      handler
    )
  },
  markListenerInstalled: () => {
    faChromiumForwardedKeyChordListenerInstalled = true
  }
})
