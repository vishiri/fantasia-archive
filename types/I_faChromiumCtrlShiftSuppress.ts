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
 * Focus-gated controller for the Electron globalShortcut handlers that intercept denylisted
 * Ctrl+Shift chords. Accelerators register only while the main window is focused ('activate')
 * and are released on blur or teardown ('deactivate'), so a backgrounded Fantasia Archive never
 * steals these chords from other applications. 'globallyForwardedDomCodes' lists the DOM codes
 * currently claimed by globalShortcut and is repopulated on each 'activate'.
 */
export interface I_faChromiumCtrlShiftGlobalShortcutForwardController {
  activate: () => void
  deactivate: () => void
  globallyForwardedDomCodes: ReadonlySet<T_faChromiumCtrlShiftSuppressKeyCode>
}
