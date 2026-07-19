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
import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import {
  buildAppSettingsRenderTree,
  compareAppSettingsCategoryOrder,
  sortSettingsListByTranslatedTitle,
  toSortedRecord
} from 'app/src/components/dialogs/DialogAppSettings/scripts/functions/dialogAppSettingsTreeBuild'

const appSettingsCategoryTitleByKey: Record<string, string> = {
  accessibility: 'Accessibility',
  developerSettings: 'Developer settings',
  documentViewEdit: 'Document view/edit',
  hierarchicalTree: 'Hierarchical tree',
  openedDocumentsTabs: 'Open document tabs',
  popupsFloatingWindows: 'Popups & floating windows',
  projectOverview: 'Page: Project overview',
  visualAccessibility: 'Visuals & app-wide functionality',
  welcomeScreen: 'Page: Welcome Screen'
}

const dialogAppSettingsTreeTranslate = {
  t: (key: string): string => {
    if (key === 'dialogs.appSettings.appOptions.darkMode.note') {
      return 'Fixture note'
    }
    const categoryTitleMatch = /^dialogs\.appSettings\.appOptionsCategories\.([^.]+)\.title$/.exec(key)
    if (categoryTitleMatch !== null) {
      const categoryKey = categoryTitleMatch[1]!
      return appSettingsCategoryTitleByKey[categoryKey] ?? key
    }
    return key
  },
  te: (key: string): boolean => key === 'dialogs.appSettings.appOptions.darkMode.note'
}

function buildAppSettingsRenderTreeForTest (settingsSnapshot: I_faUserSettings) {
  return buildAppSettingsRenderTree(
    dialogAppSettingsTreeTranslate,
    APP_SETTINGS_OPTIONS,
    settingsSnapshot
  )
}

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
 * When category titles are empty, sort labels fall back to category keys.
 */
test('Test that compareAppSettingsCategoryOrder sorts by category key when titles are empty', () => {
  expect(compareAppSettingsCategoryOrder('beta', 'alpha', '', '')).toBeGreaterThan(0)
  expect(compareAppSettingsCategoryOrder('alpha', 'beta', '', '')).toBeLessThan(0)
})

/**
 * compareAppSettingsCategoryOrder
 * Puts Page categories first, then other categories alphabetically by title, then accessibility, then developerSettings.
 */
test('Test that compareAppSettingsCategoryOrder orders page categories first then ordinary accessibility and developer last', () => {
  const keys = [
    'developerSettings',
    'documentViewEdit',
    'accessibility',
    'hierarchicalTree',
    'projectOverview',
    'welcomeScreen'
  ]

  const titleByKey: Record<string, string> = {
    accessibility: 'Accessibility',
    developerSettings: 'Developer settings',
    documentViewEdit: 'Document view/edit',
    hierarchicalTree: 'Hierarchical tree',
    projectOverview: 'Page: Project overview',
    welcomeScreen: 'Page: Welcome Screen'
  }

  const ordered = [...keys].sort((keyA, keyB) =>
    compareAppSettingsCategoryOrder(keyA, keyB, titleByKey[keyA], titleByKey[keyB])
  )

  expect(ordered).toEqual([
    'projectOverview',
    'welcomeScreen',
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
    invertCategoryPosition: stubSetting('Invert category position')
  }

  const orderedKeys = Object.keys(sortSettingsListByTranslatedTitle(input))

  expect(orderedKeys).toEqual([
    'noProjectName',
    'invertCategoryPosition',
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
 * Category tabs: Page categories first, ordinary keys alphabetically, accessibility, then developerSettings.
 */
test('Test that buildAppSettingsRenderTree orders page categories first and pins accessibility then developerSettings at the end', () => {
  const tree = buildAppSettingsRenderTreeForTest({
    ...FA_USER_SETTINGS_DEFAULTS
  })
  const keys = Object.keys(tree)

  expect(keys.slice(0, 2)).toEqual([
    'projectOverview',
    'welcomeScreen'
  ])
  expect(keys[keys.length - 1]).toBe('developerSettings')
  expect(keys[keys.length - 2]).toBe('accessibility')
})

/**
 * buildAppSettingsRenderTree
 * Copies each boolean from the snapshot into the matching leaf in the render tree.
 */
test('Test that buildAppSettingsRenderTree maps showDocumentID into developer document body', () => {
  const tree = buildAppSettingsRenderTreeForTest({
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
  const tree = buildAppSettingsRenderTreeForTest({
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

  const tree = buildAppSettingsRenderTreeForTest(partial as I_faUserSettings)
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
  expect(buildAppSettingsRenderTreeForTest({} as I_faUserSettings)).toEqual({})
})

/**
 * buildAppSettingsRenderTree
 * Omits languageCode because it is not listed in APP_SETTINGS_OPTIONS.
 */
test('Test that buildAppSettingsRenderTree ignores languageCode-only snapshots', () => {
  expect(
    buildAppSettingsRenderTreeForTest({
      languageCode: 'fr'
    } as I_faUserSettings)
  ).toEqual({})
})
