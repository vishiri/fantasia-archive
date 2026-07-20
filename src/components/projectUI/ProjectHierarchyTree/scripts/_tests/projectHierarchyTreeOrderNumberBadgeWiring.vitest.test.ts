import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreeOrderNumberBadgeWiring } from '../projectHierarchyTreeOrderNumberBadgeWiring'

test('Test that createProjectHierarchyTreeOrderNumberBadgeWiring resolves visibility from settings and preview', () => {
  const settings = ref({
    hideTreeOrderNumbers: false
  })
  const appSettingsDialogPreview = ref<{ hideTreeOrderNumbers?: boolean } | null>({
    hideTreeOrderNumbers: true
  })

  const wiring = createProjectHierarchyTreeOrderNumberBadgeWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: (() => ({
      appSettingsDialogPreview,
      settings
    })) as never
  })

  expect(wiring.showsOrderNumberBadge.value).toBe(false)
})
