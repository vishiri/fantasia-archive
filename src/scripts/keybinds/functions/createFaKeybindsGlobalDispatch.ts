import type { I_faChordSerialized, I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'

export function createFaKeybindsGlobalDispatch (deps: {
  faKeybindEventToChord: (event: KeyboardEvent) => I_faChordSerialized | null
  getFaKeybindsStore: () => {
    snapshot: {
      platform: NodeJS.Platform
      store: { overrides: I_faKeybindsRoot['overrides'] }
    } | null
    suspendGlobalKeybindDispatch: boolean
  }
  matchGlobalKeybindChordAndDispatch: (args: {
    chord: I_faChordSerialized
    event: KeyboardEvent
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }) => void
}): {
    getFaKeybindKeydownContext: () => {
      overrides: I_faKeybindsRoot['overrides']
      platform: NodeJS.Platform
      suspendGlobalKeybindDispatch: boolean
    }
    createFaKeybindKeydownHandler: (getContext: () => {
      overrides: I_faKeybindsRoot['overrides']
      platform: NodeJS.Platform
      suspendGlobalKeybindDispatch: boolean
    }) => (event: KeyboardEvent) => void
  } {
  const getFaKeybindKeydownContext = (): {
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
    suspendGlobalKeybindDispatch: boolean
  } => {
    const keybinds = deps.getFaKeybindsStore()
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

  const createFaKeybindKeydownHandler = (getContext: () => {
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
    suspendGlobalKeybindDispatch: boolean
  }): (event: KeyboardEvent) => void => {
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

      const chord = deps.faKeybindEventToChord(event)
      if (chord === null) {
        return
      }

      deps.matchGlobalKeybindChordAndDispatch({
        chord,
        event,
        overrides: ctx.overrides,
        platform: ctx.platform
      })
    }
  }

  return {
    getFaKeybindKeydownContext,
    createFaKeybindKeydownHandler
  }
}
