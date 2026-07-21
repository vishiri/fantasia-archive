import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

import { FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS } from 'app/helpers/openedDocumentTabTestStatusFlagDefaults'

import { createUseProjectAppControlBar } from '../../functions/createUseProjectAppControlBar'
import {
  resolveProjectAppControlBarSaveButtonColor,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarSaveButtons
} from '../../functions/projectAppControlBarEditMode'
import {
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowAppControlBarStrip,
  resolveShowDocumentTabs
} from '../../functions/projectAppControlBarVisibility'
import { assembleProjectAppControlBarApi } from '../projectAppControlBarSessionWiring'
import { buildProjectAppControlBarAssembleInput } from '../projectAppControlBarAssembleInput'

const projectAppControlBarTestResolveHideHierarchyTree = (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null
): boolean => {
  if (preview?.hideHierarchyTree !== undefined) {
    return preview.hideHierarchyTree
  }
  if (settings !== null) {
    return settings.hideHierarchyTree
  }
  return false
}

type T_tabSeedRow = {
  documentId: string
  persistenceState: 'persisted'
  displayNameDraft: string
  documentBackgroundColorDraft?: string
  documentTextColorDraft?: string
  editState: boolean
  hasUnsavedChanges: boolean
  isCategoryDraft?: boolean
  isDeadDraft?: boolean
  isFinishedDraft?: boolean
  isMinorDraft?: boolean
  savedDisplayName: string
  savedDocumentBackgroundColor?: string
  savedDocumentTextColor?: string
  savedIsCategory?: boolean
  savedIsDead?: boolean
  savedIsFinished?: boolean
  savedIsMinor?: boolean
  parentDocumentIdDraft?: string
  savedParentDocumentId?: string
  treeOrderNumberDraft?: string
  savedTreeOrderNumber?: number
  extraClassesDraft?: string
  savedExtraClasses?: string
  tabLabel: string
  templateIcon: string
  worldId?: string
}

function mountUseProjectAppControlBar (input: {
  appSettingsDialogPreview?: { hideHierarchyTree?: boolean } | null
  disableAppControlBar: boolean
  disableAppControlBarContentButtons?: boolean
  disableAppControlBarFunctionButtons?: boolean
  disableAppControlBarGuides?: boolean
  hideHierarchyTree?: boolean
  documentWorkspaceRoute?: boolean
  enterDocumentEditMode?: (documentId: string) => void
  projectWorlds?: Array<{ color: string, colorPallete?: string, displayName: string, id: string }>
  requestCloseTab?: (documentId: string) => void
  requestDeleteDocument?: (documentId: string) => void
  runFaAction?: (id: string, payload: unknown) => void
  tabSeed?: T_tabSeedRow[]
} = {
  disableAppControlBar: false
}) {
  const settings = ref({
    disableAppControlBar: input.disableAppControlBar,
    disableAppControlBarContentButtons: input.disableAppControlBarContentButtons === true,
    disableAppControlBarFunctionButtons: input.disableAppControlBarFunctionButtons === true,
    disableAppControlBarGuides: input.disableAppControlBarGuides === true,
    hideHierarchyTree: input.hideHierarchyTree === true
  })
  const appSettingsDialogPreview = ref(input.appSettingsDialogPreview ?? null)
  const tabs = ref((input.tabSeed ?? []).map((tab) => ({
    ...FA_OPENED_DOCUMENT_TAB_STATUS_FLAG_DEFAULTS,
    ...tab
  })))
  const worlds = ref(input.projectWorlds ?? [])
  const activeDocumentId = ref<string | null>(input.tabSeed?.[0]?.documentId ?? null)
  const routePath = ref(
    input.documentWorkspaceRoute === false ? '/home' : '/home/document/doc-a'
  )

  const userSettingsStore = {}
  const openedDocumentsStore = {
    enterDocumentEditMode: input.enterDocumentEditMode ?? (() => undefined),
    findTabByDocumentId: (documentId: string) => {
      return tabs.value.find((tab) => tab.documentId === documentId) ?? null
    },
    closeAllTabsWithoutChanges: async () => undefined,
    closeTabsWithoutChangesExcept: async () => undefined,
    deleteOpenedDocument: async () => undefined,
    requestDeleteDocument: input.requestDeleteDocument ?? (() => undefined),
    forceCloseAllTabs: async () => undefined,
    forceCloseAllTabsExcept: async () => undefined,
    moveDocumentTab: vi.fn(),
    requestCloseTab: input.requestCloseTab ?? (() => undefined)
  }
  const hierarchyTreeStore = {}

  return createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: (routePathValue: string) => {
      const match = /^\/home\/document\/([^/]+)$/.exec(routePathValue)
      return match?.[1] ?? null
    },
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    runFaAction: input.runFaAction ?? vi.fn(),
    S_FaOpenedDocuments: () => openedDocumentsStore as never,
    S_FaProjectHierarchyTree: () => hierarchyTreeStore as never,
    S_FaUserSettings: () => userSettingsStore as never,
    storeToRefs: (store: unknown) => {
      if (store === userSettingsStore) {
        return {
          appSettingsDialogPreview,
          settings
        } as never
      }
      if (store === openedDocumentsStore) {
        return {
          activeDocumentId,
          tabs
        } as never
      }
      return {
        worlds
      } as never
    },
    useRoute: () => ({
      path: routePath.value
    })
  })()
}

