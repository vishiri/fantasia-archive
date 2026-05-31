import type { I_faChromiumForwardedKeyChordPayload } from 'app/types/I_faChromiumCtrlShiftSuppress'

/**
 * Dispatches a capture-phase keydown on 'window' so global keybind and capture handlers see DOM 'code'.
 */
export function dispatchFaChromiumForwardedKeyChord (
  deps: {
    dispatchEvent: (event: Event) => boolean
    KeyboardEvent: typeof KeyboardEvent
  },
  payload: I_faChromiumForwardedKeyChordPayload
): void {
  const event = new deps.KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    code: payload.code,
    ctrlKey: true,
    shiftKey: true
  })
  deps.dispatchEvent(event)
}
