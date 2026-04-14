import type { I_faChordDefault } from 'app/types/I_faKeybindsDomain'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'

import { sortFaKeybindMods } from 'app/src/scripts/keybinds/faKeybindSortMods'

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

  return {
    code: chord.code,
    mods: sortFaKeybindMods(mods)
  }
}
