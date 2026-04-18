import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { formatFaKeybindChordForUi } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

/**
 * @deprecated Prefer importing {@link formatFaKeybindChordForUi} from `faKeybindsChordUiFormatting.ts` in new code.
 * Alias retained for existing imports and tests.
 */
export const formatFaChordForDisplay = formatFaKeybindChordForUi

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
