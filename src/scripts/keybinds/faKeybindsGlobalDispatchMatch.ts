import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import { faKeybindIsEditableTarget } from 'app/src/scripts/keybinds/faKeybindsGlobalDispatchEditable'
import { faKeybindRunCommand } from 'app/src/scripts/keybinds/faKeybindRunCommand'
import type {
  I_faChordSerialized,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'

/**
 * Finds the first matching command for chord, dispatches it, and returns its id; otherwise null.
 */
export function matchGlobalKeybindChordAndDispatch (params: {
  event: KeyboardEvent
  chord: I_faChordSerialized
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
}): T_faKeybindCommandId | null {
  const {
    event,
    chord,
    overrides,
    platform
  } = params

  for (const def of FA_KEYBIND_COMMAND_DEFINITIONS) {
    const effective = faKeybindResolveEffectiveChord({
      commandId: def.id,
      defaultChord: def.defaultChord,
      overrides,
      platform
    })
    if (effective === null) {
      continue
    }
    if (!faKeybindChordsEqual(chord, effective)) {
      continue
    }
    if (faKeybindIsEditableTarget(event.target) && !def.firesInEditableFields) {
      continue
    }
    event.preventDefault()
    event.stopPropagation()
    faKeybindRunCommand(def.id)
    return def.id
  }

  return null
}
