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