test('Test that createUseProjectAppControlBar shows the strip when the setting is off', () => {
  const api = mountUseProjectAppControlBar({ disableAppControlBar: false })

  expect(api.showAppControlBar.value).toBe(true)
})

test('Test that createUseProjectAppControlBar hides the strip when disableAppControlBar is on', () => {
  const api = mountUseProjectAppControlBar({ disableAppControlBar: true })

  expect(api.showAppControlBar.value).toBe(false)
})

test('Test that createUseProjectAppControlBar hides guide buttons when disableAppControlBarGuides is on', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    disableAppControlBarGuides: true
  })

  expect(api.showGuideButtons.value).toBe(false)
})

test('Test that createUseProjectAppControlBar hides function buttons when disableAppControlBarFunctionButtons is on', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    disableAppControlBarFunctionButtons: true
  })

  expect(api.showFunctionButtons.value).toBe(false)
  expect(api.showContentButtons.value).toBe(true)
})

test('Test that createUseProjectAppControlBar hides content buttons when disableAppControlBarContentButtons is on', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    disableAppControlBarContentButtons: true
  })

  expect(api.showContentButtons.value).toBe(false)
  expect(api.showFunctionButtons.value).toBe(true)
})

test('Test that createUseProjectAppControlBar resolves hideHierarchyTree from settings and preview', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    hideHierarchyTree: false,
    appSettingsDialogPreview: {
      hideHierarchyTree: true
    }
  })

  expect(api.hideHierarchyTree.value).toBe(true)
})

test('Test that createUseProjectAppControlBar keeps header tabs visible when disableAppControlBar is on', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: true,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      hasUnsavedChanges: false,
      editState: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showAppControlBar.value).toBe(false)
  expect(api.showDocumentTabs.value).toBe(true)
})

test('Test that createUseProjectAppControlBar keeps the strip visible without tabs when the setting is off', () => {
  const api = mountUseProjectAppControlBar({ disableAppControlBar: false })

  expect(api.showAppControlBar.value).toBe(true)
  expect(api.showDocumentTabs.value).toBe(false)
})

test('Test that activeDocumentTabName mirrors the store active document when that tab is open', () => {
  const settings = ref({ disableAppControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      hasUnsavedChanges: false,
      editState: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>('doc-a')
  const worlds = ref([])
  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    runFaAction: vi.fn(),
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: () => undefined,
      findTabByDocumentId: () => null,
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: () => undefined,
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab: () => undefined,
      requestCloseTab: () => undefined
    }) as never,
    S_FaProjectHierarchyTree: () => ({}) as never,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs,
        worlds
      } as never
    },
    useRoute: () => ({
      path: '/home/document/doc-a'
    })
  })()

  expect(api.activeDocumentTabName.value).toBe('doc-a')

  activeDocumentId.value = 'doc-missing'
  expect(api.activeDocumentTabName.value).toBeUndefined()
})

test('Test that createUseProjectAppControlBar exposes edit and save button visibility from editState', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showEditDocumentButton.value).toBe(true)
  expect(api.showSaveDocumentButtons.value).toBe(false)
  expect(api.showDeleteDocumentButton.value).toBe(true)
})

test('Test that createUseProjectAppControlBar shows delete button in edit mode on document routes', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: true,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showDeleteDocumentButton.value).toBe(true)
})

