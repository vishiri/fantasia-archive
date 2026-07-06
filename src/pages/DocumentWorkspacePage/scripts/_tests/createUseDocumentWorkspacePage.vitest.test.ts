import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import { createUseDocumentWorkspacePage } from '../functions/createUseDocumentWorkspacePage'

const previewTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  tabLabel: 'Character',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  hasUnsavedChanges: false,
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE
}

const editTab: I_faOpenedDocumentTab = {
  ...previewTab,
  editState: true
}

function createHarness (tab: I_faOpenedDocumentTab | null) {
  const routeDocumentId = computed(() => 'doc-1')
  const useDocumentWorkspacePage = createUseDocumentWorkspacePage({
    S_FaOpenedDocuments: () => ({
      findTabByDocumentId: () => tab,
      updateDisplayNameDraft: () => {}
    }) as never,
    computed: computed as never,
    createDocumentWorkspacePageRouteEffects: () => ({
      routeDocumentId
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    navigateToWorkspaceHomeRoute: async () => {},
    onMounted: () => {},
    resolveOpenedDocumentDisplayNameFromTab: (row) => {
      const draft = row.displayNameDraft.trim()
      return draft.length > 0 ? draft : row.tabLabel
    },
    resolveOpenedDocumentTabIsInEditMode: (editState) => editState,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    storeToRefs: () => ({
      hydrationComplete: ref(true)
    }) as never,
    useRoute: () => ({
      params: {
        documentId: 'doc-1'
      }
    }),
    watch: () => {}
  })

  return useDocumentWorkspacePage()
}

/**
 * createUseDocumentWorkspacePage preview vs edit presentation flags
 */
test('Test that createUseDocumentWorkspacePage shows preview title when editState is off', () => {
  const api = createHarness(previewTab)
  expect(api.documentShowsPreview.value).toBe(true)
  expect(api.documentShowsEditFields.value).toBe(false)
  expect(api.previewDisplayName.value).toBe('Hero')
})

test('Test that createUseDocumentWorkspacePage shows edit fields when editState is on', () => {
  const api = createHarness(editTab)
  expect(api.documentShowsPreview.value).toBe(false)
  expect(api.documentShowsEditFields.value).toBe(true)
})
