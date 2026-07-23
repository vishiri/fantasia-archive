import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveHideFantasiaMascot } from '../functions/resolveHideFantasiaMascot'

const baseSettings = {
  hidePlushes: false
} as I_faUserSettings

/**
 * resolveHideFantasiaMascot
 * Null settings and preview mean the mascot stays visible.
 */
test('Test that resolveHideFantasiaMascot is false when settings and preview are null', () => {
  expect(resolveHideFantasiaMascot(null, null)).toBe(false)
})

/**
 * resolveHideFantasiaMascot
 * Persisted hidePlushes hides the mascot when preview is absent.
 */
test('Test that resolveHideFantasiaMascot follows persisted hidePlushes', () => {
  expect(resolveHideFantasiaMascot({
    ...baseSettings,
    hidePlushes: true
  }, null)).toBe(true)
  expect(resolveHideFantasiaMascot({
    ...baseSettings,
    hidePlushes: false
  }, null)).toBe(false)
})

/**
 * resolveHideFantasiaMascot
 * App Settings dialog preview overrides persisted hidePlushes.
 */
test('Test that resolveHideFantasiaMascot prefers app settings dialog preview', () => {
  expect(resolveHideFantasiaMascot(
    {
      ...baseSettings,
      hidePlushes: false
    },
    {
      hidePlushes: true
    }
  )).toBe(true)
  expect(resolveHideFantasiaMascot(
    {
      ...baseSettings,
      hidePlushes: true
    },
    {
      hidePlushes: false
    }
  )).toBe(false)
})
