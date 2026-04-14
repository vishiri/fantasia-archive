import type { I_faChordDefault } from 'app/types/I_faKeybindsDomain'
import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'

import { faKeybindExpandDefaultChord } from 'app/src/scripts/keybinds/faKeybindExpandDefaultChord'

/**
 * User override wins; null override clears to default; missing uses default.
 */
export function faKeybindResolveEffectiveChord (params: {
  commandId: T_faKeybindCommandId
  defaultChord: I_faChordDefault | null
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
}): I_faChordSerialized | null {
  const {
    commandId,
    defaultChord,
    overrides,
    platform
  } = params
  const o = overrides[commandId]
  if (o === null) {
    return faKeybindExpandDefaultChord(defaultChord, platform)
  }
  if (o !== undefined) {
    return o
  }
  return faKeybindExpandDefaultChord(defaultChord, platform)
}
