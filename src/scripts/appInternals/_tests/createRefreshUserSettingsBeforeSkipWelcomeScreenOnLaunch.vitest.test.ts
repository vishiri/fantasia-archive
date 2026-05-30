import { expect, test, vi } from 'vitest'

import { createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch } from '../functions/createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch'

/**
 * createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch
 * Delegates to the injected refresh helper.
 */
test('Test that refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch calls refreshUserSettings', async () => {
  const refreshUserSettings = vi.fn(async () => undefined)
  const refresh = createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch({
    refreshUserSettings
  })

  await refresh()

  expect(refreshUserSettings).toHaveBeenCalledOnce()
})
