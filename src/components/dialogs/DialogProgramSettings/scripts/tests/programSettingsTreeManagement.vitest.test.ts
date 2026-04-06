import { expect, test } from 'vitest'

import type { I_programSettingRenderItem } from 'app/src/components/dialogs/DialogProgramSettings/DialogProgramSettings.types'
import {
  compareProgramSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle
} from 'app/src/components/dialogs/DialogProgramSettings/scripts/programSettingsTreeManagement'

const stubSetting = (title: string): I_programSettingRenderItem => ({
  description: '',
  tags: '',
  title,
  value: false
})

/**
 * compareProgramSettingsCategoryOrder
 * Puts 'developerSettings' last and 'accessibility' immediately before it; others sort alphabetically among themselves.
 */
test('Test that compareProgramSettingsCategoryOrder orders accessibility before developer and both after ordinary keys', () => {
  const keys = ['developerSettings', 'documentViewEdit', 'accessibility', 'hierarchicalTree']

  const ordered = [...keys].sort(compareProgramSettingsCategoryOrder)

  expect(ordered).toEqual([
    'documentViewEdit',
    'hierarchicalTree',
    'accessibility',
    'developerSettings'
  ])
})

/**
 * sortSettingsListByTranslatedTitle
 * Orders entries by title using case-insensitive collation, then by setting key when titles match.
 */
test('Test that sortSettingsListByTranslatedTitle orders by translated title then key', () => {
  const input: Record<string, I_programSettingRenderItem> = {
    noProjectName: stubSetting('Hide project name in tree'),
    doNotcollaseTreeOptions: stubSetting('Prevent sublevel collapse in the tree'),
    invertTreeSorting: stubSetting('Invert tree custom order sorting')
  }

  const orderedKeys = Object.keys(sortSettingsListByTranslatedTitle(input))

  expect(orderedKeys).toEqual([
    'noProjectName',
    'invertTreeSorting',
    'doNotcollaseTreeOptions'
  ])
})

/**
 * sortSettingsListByTranslatedTitle
 * Uses setting key order when two items share the same title string.
 */
test('Test that sortSettingsListByTranslatedTitle breaks title ties by setting key', () => {
  const input: Record<string, I_programSettingRenderItem> = {
    zKey: stubSetting('Same'),
    aKey: stubSetting('Same')
  }

  const orderedKeys = Object.keys(sortSettingsListByTranslatedTitle(input))

  expect(orderedKeys).toEqual(['aKey', 'zKey'])
})
