/**
 * Root shape persisted for user-defined CSS in the main-process store.
 * 'css' holds the raw stylesheet text injected globally into the renderer at runtime.
 */
export interface I_faProgramStylingRoot {
  css: string
  schemaVersion: 1
}

/**
 * Patch payload accepted by the main-process IPC handler when saving user CSS.
 */
export interface I_faProgramStylingPatch {
  css: string
}

/**
 * Preload bridge for reading and updating the persisted user CSS.
 */
export interface I_faProgramStylingAPI {
  getProgramStyling: () => Promise<I_faProgramStylingRoot>
  setProgramStyling: (patch: I_faProgramStylingPatch) => Promise<void>
}
