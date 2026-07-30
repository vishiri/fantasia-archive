import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectAppControlBarHideTabCloseButton } from '../resolveProjectAppControlBarHideTabCloseButton'

const hideTabCloseButtonDefaults = {
  hideTabCloseButton: false
} satisfies Pick<I_faUserSettings, 'hideTabCloseButton'>

test('Test that resolveProjectAppControlBarHideTabCloseButton uses defaults when settings are null', () => {
  expect(
    resolveProjectAppControlBarHideTabCloseButton(null, null, hideTabCloseButtonDefaults)
  ).toBe(false)
})

test('Test that resolveProjectAppControlBarHideTabCloseButton reads settings when preview is null', () => {
  const settings = {
    hideTabCloseButton: true
  } satisfies Pick<I_faUserSettings, 'hideTabCloseButton'>

  expect(
    resolveProjectAppControlBarHideTabCloseButton(
      settings as I_faUserSettings,
      null,
      hideTabCloseButtonDefaults
    )
  ).toBe(true)
})

test('Test that resolveProjectAppControlBarHideTabCloseButton prefers preview over settings', () => {
  const settings = {
    hideTabCloseButton: false
  } satisfies Pick<I_faUserSettings, 'hideTabCloseButton'>

  expect(
    resolveProjectAppControlBarHideTabCloseButton(
      settings as I_faUserSettings,
      {
        hideTabCloseButton: true
      },
      hideTabCloseButtonDefaults
    )
  ).toBe(true)
})
