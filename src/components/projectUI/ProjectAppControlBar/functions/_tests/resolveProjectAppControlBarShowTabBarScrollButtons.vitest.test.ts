import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectAppControlBarShowTabBarScrollButtons } from '../resolveProjectAppControlBarShowTabBarScrollButtons'

const showTabBarScrollButtonsDefaults = {
  showTabBarScrollButtons: false
} satisfies Pick<I_faUserSettings, 'showTabBarScrollButtons'>

test('Test that resolveProjectAppControlBarShowTabBarScrollButtons uses defaults when settings are null', () => {
  expect(
    resolveProjectAppControlBarShowTabBarScrollButtons(null, null, showTabBarScrollButtonsDefaults)
  ).toBe(false)
})

test('Test that resolveProjectAppControlBarShowTabBarScrollButtons reads settings when preview is null', () => {
  const settings = {
    showTabBarScrollButtons: true
  } satisfies Pick<I_faUserSettings, 'showTabBarScrollButtons'>

  expect(
    resolveProjectAppControlBarShowTabBarScrollButtons(
      settings as I_faUserSettings,
      null,
      showTabBarScrollButtonsDefaults
    )
  ).toBe(true)
})

test('Test that resolveProjectAppControlBarShowTabBarScrollButtons prefers preview over settings', () => {
  const settings = {
    showTabBarScrollButtons: false
  } satisfies Pick<I_faUserSettings, 'showTabBarScrollButtons'>

  expect(
    resolveProjectAppControlBarShowTabBarScrollButtons(
      settings as I_faUserSettings,
      {
        showTabBarScrollButtons: true
      },
      showTabBarScrollButtonsDefaults
    )
  ).toBe(true)
})
