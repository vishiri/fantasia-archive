import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import { faKeybindChordsEqual } from 'app/src/scripts/keybinds/faKeybindChordsEqual'
import { faKeybindEventToChord } from 'app/src/scripts/keybinds/faKeybindEventToChord'
import { faKeybindIsEditableTarget } from 'app/src/scripts/keybinds/faKeybindIsEditableTarget'
import { faKeybindResolveEffectiveChord } from 'app/src/scripts/keybinds/faKeybindResolveEffectiveChord'
import { faKeybindRunCommand } from 'app/src/scripts/keybinds/faKeybindRunCommand'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export function createFaKeybindKeydownHandler (getContext: () => {
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
  suspendGlobalKeybindDispatch: boolean
}): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    if (event.repeat) {
      return
    }
    if (event.isComposing) {
      return
    }

    const ctx = getContext()
    if (ctx.suspendGlobalKeybindDispatch) {
      return
    }

    const chord = faKeybindEventToChord(event)
    if (chord === null) {
      return
    }

    const {
      overrides,
      platform
    } = ctx

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
      break
    }
  }
}
