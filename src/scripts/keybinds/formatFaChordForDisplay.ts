import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'

import { sortFaKeybindMods } from 'app/src/scripts/keybinds/faKeybindSortMods'

function modifierLabel (mod: T_faKeybindModifierLiteral, platform: NodeJS.Platform): string {
  if (mod === 'meta') {
    return platform === 'darwin' ? 'Cmd' : 'Meta'
  }
  if (mod === 'ctrl') {
    return 'Ctrl'
  }
  if (mod === 'alt') {
    return platform === 'darwin' ? 'Opt' : 'Alt'
  }
  return 'Shift'
}

function codeLabel (code: string): string {
  if (code.startsWith('Key') && code.length === 4) {
    return code.slice(3)
  }
  if (code.startsWith('Digit') && code.length === 6) {
    return code.slice(5)
  }
  if (code.startsWith('Arrow')) {
    return `${code.slice(5)} arrow`
  }
  const map: Record<string, string> = {
    Backquote: '`',
    BracketLeft: '[',
    BracketRight: ']',
    Backslash: '\\',
    Comma: ',',
    Enter: 'Enter',
    Equal: '=',
    Minus: '-',
    Period: '.',
    Quote: "'",
    Semicolon: ';',
    Slash: '/',
    Space: 'Space',
    Tab: 'Tab'
  }
  if (map[code] !== undefined) {
    return map[code]
  }
  if (/^F\d{1,2}$/.test(code)) {
    return code
  }
  return code
}

/**
 * Human-readable chord for UI (platform-aware modifier labels).
 */
export function formatFaChordForDisplay (chord: I_faChordSerialized, platform: NodeJS.Platform): string {
  const mods = sortFaKeybindMods(chord.mods)
  const prefix = mods.map((m) => `${modifierLabel(m, platform)} + `).join('')
  return `${prefix}${codeLabel(chord.code)}`
}
