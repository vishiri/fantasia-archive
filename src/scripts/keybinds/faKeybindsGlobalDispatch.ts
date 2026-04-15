import { FA_KEYBIND_COMMAND_DEFINITIONS } from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import {
  faKeybindChordsEqual,
  faKeybindResolveEffectiveChord
} from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import { faKeybindEventToChord } from 'app/src/scripts/keybinds/faKeybindsChordFromEvent'
import { faKeybindRunCommand } from 'app/src/scripts/keybinds/faKeybindRunCommand'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

/**
 * Snapshot read for the global keydown matcher (Pinia store + platform from main).
 */
export function getFaKeybindKeydownContext (): {
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
  suspendGlobalKeybindDispatch: boolean
} {
  const keybinds = S_FaKeybinds()
  const snap = keybinds.snapshot
  return {
    overrides: snap?.store.overrides ?? {},
    platform: snap?.platform ?? 'win32',
    suspendGlobalKeybindDispatch: keybinds.suspendGlobalKeybindDispatch
  }
}

/**
 * True when the event target is an editable control where shortcuts should not fire by default.
 */
export function faKeybindIsEditableTarget (target: EventTarget | null): boolean {
  if (target === null || !(target instanceof HTMLElement)) {
    return false
  }
  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }
  if (target.isContentEditable) {
    return true
  }
  return target.closest('[contenteditable="true"]') !== null
}

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
