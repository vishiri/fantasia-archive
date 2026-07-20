import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'

import { resolveMainLayoutHideHierarchyTree } from '../functions/resolveMainLayoutHideHierarchyTree'

test('Test that resolveMainLayoutHideHierarchyTree returns false when settings are null', () => {
  expect(resolveMainLayoutHideHierarchyTree(null, null, FA_USER_SETTINGS_DEFAULTS)).toBe(false)
})

test('Test that resolveMainLayoutHideHierarchyTree reads persisted hideHierarchyTree', () => {
  const settings = {
    hideHierarchyTree: true
  } satisfies Pick<I_faUserSettings, 'hideHierarchyTree'>

  expect(
    resolveMainLayoutHideHierarchyTree(settings as I_faUserSettings, null, FA_USER_SETTINGS_DEFAULTS)
  ).toBe(true)
})

test('Test that resolveMainLayoutHideHierarchyTree prefers app settings preview', () => {
  const settings = {
    hideHierarchyTree: false
  } satisfies Pick<I_faUserSettings, 'hideHierarchyTree'>

  expect(
    resolveMainLayoutHideHierarchyTree(settings as I_faUserSettings, {
      hideHierarchyTree: true
    }, FA_USER_SETTINGS_DEFAULTS)
  ).toBe(true)
})
