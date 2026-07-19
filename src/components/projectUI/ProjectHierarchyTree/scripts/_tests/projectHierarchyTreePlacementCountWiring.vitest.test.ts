import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreePlacementCountWiring } from '../projectHierarchyTreePlacementCountWiring'

test('Test that createProjectHierarchyTreePlacementCountWiring resolves placement count display from settings', () => {
  const settings = ref({
    disableCategoryCount: false,
    disableDocumentCounts: false,
    invertCategoryPosition: true
  })
  const appSettingsDialogPreview = ref<{ disableDocumentCounts?: boolean } | null>({
    disableDocumentCounts: true
  })

  const wiring = createProjectHierarchyTreePlacementCountWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: (() => ({
      appSettingsDialogPreview,
      settings
    })) as never
  })

  expect(wiring.placementCountVisibility.value.disableDocumentCounts).toBe(true)
  expect(wiring.resolvePlacementCountDisplayForCounts({
    categoryCount: 2,
    documentCount: 5
  })).toEqual({
    segments: [
      {
        kind: 'category',
        value: 2
      }
    ],
    showDivider: false,
    shows: true
  })
})
