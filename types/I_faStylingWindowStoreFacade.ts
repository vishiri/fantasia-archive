import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'

/**
 * Pinia styling stores as seen by window styling factories (auto-unwrapped fields).
 */
export interface I_faAppStylingStylingWindowStore {
  clearCssLivePreview: () => void
  css: string
  cssLivePreview: string | null
  persistAppStylingPartialSilent: (input: {
    frame: { height: number; width: number; x: number; y: number }
  }) => Promise<void>
  refreshAppStyling: () => Promise<boolean>
  root?: { frame?: I_faFloatingWindowPersistedRect | null } | null | undefined
  setCssLivePreview: (css: string) => void
}

export interface I_faProjectStylingStylingWindowStore {
  clearCssLivePreview: () => void
  css: string
  cssLivePreview: string | null
  persistProjectStylingPartialSilent: (input: Record<string, unknown>) => Promise<void>
  refreshProjectStyling: () => Promise<boolean>
  root?: { frame?: I_faFloatingWindowPersistedRect | null } | null | undefined
  setCssLivePreview: (css: string) => void
}
