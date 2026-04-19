import type { I_faChordDefault } from 'app/types/I_faKeybindsDomain'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'

const MOD_ORDER: T_faKeybindModifierLiteral[] = [
  'ctrl',
  'meta',
  'alt',
  'shift'
]

/**
 * Stable modifier order for equality and display.
 */
export function sortFaKeybindMods (mods: T_faKeybindModifierLiteral[]): T_faKeybindModifierLiteral[] {
  const unique = [...new Set(mods)]
  return MOD_ORDER.filter((m) => unique.includes(m))
}

/**
 * True when code and modifier sets match (order-independent for mods).
 */
export function faKeybindChordsEqual (a: I_faChordSerialized, b: I_faChordSerialized): boolean {
  if (a.code !== b.code) {
    return false
  }
  const ma = sortFaKeybindMods(a.mods)
  const mb = sortFaKeybindMods(b.mods)
  if (ma.length !== mb.length) {
    return false
  }
  return ma.every((v, i) => v === mb[i])
}

/**
 * Expands 'primary' to Meta on darwin and Ctrl on win32/linux.
 */
export function faKeybindExpandDefaultChord (
  chord: I_faChordDefault | null,
  platform: NodeJS.Platform
): I_faChordSerialized | null {
  if (chord === null) {
    return null
  }

  const primary: T_faKeybindModifierLiteral = platform === 'darwin' ? 'meta' : 'ctrl'
  const mods: T_faKeybindModifierLiteral[] = chord.mods.map((m) => {
    return m === 'primary' ? primary : m
  })

  const sortedMods = sortFaKeybindMods(mods)
  return {
    code: chord.code,
    mods: sortedMods
  }
}

/**
 * User override wins; null override clears to default; missing uses default.
 */
export function faKeybindResolveEffectiveChord (params: {
  commandId: T_faKeybindCommandId
  defaultChord: I_faChordDefault | null
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
}): I_faChordSerialized | null {
  const {
    commandId,
    defaultChord,
    overrides,
    platform
  } = params
  const o = overrides[commandId]
  if (o === null) {
    return faKeybindExpandDefaultChord(defaultChord, platform)
  }
  if (o !== undefined) {
    return o
  }
  return faKeybindExpandDefaultChord(defaultChord, platform)
}
