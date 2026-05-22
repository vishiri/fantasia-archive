import { expect, test } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'
import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
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
  const patchKeys = Object.keys(patch).sort()
  const managedKeys = (Object.keys(APP_SETTINGS_OPTIONS) as (keyof I_faUserSettings)[]).sort()

  expect(patchKeys).toEqual(managedKeys)

  for (const key of patchKeys) {
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
