import type { I_faChromiumForwardedKeyChordPayload } from 'app/types/I_faChromiumCtrlShiftSuppress'

/**
 * Installs the preload IPC listener that turns main-process forwarded Ctrl+Shift chords into keydown events.
 */
export function createEnsureFaChromiumForwardedKeyChordListener (deps: {
  dispatchForwardedKeyChord: (payload: I_faChromiumForwardedKeyChordPayload) => void
  getListenerAlreadyInstalled: () => boolean
  hasChromiumCtrlShiftShortcutBridge: () => boolean
  installForwardedKeyChordListener: (
    handler: (payload: I_faChromiumForwardedKeyChordPayload) => void
  ) => void
  markListenerInstalled: () => void
}): () => void {
  return function ensureFaChromiumForwardedKeyChordListener (): void {
    if (deps.getListenerAlreadyInstalled()) {
      return
    }
    if (!deps.hasChromiumCtrlShiftShortcutBridge()) {
      return
    }

    deps.installForwardedKeyChordListener((payload) => {
      deps.dispatchForwardedKeyChord(payload)
    })
    deps.markListenerInstalled()
  }
}
