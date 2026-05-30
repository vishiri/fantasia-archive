import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindCommandDefinition } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

export function createFaKeybindFindChordConflict (deps: {
  commandDefinitions: readonly I_faKeybindCommandDefinition[]
  faKeybindChordsEqual: (
    a: I_faChordSerialized,
    b: I_faChordSerialized
  ) => boolean
  faKeybindResolveEffectiveChord: (params: {
    commandId: T_faKeybindCommandId
    defaultChord: I_faKeybindCommandDefinition['defaultChord']
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }) => I_faChordSerialized | null
}): {
    faKeybindFindChordConflict: (params: {
      chord: I_faChordSerialized
      excludeCommandId: T_faKeybindCommandId
      overrides: I_faKeybindsRoot['overrides']
      platform: NodeJS.Platform
    }) => T_faKeybindCommandId | null
  } {
  const faKeybindFindChordConflict = (params: {
    chord: I_faChordSerialized
    excludeCommandId: T_faKeybindCommandId
    overrides: I_faKeybindsRoot['overrides']
    platform: NodeJS.Platform
  }): T_faKeybindCommandId | null => {
    const {
      chord,
      excludeCommandId,
      overrides,
      platform
    } = params

    for (const def of deps.commandDefinitions) {
      if (def.id === excludeCommandId) {
        continue
      }
      const effective = deps.faKeybindResolveEffectiveChord({
        commandId: def.id,
        defaultChord: def.defaultChord,
        overrides,
        platform
      })
      if (effective === null) {
        continue
      }
      if (deps.faKeybindChordsEqual(chord, effective)) {
        return def.id
      }
    }

    return null
  }

  return {
    faKeybindFindChordConflict
  }
}
