import { expect, test } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import {
  applyAppSettingsStorybookDisplayTitlesPatch,
  buildAppSettingsStorybookAppOptionsTitlePatch,
  stripTodoPrefixFromAppSettingsOptionTitle
} from './appSettingsStorybookLocalePatch'

test('stripTodoPrefixFromAppSettingsOptionTitle removes leading TODO dash prefix', () => {
  expect(stripTodoPrefixFromAppSettingsOptionTitle('TODO  - Dark mode')).toBe('Dark mode')
  expect(stripTodoPrefixFromAppSettingsOptionTitle('todo - Dark mode')).toBe('Dark mode')
  expect(stripTodoPrefixFromAppSettingsOptionTitle('Plain title')).toBe('Plain title')
})

test('buildAppSettingsStorybookAppOptionsTitlePatch covers every persisted app settings key', () => {
  const patch = buildAppSettingsStorybookAppOptionsTitlePatch()
  const keys = Object.keys(patch).sort() as (keyof I_faUserSettings)[]

  expect(keys.length).toBe(43)

  for (const key of keys) {
    expect(patch[key].title).not.toMatch(/^\s*TODO\s*-/i)
  }
})

test('applyAppSettingsStorybookDisplayTitlesPatch forwards a dialogs.appSettings merge payload', () => {
  applyAppSettingsStorybookDisplayTitlesPatch()

  expect(i18n.global.mergeLocaleMessage).toHaveBeenCalledWith(
    'en-US',
    expect.objectContaining({
      dialogs: expect.objectContaining({
        appSettings: expect.objectContaining({
          appOptions: expect.any(Object)
        })
      })
    })
  )
})
