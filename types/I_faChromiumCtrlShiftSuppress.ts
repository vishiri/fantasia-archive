/**
 * DOM 'code' values for Ctrl+Shift chords Chromium may consume before the renderer sees keydown.
 * Shared by main-process suppress wiring and Vitest.
 */
export const FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES = [
  'KeyB',
  'KeyD',
  'KeyG',
  'KeyJ',
  'KeyM',
  'KeyN',
  'KeyO',
  'KeyP',
  'KeyR',
  'KeyT',
  'KeyW',
  'Delete'
] as const

/**
 * One entry in 'FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES'.
 */
export type T_faChromiumCtrlShiftSuppressKeyCode =
  typeof FA_CHROMIUM_CTRL_SHIFT_SUPPRESS_KEY_CODES[number]

/**
 * Snapshot of Electron 'before-input-event' fields used by suppress matchers (main process).
 */
export interface I_faChromiumBeforeInputSnapshot {
  alt: boolean
  code: string
  control: boolean
  key: string
  meta: boolean
  shift: boolean
  type: string
}

/**
 * Main → renderer payload after suppressing Chromium handling for a denylisted chord.
 */
export interface I_faChromiumForwardedKeyChordPayload {
  code: T_faChromiumCtrlShiftSuppressKeyCode
}

/**
 * Result of registering Electron globalShortcut handlers for denylisted Ctrl+Shift chords.
 */
export interface I_faChromiumCtrlShiftGlobalShortcutForwardRegistration {
  globallyForwardedDomCodes: ReadonlySet<T_faChromiumCtrlShiftSuppressKeyCode>
  unregister: () => void
  usesGlobalShortcutForward: boolean
}
