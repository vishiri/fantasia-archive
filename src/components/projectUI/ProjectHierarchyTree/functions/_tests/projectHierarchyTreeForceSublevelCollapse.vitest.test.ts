import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectHierarchyTreeForceSublevelCollapse } from '../projectHierarchyTreeForceSublevelCollapse'

const forceDefaults = {
  forceSublevelCollapseInTree: false
}

test('resolveProjectHierarchyTreeForceSublevelCollapse defaults to force off', () => {
  expect(resolveProjectHierarchyTreeForceSublevelCollapse(null, null, forceDefaults)).toBe(false)
})

test('resolveProjectHierarchyTreeForceSublevelCollapse uses persisted setting', () => {
  const settings = {
    forceSublevelCollapseInTree: true
  } satisfies Pick<I_faUserSettings, 'forceSublevelCollapseInTree'>

  expect(resolveProjectHierarchyTreeForceSublevelCollapse(
    settings as I_faUserSettings,
    null,
    forceDefaults
  )).toBe(true)
})

test('resolveProjectHierarchyTreeForceSublevelCollapse prefers app settings preview override', () => {
  const settings = {
    forceSublevelCollapseInTree: false
  } satisfies Pick<I_faUserSettings, 'forceSublevelCollapseInTree'>

  expect(resolveProjectHierarchyTreeForceSublevelCollapse(
    settings as I_faUserSettings,
    {
      forceSublevelCollapseInTree: true
    },
    forceDefaults
  )).toBe(true)
})
