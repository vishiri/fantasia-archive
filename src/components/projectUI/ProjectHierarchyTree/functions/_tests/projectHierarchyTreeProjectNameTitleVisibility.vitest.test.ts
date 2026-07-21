import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectHierarchyTreeShowsProjectNameTitle } from '../projectHierarchyTreeProjectNameTitleVisibility'

const noProjectNameDefaults = {
  noProjectName: false
}

test('resolveProjectHierarchyTreeShowsProjectNameTitle hides for single-world projects', () => {
  expect(resolveProjectHierarchyTreeShowsProjectNameTitle(
    1,
    'My Project',
    null,
    null,
    noProjectNameDefaults
  )).toBe(false)
})

test('resolveProjectHierarchyTreeShowsProjectNameTitle shows for multi-world projects', () => {
  expect(resolveProjectHierarchyTreeShowsProjectNameTitle(
    2,
    'My Project',
    null,
    null,
    noProjectNameDefaults
  )).toBe(true)
})

test('resolveProjectHierarchyTreeShowsProjectNameTitle hides blank project names', () => {
  expect(resolveProjectHierarchyTreeShowsProjectNameTitle(
    2,
    '   ',
    null,
    null,
    noProjectNameDefaults
  )).toBe(false)
})

test('resolveProjectHierarchyTreeShowsProjectNameTitle respects noProjectName setting', () => {
  const settings = {
    noProjectName: true
  } satisfies Pick<I_faUserSettings, 'noProjectName'>

  expect(resolveProjectHierarchyTreeShowsProjectNameTitle(
    2,
    'My Project',
    settings as I_faUserSettings,
    null,
    noProjectNameDefaults
  )).toBe(false)
})

test('resolveProjectHierarchyTreeShowsProjectNameTitle prefers app settings preview override', () => {
  const settings = {
    noProjectName: false
  } satisfies Pick<I_faUserSettings, 'noProjectName'>

  expect(resolveProjectHierarchyTreeShowsProjectNameTitle(
    2,
    'My Project',
    settings as I_faUserSettings,
    {
      noProjectName: true
    },
    noProjectNameDefaults
  )).toBe(false)
})
