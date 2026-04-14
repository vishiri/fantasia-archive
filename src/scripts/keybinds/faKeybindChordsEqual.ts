import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import { sortFaKeybindMods } from 'app/src/scripts/keybinds/faKeybindSortMods'

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
