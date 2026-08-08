import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectHierarchyTreeUsesExtraTreePadding } from '../projectHierarchyTreeExtraTreePadding'

const extraTreePaddingDefaults = {
  extraTreePadding: false
}

test('Test that resolveProjectHierarchyTreeUsesExtraTreePadding defaults to false', () => {
  expect(resolveProjectHierarchyTreeUsesExtraTreePadding(null, null, extraTreePaddingDefaults)).toBe(false)
})

test('Test that resolveProjectHierarchyTreeUsesExtraTreePadding reads settings', () => {
  const settings = {
    extraTreePadding: true
  } satisfies Pick<I_faUserSettings, 'extraTreePadding'>

  expect(resolveProjectHierarchyTreeUsesExtraTreePadding(settings as I_faUserSettings, null, extraTreePaddingDefaults)).toBe(true)
})

test('Test that resolveProjectHierarchyTreeUsesExtraTreePadding prefers preview over settings', () => {
  const settings = {
    extraTreePadding: false
  } satisfies Pick<I_faUserSettings, 'extraTreePadding'>
  const preview = {
    extraTreePadding: true
  }

  expect(resolveProjectHierarchyTreeUsesExtraTreePadding(
    settings as I_faUserSettings,
    preview,
    extraTreePaddingDefaults
  )).toBe(true)
})
