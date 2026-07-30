import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectAppControlBarHideTabCloseButton } from '../projectAppControlBarHideTabCloseButtonWiring'

test('Test that resolveProjectAppControlBarHideTabCloseButton delegates with defaults', () => {
  const settings = {
    hideTabCloseButton: true
  } satisfies Pick<I_faUserSettings, 'hideTabCloseButton'>

  expect(
    resolveProjectAppControlBarHideTabCloseButton(settings as I_faUserSettings, null)
  ).toBe(true)
})
