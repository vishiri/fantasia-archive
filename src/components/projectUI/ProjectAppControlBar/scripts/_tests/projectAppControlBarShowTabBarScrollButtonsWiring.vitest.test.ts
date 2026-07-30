import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectAppControlBarShowTabBarScrollButtons } from '../projectAppControlBarShowTabBarScrollButtonsWiring'

test('Test that resolveProjectAppControlBarShowTabBarScrollButtons delegates with defaults', () => {
  const settings = {
    showTabBarScrollButtons: true
  } satisfies Pick<I_faUserSettings, 'showTabBarScrollButtons'>

  expect(
    resolveProjectAppControlBarShowTabBarScrollButtons(settings as I_faUserSettings, null)
  ).toBe(true)
})
