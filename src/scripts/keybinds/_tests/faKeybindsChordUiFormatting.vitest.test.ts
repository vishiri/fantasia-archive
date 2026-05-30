import { afterEach, expect, test, vi } from 'vitest'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import * as faKeybindCommandDefinitions from '../functions/faKeybindCommandDefinitions'
import * as faKeybindsChordEqualityAndResolve from '../functions/faKeybindsChordEqualityAndResolve'
import { createFaKeybindsChordUiFormatting } from '../functions/createFaKeybindsChordUiFormatting'
import {
  formatFaKeybindChordForUi,
  formatFaKeybindCommandLabelFromSnapshot
} from '../faKeybindsChordUiFormatting_manager'
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
    commandId: 'openAppSettings',
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
    commandId: 'openAppSettings',
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
        openAppSettings: {
          code: 'KeyA',
          mods: ['ctrl']
        }
      }
    }
  }
  expect(formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'openAppSettings',
    snapshot
  })).toBe('Ctrl + A')
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Returns null when no command definition exists for the id.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot returns null without command definition', () => {
  const formatLabel = createFaKeybindsChordUiFormatting({
    faKeybindResolveEffectiveChord: faKeybindsChordEqualityAndResolve.faKeybindResolveEffectiveChord,
    findFaKeybindCommandDefinition: () => undefined,
    sortFaKeybindMods: faKeybindsChordEqualityAndResolve.sortFaKeybindMods
  }).formatFaKeybindCommandLabelFromSnapshot
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  expect(formatLabel({
    commandId: 'openAppSettings',
    snapshot
  })).toBeNull()
})

/**
 * formatFaKeybindCommandLabelFromSnapshot
 * Returns null when effective chord resolves to null.
 */
test('Test that formatFaKeybindCommandLabelFromSnapshot returns null when effective chord is null', () => {
  const formatLabel = createFaKeybindsChordUiFormatting({
    faKeybindResolveEffectiveChord: () => null,
    findFaKeybindCommandDefinition: faKeybindCommandDefinitions.findFaKeybindCommandDefinition,
    sortFaKeybindMods: faKeybindsChordEqualityAndResolve.sortFaKeybindMods
  }).formatFaKeybindCommandLabelFromSnapshot
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  expect(formatLabel({
    commandId: 'openAppSettings',
    snapshot
  })).toBeNull()
})
