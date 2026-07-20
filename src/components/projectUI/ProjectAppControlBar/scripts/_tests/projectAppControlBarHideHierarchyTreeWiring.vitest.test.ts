import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { resolveProjectAppControlBarHideHierarchyTree } from '../projectAppControlBarHideHierarchyTreeWiring'

test('Test that resolveProjectAppControlBarHideHierarchyTree delegates to layout resolver with defaults', () => {
  const settings = {
    hideHierarchyTree: true
  } satisfies Pick<I_faUserSettings, 'hideHierarchyTree'>

  expect(
    resolveProjectAppControlBarHideHierarchyTree(settings as I_faUserSettings, null)
  ).toBe(true)
})
