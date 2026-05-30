import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindCommandDefinition } from 'app/types/I_faKeybindsDomain'
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

function formatFaKeybindChordForUiWithSort (
  chord: I_faChordSerialized,
  platform: NodeJS.Platform,
  sortFaKeybindMods: (mods: T_faKeybindModifierLiteral[]) => T_faKeybindModifierLiteral[]
): string {
  const mods = sortFaKeybindMods(chord.mods)
  const prefix = mods.map((m) => `${modifierLabel(m, platform)} + `).join('')
  return `${prefix}${codeLabel(chord.code)}`
}

export function createFaKeybindsChordUiFormatting (deps: {
  faKeybindResolveEffectiveChord: (params: {
    commandId: T_faKeybindCommandId
    defaultChord: I_faKeybindCommandDefinition['defaultChord']
    overrides: I_faKeybindsSnapshot['store']['overrides']
    platform: NodeJS.Platform
  }) => I_faChordSerialized | null
  findFaKeybindCommandDefinition: (
    commandId: T_faKeybindCommandId
  ) => I_faKeybindCommandDefinition | undefined
  sortFaKeybindMods: (mods: T_faKeybindModifierLiteral[]) => T_faKeybindModifierLiteral[]
}): {
    formatFaKeybindChordForUi: (chord: I_faChordSerialized, platform: NodeJS.Platform) => string
    formatFaKeybindCommandLabelFromSnapshot: (params: {
      commandId: T_faKeybindCommandId | undefined
      snapshot: I_faKeybindsSnapshot | null
    }) => string | null
  } {
  const formatFaKeybindChordForUi = (
    chord: I_faChordSerialized,
    platform: NodeJS.Platform
  ): string => formatFaKeybindChordForUiWithSort(chord, platform, deps.sortFaKeybindMods)

  function formatFaKeybindCommandLabelFromSnapshot (params: {
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

    const def = deps.findFaKeybindCommandDefinition(commandId)
    if (def === undefined) {
      return null
    }

    const resolved = deps.faKeybindResolveEffectiveChord({
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

  return {
    formatFaKeybindChordForUi,
    formatFaKeybindCommandLabelFromSnapshot
  }
}
