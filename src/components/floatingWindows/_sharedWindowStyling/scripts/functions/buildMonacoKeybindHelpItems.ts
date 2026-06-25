import type { I_faMonacoKeybindHelpItem } from 'app/types/I_faWindowStylingMonaco'

/**
 * Builds Monaco editor default shortcut rows for the styling window help surface.
 */
export function buildMonacoKeybindHelpItems (isMac: boolean): I_faMonacoKeybindHelpItem[] {
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
