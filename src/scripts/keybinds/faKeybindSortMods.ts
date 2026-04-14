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
