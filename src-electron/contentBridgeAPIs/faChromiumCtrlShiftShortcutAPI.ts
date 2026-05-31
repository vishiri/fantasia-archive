import { ipcRenderer } from 'electron'

import { FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faChromiumForwardedKeyChordPayload } from 'app/types/I_faChromiumCtrlShiftSuppress'

let forwardListenerInstalled = false
let forwardedKeyChordHandler: ((payload: I_faChromiumForwardedKeyChordPayload) => void) | undefined

function isFaChromiumForwardedKeyChordPayload (
  value: unknown
): value is I_faChromiumForwardedKeyChordPayload {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const record = value as { code?: unknown }
  return typeof record.code === 'string' && record.code.length > 0
}

/**
 * Wires main-process forwarded Ctrl+Shift denylist chords into the renderer (Quasar boot).
 */
export function installFaChromiumForwardedKeyChordListener (
  onForwardedKeyChord: (payload: I_faChromiumForwardedKeyChordPayload) => void
): void {
  forwardedKeyChordHandler = onForwardedKeyChord
  if (forwardListenerInstalled) {
    return
  }
  forwardListenerInstalled = true
  ipcRenderer.on(
    FA_CHROMIUM_CTRL_SHIFT_SHORTCUT_IPC.forwardKeyChordToRenderer,
    (_event, payload: unknown) => {
      if (!isFaChromiumForwardedKeyChordPayload(payload)) {
        return
      }
      forwardedKeyChordHandler?.(payload)
    }
  )
}

export const faChromiumCtrlShiftShortcutAPI = {
  installForwardedKeyChordListener: installFaChromiumForwardedKeyChordListener
}
