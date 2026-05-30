import type {
  I_faChordSerialized,
  I_faKeybindCommandDefinition,
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'

export function createFaKeybindsGlobalDispatchMatch (deps: {
  commandDefinitions: readonly I_faKeybindCommandDefinition[]
  faKeybindChordsEqual: (
    a: I_faChordSerialized,
    b: I_faChordSerialized
  ) => boolean
  faKeybindIsEditableTarget: (target: EventTarget | null) => boolean
  faKeybindResolveEffectiveChord: (params: {
    commandId: T_faKeybindCommandId
    defaultChord: I_faKeybindCommandDefinition['defaultChord']
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }) => I_faChordSerialized | null
  faKeybindRunCommand: (id: T_faKeybindCommandId) => void
}): {
    matchGlobalKeybindChordAndDispatch: (params: {
      chord: I_faChordSerialized
      event: KeyboardEvent
      overrides: I_faKeybindsRoot['overrides']
      platform: NodeJS.Platform
    }) => T_faKeybindCommandId | null
  } {
  const matchGlobalKeybindChordAndDispatch = (params: {
    chord: I_faChordSerialized
    event: KeyboardEvent
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }): T_faKeybindCommandId | null => {
    const {
      chord,
      event,
      overrides,
      platform
    } = params

    for (const def of deps.commandDefinitions) {
      const effective = deps.faKeybindResolveEffectiveChord({
        commandId: def.id,
        defaultChord: def.defaultChord,
        overrides,
        platform
      })
      if (effective === null) {
        continue
      }
      if (!deps.faKeybindChordsEqual(chord, effective)) {
        continue
      }
      if (deps.faKeybindIsEditableTarget(event.target) && !def.firesInEditableFields) {
        continue
      }
      event.preventDefault()
      event.stopPropagation()
      deps.faKeybindRunCommand(def.id)
      return def.id
    }

    return null
  }

  return {
    matchGlobalKeybindChordAndDispatch
  }
}
