import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Root shape persisted for user-defined CSS in the main-process store.
 * 'css' holds the raw stylesheet text injected globally into the renderer at runtime.
 * 'frame' remembers the last floating window geometry when the Custom app CSS window was visible.
 */
export interface I_faAppStylingRoot {
  css: string
  frame: I_faFloatingWindowPersistedRect | null
  schemaVersion: 1
}

/**
 * Patch payload accepted by the main-process IPC handler when saving user CSS and/or window frame.
 */
export interface I_faAppStylingPatch {
  css?: string | undefined
  frame?: I_faFloatingWindowPersistedRect | null | undefined
}

/**
 * Preload bridge for reading and updating the persisted user CSS.
 */
export interface I_faAppStylingAPI {
  getAppStyling: () => Promise<I_faAppStylingRoot>
  setAppStyling: (patch: I_faAppStylingPatch) => Promise<void>
}
