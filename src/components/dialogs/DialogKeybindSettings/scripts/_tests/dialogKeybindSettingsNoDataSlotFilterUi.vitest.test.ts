import { expect, test } from 'vitest'

import { dialogKeybindSettingsNoDataSlotShowsFilterError } from '../functions/dialogKeybindSettingsNoDataSlotFilterUi'

test('Test dialogKeybindSettingsNoDataSlotShowsFilterError is false for null undefined empty and whitespace-only', () => {
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError(null)).toBe(false)
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError(undefined)).toBe(false)
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError('')).toBe(false)
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError('   ')).toBe(false)
})

test('Test dialogKeybindSettingsNoDataSlotShowsFilterError is true when trimmed filter is non-empty', () => {
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError(' a ')).toBe(true)
  expect(dialogKeybindSettingsNoDataSlotShowsFilterError('x')).toBe(true)
})
