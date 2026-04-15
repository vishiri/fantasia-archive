import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord,
  sortFaKeybindMods
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'

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

/**
 * Returns another command id that already uses this chord, or null if none.
 */
export function faKeybindFindChordConflict (params: {
  chord: I_faChordSerialized
  excludeCommandId: T_faKeybindCommandId
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
}): T_faKeybindCommandId | null {
  const {
    chord,
    excludeCommandId,
    overrides,
    platform
  } = params

  for (const def of FA_KEYBIND_COMMAND_DEFINITIONS) {
    if (def.id === excludeCommandId) {
      continue
    }
    const effective = faKeybindResolveEffectiveChord({
      commandId: def.id,
      defaultChord: def.defaultChord,
      overrides,
      platform
    })
    if (effective === null) {
      continue
    }
    if (faKeybindChordsEqual(chord, effective)) {
      return def.id
    }
  }

  return null
}
