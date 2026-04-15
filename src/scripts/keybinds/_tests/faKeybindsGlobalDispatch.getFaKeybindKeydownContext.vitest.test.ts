import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { getFaKeybindKeydownContext } from 'app/src/scripts/keybinds/faKeybindsGlobalDispatch'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'

beforeEach(() => {
  setActivePinia(createPinia())
})

/**
 * getFaKeybindKeydownContext
 * Uses default snapshot shape when Pinia has not loaded keybinds yet.
 */
test('Test that getFaKeybindKeydownContext falls back when snapshot is missing', () => {
  const ctx = getFaKeybindKeydownContext()
  expect(ctx.overrides).toEqual({})
  expect(ctx.platform).toBe('win32')
  expect(ctx.suspendGlobalKeybindDispatch).toBe(false)
})

/**
 * getFaKeybindKeydownContext
 * Reads live snapshot platform and suspend flag from S_FaKeybinds.
 */
test('Test that getFaKeybindKeydownContext reads snapshot and suspend flag from Pinia', () => {
  const store = S_FaKeybinds()
  store.snapshot = {
    platform: 'linux',
    store: {
      overrides: {},
      schemaVersion: 1
    }
  }
  store.setSuspendGlobalKeybindDispatch(true)
  const ctx = getFaKeybindKeydownContext()
  expect(ctx.platform).toBe('linux')
  expect(ctx.suspendGlobalKeybindDispatch).toBe(true)
})
