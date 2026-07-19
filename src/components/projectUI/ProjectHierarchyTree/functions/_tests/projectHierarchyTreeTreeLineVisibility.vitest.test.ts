import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectHierarchyTreeShowsTreeLines } from '../projectHierarchyTreeTreeLineVisibility'

const hideTreeLinesDefaults = {
  hideTreeLines: false
}

test('resolveProjectHierarchyTreeShowsTreeLines defaults to visible lines', () => {
  expect(resolveProjectHierarchyTreeShowsTreeLines(null, null, hideTreeLinesDefaults)).toBe(true)
})

test('resolveProjectHierarchyTreeShowsTreeLines hides lines when persisted setting is on', () => {
  const settings = {
    hideTreeLines: true
  } satisfies Pick<I_faUserSettings, 'hideTreeLines'>

  expect(resolveProjectHierarchyTreeShowsTreeLines(settings as I_faUserSettings, null, hideTreeLinesDefaults)).toBe(false)
})

test('resolveProjectHierarchyTreeShowsTreeLines prefers app settings preview override', () => {
  const settings = {
    hideTreeLines: false
  } satisfies Pick<I_faUserSettings, 'hideTreeLines'>

  expect(resolveProjectHierarchyTreeShowsTreeLines(settings as I_faUserSettings, {
    hideTreeLines: true
  }, hideTreeLinesDefaults)).toBe(false)
})
