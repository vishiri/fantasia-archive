import { expect, test } from 'vitest'

import { i18n } from 'app/i18n/externalFileLoader'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'
import {
  applyProgramSettingsStorybookDisplayTitlesPatch,
  buildProgramSettingsStorybookAppOptionsTitlePatch,
  stripTodoPrefixFromProgramSettingTitle
} from './programSettingsStorybookLocalePatch'

test('stripTodoPrefixFromProgramSettingTitle removes leading TODO dash prefix', () => {
  expect(stripTodoPrefixFromProgramSettingTitle('TODO  - Dark mode')).toBe('Dark mode')
  expect(stripTodoPrefixFromProgramSettingTitle('todo - Dark mode')).toBe('Dark mode')
  expect(stripTodoPrefixFromProgramSettingTitle('Plain title')).toBe('Plain title')
})

test('buildProgramSettingsStorybookAppOptionsTitlePatch covers every persisted program setting key', () => {
  const patch = buildProgramSettingsStorybookAppOptionsTitlePatch()
  const keys = Object.keys(patch).sort() as (keyof I_faUserSettings)[]

  expect(keys.length).toBe(43)

  for (const key of keys) {
    expect(patch[key].title).not.toMatch(/^\s*TODO\s*-/i)
  }
})

test('applyProgramSettingsStorybookDisplayTitlesPatch forwards a dialogs.programSettings merge payload', () => {
  applyProgramSettingsStorybookDisplayTitlesPatch()

  expect(i18n.global.mergeLocaleMessage).toHaveBeenCalledWith(
    'en-US',
    expect.objectContaining({
      dialogs: expect.objectContaining({
        programSettings: expect.objectContaining({
          appOptions: expect.any(Object)
        })
      })
    })
  )
})
