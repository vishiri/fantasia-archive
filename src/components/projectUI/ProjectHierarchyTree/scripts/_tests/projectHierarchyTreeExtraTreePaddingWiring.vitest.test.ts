import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreeExtraTreePaddingWiring } from '../projectHierarchyTreeDisplayChromeWiring'

test('createProjectHierarchyTreeExtraTreePaddingWiring reads extraTreePadding and preview overrides', () => {
  const settings = ref({
    extraTreePadding: false
  })
  const appSettingsDialogPreview = ref<{ extraTreePadding?: boolean } | null>({
    extraTreePadding: true
  })

  const wiring = createProjectHierarchyTreeExtraTreePaddingWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      appSettingsDialogPreview,
      settings
    }) as never
  })

  expect(wiring.usesExtraTreePadding.value).toBe(true)
})
