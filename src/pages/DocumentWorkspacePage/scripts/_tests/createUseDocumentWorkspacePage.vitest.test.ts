import { computed, ref } from 'vue'
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'

import { createUseDocumentWorkspacePage } from '../createUseDocumentWorkspacePage'
import { createDocumentWorkspacePageColorPickers } from '../functions/createDocumentWorkspacePageColorPickers'
import { createDocumentWorkspacePageDocumentBooleanToggle } from '../functions/createDocumentWorkspacePageDocumentBooleanToggle'
import { createDocumentWorkspacePageIsCategoryToggle } from '../functions/createDocumentWorkspacePageIsCategoryToggle'

const previewTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  persistenceState: 'persisted',
  tabLabel: 'Character',
  templateIcon: 'mdi-account',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  hasUnsavedChanges: false,
  editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
  worldId: 'world-1'
}

const editTab: I_faOpenedDocumentTab = {
  ...previewTab,
  editState: true
}

function createHarness (tab: I_faOpenedDocumentTab | null) {
  const routeDocumentId = computed(() => 'doc-1')
  const worlds = ref<readonly I_faProjectHierarchyTreeWorkspaceWorld[]>([
    {
      color: '#808080',
      colorPallete: '#112233;#445566',
      displayName: 'Realm',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0
    }
  ])
  const useDocumentWorkspacePage = createUseDocumentWorkspacePage({
    S_FaOpenedDocuments: () => ({
      findTabByDocumentId: () => tab,
      updateDisplayNameDraft: () => {},
      updateDocumentBackgroundColorDraft: () => {},
      updateDocumentTextColorDraft: () => {},
      updateIsCategoryDraft: () => {},
      updateIsDeadDraft: () => {},
      updateIsFinishedDraft: () => {},
      updateIsMinorDraft: () => {},
      updateParentDocumentIdDraft: () => {},
      updateTreeOrderNumberDraft: () => {}
    }) as never,
    S_FaProjectHierarchyTree: () => ({
      patchWorldColorPalleteInLayout: () => {}
    }) as never,
    computed: computed as never,
    createDocumentWorkspacePageColorPickers,
    createDocumentWorkspacePageDocumentBooleanToggle,
    createDocumentWorkspacePageIsCategoryToggle,
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
    parseFaProjectWorldColorPalleteToHexList: (colorPallete: string) => {
      return colorPallete.length === 0 ? [] : colorPallete.split(';')
    },
    resolveOpenedDocumentDisplayNameFromTab: (row) => {
      const draft = row.displayNameDraft.trim()
      return draft.length > 0 ? draft : row.tabLabel
    },
    resolveOpenedDocumentTabIsInEditMode: (editState) => editState,
    resolveOpenedDocumentTabIsInPreviewMode: (editState) => !editState,
    storeToRefs: (store: unknown) => {
      if (store && typeof store === 'object' && 'patchWorldColorPalleteInLayout' in store) {
        return { worlds } as never
      }
      return {
        hydrationComplete: ref(true)
      } as never
    },
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

test('Test that createUseDocumentWorkspacePage wires world palette and read-only preview pickers', () => {
  const api = createHarness(previewTab)
  expect(api.worldPickerPalette.value).toEqual(['#112233', '#445566'])
  expect(api.documentColorPickersReadOnly.value).toBe(true)
  expect(api.isCategoryToggleReadOnly.value).toBe(true)
  expect(api.textColorFieldDescription.value).toBe('documentWorkspacePage.textColorFieldDescription')
  expect(api.backgroundColorFieldDescription.value).toBe('documentWorkspacePage.backgroundColorFieldDescription')
  expect(api.worldColorPaletteAppend.value).toEqual({
    mode: 'persist',
    worldColorPalette: '#112233;#445566',
    worldId: 'world-1'
  })
})

test('Test that createUseDocumentWorkspacePage enables category toggle in edit mode', () => {
  const api = createHarness(editTab)
  expect(api.isCategoryToggleReadOnly.value).toBe(false)
})

test('Test that createUseDocumentWorkspacePage wires order number field labels and preview read-only state', () => {
  const api = createHarness(previewTab)
  expect(api.orderNumberFieldLabel.value).toBe('documentWorkspacePage.orderNumberFieldLabel')
  expect(api.orderNumberFieldDescription.value).toBe('documentWorkspacePage.orderNumberFieldDescription')
  expect(api.orderNumberFieldReadOnly.value).toBe(true)
  expect(api.orderNumberModel.value).toBe('')
})

test('Test that createUseDocumentWorkspacePage wires belongs under field labels and preview read-only state', () => {
  const api = createHarness(previewTab)
  expect(api.belongsUnderFieldLabel.value).toBe('documentWorkspacePage.belongsUnderFieldLabel')
  expect(api.belongsUnderFieldDescription.value).toBe('documentWorkspacePage.belongsUnderFieldDescription')
  expect(api.oneWayRelationshipTooltip.value).toBe('documentWorkspacePage.belongsUnderOneWayRelationshipTooltip')
  expect(api.belongsUnderFieldReadOnly.value).toBe(true)
  expect(api.belongsUnderModel.value).toBe('')
})
