import {
  faKeybindMainKeyRequiresModifier,
  isFaKeybindBindableMainKeyCode,
  isFaKeybindModifierPhysicalCode
} from 'app/src/scripts/keybinds/faKeybindKeyCodeRules'
import { sortFaKeybindMods } from 'app/src/scripts/keybinds/faKeybindSortMods'
import type { T_faKeybindTryChordFromEventResult } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'

function isAltGraphActive (event: KeyboardEvent): boolean {
  return typeof event.getModifierState === 'function' && event.getModifierState('AltGraph')
}

/**
 * Classifies a keydown into a chord or a structured reject reason (capture UI).
 */
export function faKeybindTryChordFromEvent (event: KeyboardEvent): T_faKeybindTryChordFromEventResult {
  if (isFaKeybindModifierPhysicalCode(event.code)) {
    return {
      ok: false,
      reason: 'modifier_key_alone'
    }
  }

  if (!isFaKeybindBindableMainKeyCode(event.code)) {
    return {
      ok: false,
      reason: 'unsupported_key'
    }
  }

  const mods: T_faKeybindModifierLiteral[] = []
  const altGraph = isAltGraphActive(event)

  if (altGraph) {
    mods.push('alt')
  } else {
    if (event.altKey) {
      mods.push('alt')
    }
    if (event.ctrlKey) {
      mods.push('ctrl')
    }
  }

  if (event.metaKey) {
    mods.push('meta')
  }
  if (event.shiftKey) {
    mods.push('shift')
  }

  if (faKeybindMainKeyRequiresModifier(event.code) && mods.length === 0) {
    return {
      ok: false,
      reason: 'need_modifier'
    }
  }

  return {
    chord: {
      code: event.code,
      mods: sortFaKeybindMods(mods)
    },
    ok: true
  }
}
