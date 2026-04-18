import { afterEach, expect, test, vi } from 'vitest'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import * as faKeybindCommandDefinitions from 'app/src/scripts/keybinds/faKeybindCommandDefinitions'
import * as faKeybindsChordEqualityAndResolve from 'app/src/scripts/keybinds/faKeybindsChordEqualityAndResolve'
import {
  formatFaKeybindChordForUi,
  formatFaKeybindCommandLabelFromSnapshot
} from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

afterEach(() => {
  vi.restoreAllMocks()
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Returns null when snapshot or command id is missing.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot returns null without snapshot or command id', () => {
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: undefined,
    snapshot: {
      platform: 'win32',
      store: { ...FA_KEYBINDS_STORE_DEFAULTS }
    }
  })).toBeNull()
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot: null
  })).toBeNull()
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Resolves default chord when overrides are empty.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot uses effective chord from snapshot', () => {
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  const label = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot
  })
  expect(label).toBe(formatFaKeybindChordForUi({
    code: 'KeyL',
    mods: [
      'alt',
      'ctrl',
      'shift'
    ]
  }, 'win32'))
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * User override replaces default label text.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot reflects overrides', () => {
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: {
      ...FA_KEYBINDS_STORE_DEFAULTS,
      overrides: {
        openProgramSettings: {
          code: 'KeyA',
          mods: ['ctrl']
        }
      }
    }
  }
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot
  })).toBe('Ctrl + A')
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Returns null when no command definition exists for the id.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot returns null without command definition', () => {
  vi.spyOn(faKeybindCommandDefinitions, 'findFaKeybindCommandDefinition').mockReturnValue(undefined)
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot
  })).toBeNull()
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Returns null when effective chord resolves to null.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot returns null when effective chord is null', () => {
  vi.spyOn(faKeybindsChordEqualityAndResolve, 'faKeybindResolveEffectiveChord').mockReturnValue(null)
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openProgramSettings',
    snapshot
  })).toBeNull()
})
