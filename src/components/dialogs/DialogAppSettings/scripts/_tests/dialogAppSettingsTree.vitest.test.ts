import { expect, test, vi } from 'vitest'

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => {
          if (key === 'dialogs.appSettings.appOptions.darkMode.note') {
            return 'Fixture note'
          }
          return key
        },
        te: (key: string) => key === 'dialogs.appSettings.appOptions.darkMode.note'
      }
    }
  }
})

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_appSettingsSettingRenderItem } from 'app/types/I_dialogAppSettings'
import {
  buildAppSettingsRenderTree,
  compareAppSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettingsTree'

const stubSetting = (title: string): I_appSettingsSettingRenderItem => ({
  description: '',
  tags: '',
  title,
  value: false
})

/**
 * compareAppSettingsCategoryOrder
 * Identical category keys compare equal so stable sorts do not reorder ties.
 */
test('Test that compareAppSettingsCategoryOrder returns zero for the same category key twice', () => {
  expect(compareAppSettingsCategoryOrder('hierarchicalTree', 'hierarchicalTree')).toBe(0)
})

/**
 * compareAppSettingsCategoryOrder
 * Puts 'developerSettings' last and 'accessibility' immediately before it; others sort alphabetically among themselves.
 */
test('Test that compareAppSettingsCategoryOrder orders accessibility before developer and both after ordinary keys', () => {
  const keys = ['developerSettings', 'documentViewEdit', 'accessibility', 'hierarchicalTree']

  const ordered = [...keys].sort(compareAppSettingsCategoryOrder)

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
  const input: Record<string, I_appSettingsSettingRenderItem> = {
    noProjectName: stubSetting('Hide project name in tree'),
    doNotCollapseTreeOptions: stubSetting('Prevent sublevel collapse in the tree'),
    invertTreeSorting: stubSetting('Invert tree custom order sorting')
  }

  const orderedKeys = Object.keys(sortSettingsListByTranslatedTitle(input))

  expect(orderedKeys).toEqual([
    'noProjectName',
    'invertTreeSorting',
    'doNotCollapseTreeOptions'
  ])
})

/**
 * sortSettingsListByTranslatedTitle
 * Uses setting key order when two items share the same title string.
 */
test('Test that sortSettingsListByTranslatedTitle breaks title ties by setting key', () => {
  const input: Record<string, I_appSettingsSettingRenderItem> = {
    zKey: stubSetting('Same'),
    aKey: stubSetting('Same')
  }

  const orderedKeys = Object.keys(sortSettingsListByTranslatedTitle(input))

  expect(orderedKeys).toEqual(['aKey', 'zKey'])
})

/**
 * toSortedRecord
 * Rebuilds a record with keys in Unicode collation order.
 */
test('Test that toSortedRecord returns entries sorted by key', () => {
  const out = toSortedRecord({
    z: 1,
    m: 2,
    a: 3
  })

  expect(Object.keys(out)).toEqual([
    'a',
    'm',
    'z'
  ])
  expect(out).toEqual({
    a: 3,
    m: 2,
    z: 1
  })
})

/**
 * toSortedRecord
 * Empty input should yield an empty record without throwing.
 */
test('Test that toSortedRecord returns empty object for empty input', () => {
  expect(toSortedRecord({})).toEqual({})
})

/**
 * buildAppSettingsRenderTree
 * Category tabs end with accessibility then developerSettings after ordinary keys.
 */
test('Test that buildAppSettingsRenderTree orders accessibility before developerSettings at the end', () => {
  const tree = buildAppSettingsRenderTree({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const keys = Object.keys(tree)

  expect(keys[keys.length - 1]).toBe('developerSettings')
  expect(keys[keys.length - 2]).toBe('accessibility')
})

/**
 * buildAppSettingsRenderTree
 * Copies each boolean from the snapshot into the matching leaf in the render tree.
 */
test('Test that buildAppSettingsRenderTree maps showDocumentID into developer document body', () => {
  const tree = buildAppSettingsRenderTree({
    ...FA_USER_SETTINGS_DEFAULTS,
    showDocumentID: true
  })

  expect(
    tree.developerSettings?.subCategories.documentBody?.settingsList.showDocumentID?.value
  ).toBe(true)
})

/**
 * buildAppSettingsRenderTree
 * When a translation exists for the optional note path, the leaf includes a note field.
 */
test('Test that buildAppSettingsRenderTree attaches note text when i18n te reports the note key exists', () => {
  const tree = buildAppSettingsRenderTree({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  })

  expect(
    tree.visualAccessibility?.subCategories.visualsAppwideFunctionality?.settingsList.darkMode?.note
  ).toBe('Fixture note')
})

/**
 * buildAppSettingsRenderTree
 * Second and later settings that share the same category and subcategory reuse existing tree nodes instead of recreating them.
 */
test('Test that buildAppSettingsRenderTree hits reuse branches when two settings share category and subcategory', () => {
  const partial: Pick<I_faUserSettings, 'darkMode' | 'disableSpellCheck'> = {
    darkMode: false,
    disableSpellCheck: true
  }

  const tree = buildAppSettingsRenderTree(partial as I_faUserSettings)
  const list =
    tree.visualAccessibility?.subCategories.visualsAppwideFunctionality?.settingsList

  expect(list?.darkMode?.value).toBe(false)
  expect(list?.disableSpellCheck?.value).toBe(true)
})

/**
 * buildAppSettingsRenderTree
 * Empty snapshots skip both build passes and return an empty render tree object.
 */
test('Test that buildAppSettingsRenderTree returns an empty object when the settings snapshot has no keys', () => {
  expect(buildAppSettingsRenderTree({} as I_faUserSettings)).toEqual({})
})

/**
 * buildAppSettingsRenderTree
 * Omits languageCode because it is not listed in APP_SETTINGS_OPTIONS.
 */
test('Test that buildAppSettingsRenderTree ignores languageCode-only snapshots', () => {
  expect(
    buildAppSettingsRenderTree({
      languageCode: 'fr'
    } as I_faUserSettings)
  ).toEqual({})
})
