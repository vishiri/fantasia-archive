import { expect, test } from 'vitest'

import {
  faKeybindMainKeyRequiresModifier,
  isFaKeybindBindableMainKeyCode,
  isFaKeybindModifierPhysicalCode
} from 'app/src/scripts/keybinds/faKeybindsChordFromEvent'

test('isFaKeybindModifierPhysicalCode recognizes left/right modifier codes', () => {
  expect(isFaKeybindModifierPhysicalCode('ShiftLeft')).toBe(true)
  expect(isFaKeybindModifierPhysicalCode('ControlRight')).toBe(true)
  expect(isFaKeybindModifierPhysicalCode('AltGraph')).toBe(true)
  expect(isFaKeybindModifierPhysicalCode('KeyA')).toBe(false)
})

test('isFaKeybindBindableMainKeyCode allows alnum, F-keys, arrows, and typing punctuation codes', () => {
  expect(isFaKeybindBindableMainKeyCode('KeyZ')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('Digit7')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('F12')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('Comma')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('BracketLeft')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('ArrowLeft')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('ArrowUp')).toBe(true)
  expect(isFaKeybindBindableMainKeyCode('Numpad1')).toBe(false)
  expect(isFaKeybindBindableMainKeyCode('Escape')).toBe(false)
})

test('faKeybindMainKeyRequiresModifier is false only for F-keys among bindable keys', () => {
  expect(faKeybindMainKeyRequiresModifier('F5')).toBe(false)
  expect(faKeybindMainKeyRequiresModifier('KeyA')).toBe(true)
  expect(faKeybindMainKeyRequiresModifier('Comma')).toBe(true)
  expect(faKeybindMainKeyRequiresModifier('ArrowDown')).toBe(true)
})
