import { findFaKeybindCommandDefinition } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import {
  faKeybindResolveEffectiveChord,
  sortFaKeybindMods
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'
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
 * Human-readable shortcut string for menus, dialogs, and other renderer UI (platform-aware modifier labels).
 *
 * @param chord Serialized chord (concrete modifier literals only).
 * @param platform OS platform string from the keybind snapshot (e.g. `win32`, `darwin`).
 * @returns Single-line label such as `Ctrl + Shift + L`.
 */
export function formatFaKeybindChordForUi (
  chord: I_faChordSerialized,
  platform: NodeJS.Platform
): string {
  const mods = sortFaKeybindMods(chord.mods)
  const prefix = mods.map((m) => `${modifierLabel(m, platform)} + `).join('')
  return `${prefix}${codeLabel(chord.code)}`
}

/**
 * Resolves the effective chord for a command from a keybind snapshot and formats it for UI.
 * Returns `null` when the snapshot is not loaded, the command is unknown, or no effective chord exists.
 *
 * @param params.commandId Global keybind command id (omit or pass `undefined` when the surface has no bound command).
 * @param params.snapshot Pinia `S_FaKeybinds.snapshot` (or `null` before refresh).
 * @returns Display label or `null` to hide optional shortcut hints.
 */
export function formatFaKeybindCommandLabelFromSnapshot (params: {
  commandId: T_faKeybindCommandId | undefined
  snapshot: I_faKeybindsSnapshot | null
}): string | null {
  const {
    commandId,
    snapshot
  } = params
  if (commandId === undefined || snapshot === null) {
    return null
  }

  const def = findFaKeybindCommandDefinition(commandId)
  if (def === undefined) {
    return null
  }

  const resolved = faKeybindResolveEffectiveChord({
    commandId,
    defaultChord: def.defaultChord,
    overrides: snapshot.store.overrides,
    platform: snapshot.platform
  })
  if (resolved === null) {
    return null
  }

  return formatFaKeybindChordForUi(resolved, snapshot.platform)
}