test('Test that onDeleteCurrentDocumentClick delegates to requestDeleteDocument', () => {
  const requestDeleteDocument = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    requestDeleteDocument,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  api.onDeleteCurrentDocumentClick()
  expect(requestDeleteDocument).toHaveBeenCalledWith('doc-a')
})

test('Test that onDeleteCurrentDocumentClick no-ops without an active document', () => {
  const requestDeleteDocument = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    documentWorkspaceRoute: false,
    requestDeleteDocument,
    tabSeed: []
  })

  api.onDeleteCurrentDocumentClick()

  expect(requestDeleteDocument).not.toHaveBeenCalled()
})

test('Test that onEnterEditModeClick no-ops without an active document', () => {
  const enterDocumentEditMode = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    documentWorkspaceRoute: false,
    enterDocumentEditMode,
    tabSeed: []
  })

  api.onEnterEditModeClick()

  expect(enterDocumentEditMode).not.toHaveBeenCalled()
})

test('Test that resolveDocumentTabAppearanceChrome and inline style delegate to tab appearance wiring', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      documentBackgroundColorDraft: '#112233',
      documentTextColorDraft: '#aabbcc',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      savedDocumentTextColor: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  const tab = api.openedDocumentTabs.value[0]!
  expect(api.resolveDocumentTabAppearanceChrome(tab)).toEqual({
    backgroundColor: '#112233',
    color: '#aabbcc'
  })
  expect(api.resolveDocumentTabInlineStyle(tab)).toEqual({
    '--projectAppControlBarTab-backgroundColor': '#112233',
    '--projectAppControlBarTab-focusHelperColor': '#112233',
    '--projectAppControlBarTab-textColor': '#aabbcc',
    backgroundColor: '#112233'
  })
  expect(api.resolveDocumentTabDisplayIcon(tab)).toBe('mdi-account')
})

test('Test that resolveDocumentTabDisplayIcon uses folder icon when category draft is on', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      documentBackgroundColorDraft: '',
      documentTextColorDraft: '',
      editState: true,
      hasUnsavedChanges: true,
      savedDisplayName: 'A',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: true,
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      savedDocumentTextColor: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.resolveDocumentTabDisplayIcon(api.openedDocumentTabs.value[0]!)).toBe('mdi-folder-open')
})

test('Test that saveDocumentButtonColor reflects active tab unsaved state in edit mode', () => {
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'Draft',
      editState: true,
      hasUnsavedChanges: true,
      savedDisplayName: 'Saved',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.saveDocumentButtonColor.value).toBe('teal-14')

  api.openedDocumentTabs.value[0]!.hasUnsavedChanges = false
  expect(api.saveDocumentButtonColor.value).toBe('primary-bright')
})

test('Test that onEnterEditModeClick delegates to the opened documents store', () => {
  const enterDocumentEditMode = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    enterDocumentEditMode,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  api.onEnterEditModeClick()
  expect(enterDocumentEditMode).toHaveBeenCalledWith('doc-a')
})

test('Test that onTabAuxClick requests close on middle button only', () => {
  const requestCloseTab = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    requestCloseTab
  })
  const preventDefault = vi.fn()
  const stopPropagation = vi.fn()

  api.onTabAuxClick('doc-hero', {
    button: 0,
    preventDefault,
    stopPropagation
  } as unknown as MouseEvent)

  expect(requestCloseTab).not.toHaveBeenCalled()
  expect(preventDefault).not.toHaveBeenCalled()
  expect(stopPropagation).not.toHaveBeenCalled()

  api.onTabAuxClick('doc-hero', {
    button: 1,
    preventDefault,
    stopPropagation
  } as unknown as MouseEvent)

  expect(requestCloseTab).toHaveBeenCalledWith('doc-hero')
  expect(preventDefault).toHaveBeenCalledTimes(1)
  expect(stopPropagation).toHaveBeenCalledTimes(1)
})

test('Test that onSaveDocumentClick enqueues saveOpenedDocumentDisplayName with captured documentId', () => {
  const runFaAction = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    runFaAction,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: true,
      hasUnsavedChanges: true,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  api.onSaveDocumentClick(true)
  expect(runFaAction).toHaveBeenCalledWith('saveOpenedDocumentDisplayName', {
    documentId: 'doc-a',
    keepEditMode: true
  })

  runFaAction.mockClear()
  api.onSaveDocumentClick(false)
  expect(runFaAction).toHaveBeenCalledWith('saveOpenedDocumentDisplayName', {
    documentId: 'doc-a',
    keepEditMode: false
  })
})

