import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

/**
 * Single help-tooltip row: an i18n key (under 'dialogs.programStyling.helpTooltip.items')
 * paired with the platform-resolved chord text shown next to the label.
 */
export interface I_FaMonacoKeybindHelpItem {
  /**
   * Sub-key under 'dialogs.programStyling.helpTooltip.items', e.g. 'commandPalette'.
   * The component prefixes it with that path before passing to '$t'.
   */
  labelKey: string
  /**
   * Display chord text (already platform-aware), e.g. 'Ctrl + F' or 'Cmd + F'.
   * Not localized: shortcut chord text is the same in every interface language.
   */
  chord: string
}

/**
 * Detects whether the renderer is hosted on a Mac platform. Prefers the keybind snapshot's
 * 'platform' so chord labels here stay consistent with the rest of the app's chord display.
 * Falls back to a simple 'navigator.userAgent' check before the keybinds store has been hydrated.
 */
function isMacPlatform (): boolean {
  try {
    const snap = S_FaKeybinds().snapshot
    if (snap !== null) {
      return snap.platform === 'darwin'
    }
  } catch {
    // Pinia not active in this context (e.g. early Storybook canvas); fall through.
  }
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent
    if (typeof ua === 'string' && /Mac|iPhone|iPad/i.test(ua)) {
      return true
    }
  }
  return false
}

/**
 * Builds the static list of Monaco editor keybinds shown in the DialogProgramStyling help tooltip.
 *
 * Chord text is derived from VS Code's documented defaults (Monaco inherits them):
 *  - Command palette: 'F1' is the cross-platform default and equivalent to 'Ctrl + Shift + P' / 'Cmd + Shift + P'.
 *  - Trigger suggestion: Monaco uses 'Ctrl + Space' on every platform (not 'Cmd + Space' on macOS).
 *  - Find / Cut / Copy / Paste: primary modifier is 'Cmd' on macOS, 'Ctrl' elsewhere.
 *  - Find and replace on macOS uses 'Cmd + Opt + F' (because 'Cmd + H' is reserved by macOS for window hide).
 *
 * Returned chord strings are read directly into the tooltip; do not localize them.
 */
export function getMonacoKeybindHelpItems (): I_FaMonacoKeybindHelpItem[] {
  const isMac = isMacPlatform()
  const primary = isMac ? 'Cmd' : 'Ctrl'
  const findReplaceChord = isMac ? 'Cmd + Opt + F' : 'Ctrl + H'
  return [
    {
      labelKey: 'commandPalette',
      chord: 'F1'
    },
    {
      labelKey: 'triggerSuggestion',
      chord: 'Ctrl + Space'
    },
    {
      labelKey: 'find',
      chord: `${primary} + F`
    },
    {
      labelKey: 'findReplace',
      chord: findReplaceChord
    },
    {
      labelKey: 'copy',
      chord: `${primary} + C`
    },
    {
      labelKey: 'paste',
      chord: `${primary} + V`
    },
    {
      labelKey: 'cut',
      chord: `${primary} + X`
    },
    {
      labelKey: 'addPadding',
      chord: 'Tab'
    },
    {
      labelKey: 'removePadding',
      chord: 'Shift + Tab'
    }
  ]
}
