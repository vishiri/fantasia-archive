import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createProjectHierarchyTreeDocumentButtonGroupWiring } from '../projectHierarchyTreeDocumentButtonGroupWiring'

/**
 * createProjectHierarchyTreeDocumentButtonGroupWiring
 * Reads hideTreeIcon settings and preview overrides for document-row button visibility.
 */
test('Test that createProjectHierarchyTreeDocumentButtonGroupWiring resolves visibility from settings and preview', () => {
  const settings = ref({
    hideTreeIconAddUnder: false,
    hideTreeIconEdit: true,
    hideTreeIconView: false
  })
  const appSettingsDialogPreview = ref<{ hideTreeIconView?: boolean } | null>({
    hideTreeIconView: true
  })

  const wiring = createProjectHierarchyTreeDocumentButtonGroupWiring({
    S_FaUserSettings: (() => ({})) as never,
    computed,
    runFaAction: vi.fn(),
    storeToRefs: (() => ({
      appSettingsDialogPreview,
      settings
    })) as never
  })

  expect(wiring.documentButtonVisibility.value).toEqual({
    showsAddUnder: true,
    showsEdit: false,
    showsOpen: false
  })
})