test('Test that onCopyCurrentDocumentClick and onAddNewDocumentUnderCurrentClick dispatch document actions', () => {
  const runFaAction = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    runFaAction,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showDocumentStructureButtons.value).toBe(true)

  api.onCopyCurrentDocumentClick()
  expect(runFaAction).toHaveBeenCalledWith('copyOpenedDocumentTabDocument', {
    documentId: 'doc-a'
  })

  api.onAddNewDocumentUnderCurrentClick()
  expect(runFaAction).toHaveBeenCalledWith('addOpenedDocumentTabChildDocument', {
    documentId: 'doc-a'
  })
})

test('Test that onCopyCurrentDocumentClick no-ops without an active document', () => {
  const runFaAction = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    documentWorkspaceRoute: false,
    runFaAction
  })

  api.onCopyCurrentDocumentClick()
  api.onAddNewDocumentUnderCurrentClick()

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that edit and save handlers no-op when no active document is selected', () => {
  const enterDocumentEditMode = vi.fn()
  const runFaAction = vi.fn()
  const settings = ref({ disableAppControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>(null)
  const worlds = ref([])
  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => null,
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    runFaAction,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode,
      findTabByDocumentId: () => null,
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: () => undefined,
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab: () => undefined,
      requestCloseTab: () => undefined
    }) as never,
    S_FaProjectHierarchyTree: () => ({}) as never,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs,
        worlds
      } as never
    },
    useRoute: () => ({
      path: '/home'
    })
  })()

  api.onEnterEditModeClick()
  api.onSaveDocumentClick(true)
  expect(enterDocumentEditMode).not.toHaveBeenCalled()
  expect(runFaAction).not.toHaveBeenCalled()
  expect(api.saveDocumentButtonColor.value).toBe('primary-bright')
  expect(api.activeDocumentTab.value).toBeNull()
})

test('Test that tab label and route helpers delegate to opened tab data', () => {
  const requestCloseTab = vi.fn()
  const api = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    requestCloseTab,
    tabSeed: [{
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: ' Draft ',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.resolveDocumentTabRoute('doc-a')).toBe('/home/document/doc-a')
  expect(api.resolveDocumentTabLabel({
    documentId: 'doc-a',
    persistenceState: 'persisted',
    displayNameDraft: ' Draft ',
    editState: false,
    hasUnsavedChanges: false,
    savedDisplayName: 'A',
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
    extraClassesDraft: '',
    savedExtraClasses: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account'
  })).toBe('Draft')
  api.onTabCloseClick('doc-a')
  expect(requestCloseTab).toHaveBeenCalledWith('doc-a')
})

test('Test that activeDocumentTab is null when the active id does not match an open tab', () => {
  const settings = ref({ disableAppControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      persistenceState: 'persisted',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>('doc-missing')
  const worlds = ref([])
  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-missing',
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    runFaAction: vi.fn(),
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: () => undefined,
      findTabByDocumentId: () => null,
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: () => undefined,
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab: () => undefined,
      requestCloseTab: () => undefined
    }) as never,
    S_FaProjectHierarchyTree: () => ({}) as never,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs,
        worlds
      } as never
    },
    useRoute: () => ({
      path: '/home/document/doc-missing'
    })
  })()

  expect(api.activeDocumentTab.value).toBeNull()
  expect(api.saveDocumentButtonColor.value).toBe('primary-bright')
})

