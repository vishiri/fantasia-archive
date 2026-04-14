import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'

import { faKeybindTryChordFromEvent } from 'app/src/scripts/keybinds/faKeybindTryChordFromEvent'

/**
 * Builds a serialized chord from a keydown event (physical 'code', literal modifiers).
 * Returns null when the key is not bindable or the combo is incomplete (same rules as capture UI).
 */
export function faKeybindEventToChord (event: KeyboardEvent): I_faChordSerialized | null {
  const result = faKeybindTryChordFromEvent(event)
  return result.ok ? result.chord : null
}
