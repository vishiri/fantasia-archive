import type { I_faChordSerialized } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindModifierLiteral } from 'app/types/I_faKeybindsDomain'
import type { T_faKeybindTryChordFromEventResult } from 'app/types/I_faKeybindsDomain'

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

function isFaKeybindModifierPhysicalCode (code: string): boolean {
  return FA_KEYBIND_MODIFIER_PHYSICAL_CODES.has(code)
}

function isFaKeybindFKeyCode (code: string): boolean {
  return /^F([1-9]|1[0-9]|2[0-4])$/.test(code)
}

function isFaKeybindBindableMainKeyCode (code: string): boolean {
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

function faKeybindMainKeyRequiresModifier (code: string): boolean {
  return isFaKeybindBindableMainKeyCode(code) && !isFaKeybindFKeyCode(code)
}

function isAltGraphActive (event: KeyboardEvent): boolean {
  return typeof event.getModifierState === 'function' && event.getModifierState('AltGraph')
}

function faKeybindTryChordFromEventWithSort (
  event: KeyboardEvent,
  sortFaKeybindMods: (mods: T_faKeybindModifierLiteral[]) => T_faKeybindModifierLiteral[]
): T_faKeybindTryChordFromEventResult {
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

  const sortedMods = sortFaKeybindMods(mods)
  return {
    chord: {
      code: event.code,
      mods: sortedMods
    },
    ok: true
  }
}

export function createFaKeybindsChordFromEvent (deps: {
  sortFaKeybindMods: (mods: T_faKeybindModifierLiteral[]) => T_faKeybindModifierLiteral[]
}): {
    faKeybindEventToChord: (event: KeyboardEvent) => I_faChordSerialized | null
    faKeybindMainKeyRequiresModifier: (code: string) => boolean
    faKeybindTryChordFromEvent: (event: KeyboardEvent) => T_faKeybindTryChordFromEventResult
    isFaKeybindBindableMainKeyCode: (code: string) => boolean
    isFaKeybindModifierPhysicalCode: (code: string) => boolean
  } {
  const faKeybindTryChordFromEvent = (event: KeyboardEvent): T_faKeybindTryChordFromEventResult =>
    faKeybindTryChordFromEventWithSort(event, deps.sortFaKeybindMods)

  const faKeybindEventToChord = (event: KeyboardEvent): I_faChordSerialized | null => {
    const result = faKeybindTryChordFromEvent(event)
    return result.ok ? result.chord : null
  }

  return {
    faKeybindEventToChord,
    faKeybindMainKeyRequiresModifier,
    faKeybindTryChordFromEvent,
    isFaKeybindBindableMainKeyCode,
    isFaKeybindModifierPhysicalCode
  }
}
