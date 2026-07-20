import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectHierarchyTreeShowsOrderNumberBadge } from '../projectHierarchyTreeOrderNumberBadgeVisibility'

const hideTreeOrderNumbersDefaults = {
  hideTreeOrderNumbers: false
}

test('Test that resolveProjectHierarchyTreeShowsOrderNumberBadge defaults to visible badges', () => {
  expect(resolveProjectHierarchyTreeShowsOrderNumberBadge(null, null, hideTreeOrderNumbersDefaults)).toBe(true)
})

test('Test that resolveProjectHierarchyTreeShowsOrderNumberBadge hides when setting enabled', () => {
  const settings = {
    hideTreeOrderNumbers: true
  } satisfies Pick<I_faUserSettings, 'hideTreeOrderNumbers'>

  expect(resolveProjectHierarchyTreeShowsOrderNumberBadge(
    settings as I_faUserSettings,
    null,
    hideTreeOrderNumbersDefaults
  )).toBe(false)
})

test('Test that resolveProjectHierarchyTreeShowsOrderNumberBadge honors App Settings preview', () => {
  const settings = {
    hideTreeOrderNumbers: false
  } satisfies Pick<I_faUserSettings, 'hideTreeOrderNumbers'>

  expect(resolveProjectHierarchyTreeShowsOrderNumberBadge(settings as I_faUserSettings, {
    hideTreeOrderNumbers: true
  }, hideTreeOrderNumbersDefaults)).toBe(false)
})
