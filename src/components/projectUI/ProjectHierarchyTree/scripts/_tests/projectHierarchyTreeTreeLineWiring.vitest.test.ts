import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreeTreeLineWiring } from '../projectHierarchyTreeTreeLineWiring'

test('createProjectHierarchyTreeTreeLineWiring reads hideTreeLines and preview overrides', () => {
  const settings = ref({
    hideTreeLines: false
  })
  const appSettingsDialogPreview = ref<{ hideTreeLines?: boolean } | null>({
    hideTreeLines: true
  })

  const wiring = createProjectHierarchyTreeTreeLineWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: () => ({
      appSettingsDialogPreview,
      settings
    }) as never
  })

  expect(wiring.showsTreeLines.value).toBe(false)
})