test('Test that createUseProjectAppControlBar exposes keybind tooltip labels from the keybind snapshot', () => {
  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: ({ commandId }) => {
      if (commandId === 'editDocument') {
        return 'Ctrl + E'
      }
      if (commandId === 'saveDocumentKeepEditMode') {
        return 'Ctrl + S'
      }
      if (commandId === 'saveDocument') {
        return 'Ctrl + Alt + S'
      }
      if (commandId === 'moveDocumentTabLeft') {
        return 'Alt + Shift + Left'
      }
      if (commandId === 'moveDocumentTabRight') {
        return 'Alt + Shift + Right'
      }
      return null
    },
    getKeybindsSnapshot: () => ({
      platform: 'win32',
      store: {
        overrides: {},
        schemaVersion: 1
      }
    }),
    runFaAction: vi.fn(),
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: () => undefined,
      findTabByDocumentId: () => null,
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: () => undefined,
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab: () => undefined,
      requestCloseTab: () => undefined
    }) as never,
    S_FaProjectHierarchyTree: () => ({}) as never,
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: () => ({
      activeDocumentId: ref(null),
      settings: ref({ disableAppControlBar: false }),
      tabs: ref([]),
      worlds: ref([])
    }) as never,
    useRoute: () => ({
      path: '/home/document/doc-a'
    })
  })()

  expect(api.editDocumentKeybindLabel.value).toBe('Ctrl + E')
  expect(api.saveDocumentKeepEditModeKeybindLabel.value).toBe('Ctrl + S')
  expect(api.saveDocumentKeybindLabel.value).toBe('Ctrl + Alt + S')
  expect(api.moveDocumentTabLeftKeybindLabel.value).toBe('Alt + Shift + Left')
  expect(api.moveDocumentTabRightKeybindLabel.value).toBe('Alt + Shift + Right')
})

test('Test that tab context menu bulk and destructive handlers delegate to opened documents store', () => {
  const closeAllTabsWithoutChanges = vi.fn(async () => undefined)
  const closeTabsWithoutChangesExcept = vi.fn(async () => undefined)
  const forceCloseAllTabs = vi.fn(async () => undefined)
  const forceCloseAllTabsExcept = vi.fn(async () => undefined)
  const requestDeleteDocument = vi.fn()
  const moveDocumentTab = vi.fn()

  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: (routePathValue: string) => {
      const match = /^\/home\/document\/([^/]+)$/.exec(routePathValue)
      return match?.[1] ?? null
    },
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: vi.fn(),
      findTabByDocumentId: (documentId: string) => {
        return documentId === 'doc-a'
          ? {
              documentId: 'doc-a',
              persistenceState: 'persisted',
              displayNameDraft: 'A',
              editState: false,
              hasUnsavedChanges: false,
              savedDisplayName: 'A',
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
              extraClassesDraft: '',
              savedExtraClasses: '',
              tabLabel: 'Character',
              templateIcon: 'mdi-account'
            }
          : null
      },
      closeAllTabsWithoutChanges,
      closeTabsWithoutChangesExcept,
      requestDeleteDocument,
      forceCloseAllTabs,
      forceCloseAllTabsExcept,
      moveDocumentTab,
      requestCloseTab: vi.fn()
    }) as never,
    S_FaProjectHierarchyTree: () => ({ __faHierarchyTree: true }) as never,
    S_FaUserSettings: () => ({} as never),
    storeToRefs: ((store: unknown) => {
      if (store !== null && typeof store === 'object' && '__faHierarchyTree' in store) {
        return {
          worlds: ref([])
        } as never
      }
      if (store !== null && typeof store === 'object' && 'closeAllTabsWithoutChanges' in store) {
        return {
          activeDocumentId: ref('doc-a'),
          tabs: ref([{
            documentId: 'doc-a',
            persistenceState: 'persisted',
            displayNameDraft: 'A',
            editState: false,
            hasUnsavedChanges: false,
            savedDisplayName: 'A',
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
            extraClassesDraft: '',
            savedExtraClasses: '',
            tabLabel: 'Character',
            templateIcon: 'mdi-account'
          }])
        } as never
      }
      return {
        settings: ref({ disableAppControlBar: false })
      } as never
    }) as never,
    useRoute: () => ({
      path: '/home/document/doc-a'
    }),
    runFaAction: vi.fn()
  })()

  api.onTabCloseAllWithoutChangesClick()
  api.onTabCloseAllWithoutChangesExceptClick('doc-a')
  api.onTabForceCloseAllClick()
  api.onTabForceCloseAllExceptClick('doc-a')
  api.onTabDeleteClick('doc-a')

  expect(closeAllTabsWithoutChanges).toHaveBeenCalledOnce()
  expect(closeTabsWithoutChangesExcept).toHaveBeenCalledWith('doc-a')
  expect(forceCloseAllTabs).toHaveBeenCalledOnce()
  expect(forceCloseAllTabsExcept).toHaveBeenCalledWith('doc-a')
  expect(requestDeleteDocument).toHaveBeenCalledWith('doc-a')
})

