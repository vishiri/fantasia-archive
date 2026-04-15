import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindTryChordFromEventResult } from 'app/types/I_faKeybindsDomain'

import { sortFaKeybindMods } from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'

/**
 * Physical keys that are only modifiers — never valid as the main key in a chord.
 * Using event.code here avoids showing duplicate labels such as Shift plus ShiftLeft.
 */
const FA_KEYBIND_MODIFIER_PHYSICAL_CODES = new Set<string>([
  'AltGraph',
  'AltLeft',
  'AltRight',
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
  'ShiftLeft',
  'ShiftRight'
])

/**
 * Typing-region punctuation, arrow keys, and symbol keys allowed for shortcuts (KeyboardEvent.code values).
 * Alnum and F-keys are matched by pattern in isFaKeybindBindableMainKeyCode.
 */
const FA_KEYBIND_BINDABLE_EXTRA_CODES = new Set<string>([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Backquote',
  'Backslash',
  'BracketLeft',
  'BracketRight',
  'Comma',
  'Equal',
  'IntlBackslash',
  'Minus',
  'Period',
  'Quote',
  'Semicolon',
  'Slash'
])

/**
 * True when code is a left/right modifier key (ShiftLeft, ControlRight, …).
 */
export function isFaKeybindModifierPhysicalCode (code: string): boolean {
  return FA_KEYBIND_MODIFIER_PHYSICAL_CODES.has(code)
}

function isFaKeybindFKeyCode (code: string): boolean {
  return /^F([1-9]|1[0-9]|2[0-4])$/.test(code)
}

/**
 * Allowed main keys: A–Z, 0–9, F1–F24, the four arrow keys, and a fixed set of punctuation codes (comma, brackets, etc.).
 * Not numpad-only codes, media keys, or other special keys.
 */
export function isFaKeybindBindableMainKeyCode (code: string): boolean {
  if (/^Key[A-Z]$/.test(code)) {
    return true
  }
  if (/^Digit[0-9]$/.test(code)) {
    return true
  }
  if (isFaKeybindFKeyCode(code)) {
    return true
  }
  return FA_KEYBIND_BINDABLE_EXTRA_CODES.has(code)
}

/**
 * F-keys may be used without other modifiers; other bindable keys require at least one modifier.
 */
export function faKeybindMainKeyRequiresModifier (code: string): boolean {
  return isFaKeybindBindableMainKeyCode(code) && !isFaKeybindFKeyCode(code)
}

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

/**
 * Builds a serialized chord from a keydown event (physical 'code', literal modifiers).
 * Returns null when the key is not bindable or the combo is incomplete (same rules as capture UI).
 */
export function faKeybindEventToChord (event: KeyboardEvent): I_faChordSerialized | null {
  const result = faKeybindTryChordFromEvent(event)
  return result.ok ? result.chord : null
}
