import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import { createProjectHierarchyTreePlacementCountWiring } from '../projectHierarchyTreeDisplayChromeWiring'

test('Test that createProjectHierarchyTreePlacementCountWiring resolves placement count display from settings', () => {
  const settings = ref({
    disableCategoryCount: false,
    disableDocumentCounts: false,
    doubleDashDocCount: false,
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
    doubleDashDivider: false,
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

test('Test that createProjectHierarchyTreePlacementCountWiring passes doubleDashDocCount into display', () => {
  const settings = ref({
    disableCategoryCount: false,
    disableDocumentCounts: false,
    doubleDashDocCount: true,
    invertCategoryPosition: false
  })
  const appSettingsDialogPreview = ref(null)

  const wiring = createProjectHierarchyTreePlacementCountWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    storeToRefs: (() => ({
      appSettingsDialogPreview,
      settings
    })) as never
  })

  expect(wiring.resolvePlacementCountDisplayForCounts({
    categoryCount: 1,
    documentCount: 2
  }).doubleDashDivider).toBe(true)
})
