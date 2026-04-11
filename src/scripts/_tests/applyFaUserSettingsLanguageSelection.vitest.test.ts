import { expect, test, vi } from 'vitest'

import { applyFaUserSettingsLanguageSelection } from '../applyFaUserSettingsLanguageSelection'

/**
 * applyFaUserSettingsLanguageSelection
 * Skips persistence when the code is unchanged.
 */
test('Test that applyFaUserSettingsLanguageSelection no-ops when language is already active', async () => {
  const updateSettings = vi.fn(async () => {
    // empty
  })

  await applyFaUserSettingsLanguageSelection(updateSettings, 'en-US', 'en-US')

  expect(updateSettings).not.toHaveBeenCalled()
})

/**
 * applyFaUserSettingsLanguageSelection
 * Delegates persistence to updateSettings when the code changes (locale switches inside the store before notify).
 */
test('Test that applyFaUserSettingsLanguageSelection calls updateSettings with the new language code', async () => {
  const updateSettings = vi.fn(async () => {
    // empty
  })

  await applyFaUserSettingsLanguageSelection(updateSettings, 'fr', 'en-US')

  expect(updateSettings).toHaveBeenCalledWith({ languageCode: 'fr' })
})
