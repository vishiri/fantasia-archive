import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { faKeybindChordsEqual } from 'app/src/scripts/keybinds/faKeybindChordsEqual'
import { faKeybindResolveEffectiveChord } from 'app/src/scripts/keybinds/faKeybindResolveEffectiveChord'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

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
