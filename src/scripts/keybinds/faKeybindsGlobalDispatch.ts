import { faKeybindEventToChord } from 'app/src/scripts/keybinds/faKeybindsChordFromEvent'
import { matchGlobalKeybindChordAndDispatch } from 'app/src/scripts/keybinds/faKeybindsGlobalDispatchMatch'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export { faKeybindIsEditableTarget } from 'app/src/scripts/keybinds/faKeybindsGlobalDispatchEditable'

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
  const overrides = snap?.store.overrides ?? {}
  const platform = snap?.platform ?? 'win32'
  const suspendGlobalKeybindDispatch = keybinds.suspendGlobalKeybindDispatch
  return {
    overrides,
    platform,
    suspendGlobalKeybindDispatch
  }
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

    matchGlobalKeybindChordAndDispatch({
      chord,
      event,
      overrides: ctx.overrides,
      platform: ctx.platform
    })
  }
}