test('Test that createUseProjectAppControlBar tab copy and move handlers delegate to the opened documents store', async () => {
  const moveDocumentTab = vi.fn()
  const runFaAction = vi.fn()
  const findTabByDocumentId = vi.fn((documentId: string) => {
    return documentId === 'doc-a'
      ? {
          documentId: 'doc-a',
          persistenceState: 'persisted',
          displayNameDraft: ' Hero ',
          editState: false,
          hasUnsavedChanges: false,
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
          extraClassesDraft: '',
          savedExtraClasses: '',
          tabLabel: 'Character',
          templateIcon: 'mdi-account'
        }
      : null
  })

  const api = createUseProjectAppControlBar({
    assembleProjectAppControlBarApi,
    buildProjectAppControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveHideHierarchyTree: projectAppControlBarTestResolveHideHierarchyTree,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowAppControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectAppControlBarEditButton,
    resolveShowProjectAppControlBarDeleteButton,
    resolveShowProjectAppControlBarSaveButtons,
    resolveProjectAppControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    runFaAction,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: vi.fn(),
      findTabByDocumentId,
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: vi.fn(),
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab,
      requestCloseTab: vi.fn()
    }) as never,
    S_FaProjectHierarchyTree: () => ({ __faHierarchyTree: true }) as never,
    S_FaUserSettings: () => ({} as never),
    storeToRefs: ((store: unknown) => {
      if (store !== null && typeof store === 'object' && '__faHierarchyTree' in store) {
        return {
          worlds: ref([])
        } as never
      }
      if (store !== null && typeof store === 'object' && 'moveDocumentTab' in store) {
        return {
          activeDocumentId: ref('doc-a'),
          tabs: ref([{
            documentId: 'doc-a',
            persistenceState: 'persisted',
            displayNameDraft: ' Hero ',
            editState: false,
            hasUnsavedChanges: false,
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
            extraClassesDraft: '',
            savedExtraClasses: '',
            tabLabel: 'Character',
            templateIcon: 'mdi-account'
          }])
        } as never
      }
      return {
        settings: ref({ disableAppControlBar: false })
      } as never
    }) as never,
    useRoute: () => ({
      path: '/home/document/doc-a'
    })
  })()

  await api.onTabCopyNameClick('doc-a')
  expect(findTabByDocumentId).toHaveBeenCalledWith('doc-a')
  expect(runFaAction).toHaveBeenCalledWith('copyOpenedDocumentTabName', { documentId: 'doc-a' })

  api.onTabMoveClick('doc-a', 'left')
  expect(moveDocumentTab).toHaveBeenCalledWith('doc-a', 'left')
})

test('Test that createUseProjectAppControlBar exposes world tab indicators only for multi-world projects', () => {
  const singleWorldApi = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    projectWorlds: [
      {
        color: '#00ff00',
        colorPallete: '',
        displayName: 'World 1',
        id: 'world-1'
      }
    ],
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'Hero',
      editState: false,
      hasUnsavedChanges: false,
      persistenceState: 'persisted',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Hero',
      templateIcon: 'mdi-account',
      worldId: 'world-1'
    }]
  })

  expect(singleWorldApi.showWorldTabIndicators.value).toBe(false)
  expect(singleWorldApi.resolveTabWorldIndicatorColor(singleWorldApi.openedDocumentTabs.value[0]!)).toBeNull()

  const multiWorldApi = mountUseProjectAppControlBar({
    disableAppControlBar: false,
    projectWorlds: [
      {
        color: '#00ff00',
        colorPallete: '',
        displayName: 'World 1',
        id: 'world-1'
      },
      {
        color: '#ff00ff',
        colorPallete: '',
        displayName: 'World 2',
        id: 'world-2'
      }
    ],
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'Hero',
      editState: false,
      hasUnsavedChanges: false,
      persistenceState: 'persisted',
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
      extraClassesDraft: '',
      savedExtraClasses: '',
      tabLabel: 'Hero',
      templateIcon: 'mdi-account',
      worldId: 'world-2'
    }]
  })

  expect(multiWorldApi.showWorldTabIndicators.value).toBe(true)
  expect(multiWorldApi.resolveTabWorldIndicatorColor(multiWorldApi.openedDocumentTabs.value[0]!)).toBe('#ff00ff')
})
