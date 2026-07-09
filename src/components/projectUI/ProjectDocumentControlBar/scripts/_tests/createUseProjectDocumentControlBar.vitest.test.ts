import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createUseProjectDocumentControlBar } from '../../functions/createUseProjectDocumentControlBar'
import {
  resolveProjectDocumentControlBarSaveButtonColor,
  resolveShowProjectDocumentControlBarDeleteButton,
  resolveShowProjectDocumentControlBarEditButton,
  resolveShowProjectDocumentControlBarSaveButtons
} from '../../functions/projectDocumentControlBarEditMode'
import {
  resolveActiveDocumentTabName,
  resolveDocumentTabLabelFromOpenedTab,
  resolveShowDocumentControlBarStrip,
  resolveShowDocumentTabs
} from '../../functions/projectDocumentControlBarVisibility'
import { assembleProjectDocumentControlBarApi } from '../projectDocumentControlBarSessionWiring'
import { buildProjectDocumentControlBarAssembleInput } from '../projectDocumentControlBarAssembleInput'

type T_tabSeedRow = {
  documentId: string
  displayNameDraft: string
  editState: boolean
  hasUnsavedChanges: boolean
  savedDisplayName: string
  tabLabel: string
  templateIcon: string
}

function mountUseProjectDocumentControlBar (input: {
  disableDocumentControlBar: boolean
  documentWorkspaceRoute?: boolean
  enterDocumentEditMode?: (documentId: string) => void
  requestCloseTab?: (documentId: string) => void
  requestDeleteDocument?: (documentId: string) => void
  runFaAction?: (id: string, payload: unknown) => void
  tabSeed?: T_tabSeedRow[]
} = {
  disableDocumentControlBar: false
}) {
  const settings = ref({ disableDocumentControlBar: input.disableDocumentControlBar })
  const tabs = ref(input.tabSeed ?? [])
  const activeDocumentId = ref<string | null>(input.tabSeed?.[0]?.documentId ?? null)
  const routePath = ref(
    input.documentWorkspaceRoute === false ? '/home' : '/home/document/doc-a'
  )

  return createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: (routePathValue: string) => {
      const match = /^\/home\/document\/([^/]+)$/.exec(routePathValue)
      return match?.[1] ?? null
    },
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
    }),
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: input.enterDocumentEditMode ?? (() => undefined),
      findTabByDocumentId: (documentId: string) => {
        return input.tabSeed?.find((tab) => tab.documentId === documentId) ?? null
      },
      closeAllTabsWithoutChanges: async () => undefined,
      closeTabsWithoutChangesExcept: async () => undefined,
      deleteOpenedDocument: async () => undefined,
      requestDeleteDocument: input.requestDeleteDocument ?? (() => undefined),
      forceCloseAllTabs: async () => undefined,
      forceCloseAllTabsExcept: async () => undefined,
      moveDocumentTab: vi.fn(),
      requestCloseTab: input.requestCloseTab ?? (() => undefined)
    }) as never,
    runFaAction: input.runFaAction ?? vi.fn(),
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs
      } as never
    },
    useRoute: () => ({
      path: routePath.value
    })
  })()
}

test('Test that createUseProjectDocumentControlBar shows the strip when the setting is off', () => {
  const api = mountUseProjectDocumentControlBar({ disableDocumentControlBar: false })

  expect(api.showDocumentControlBar.value).toBe(true)
})

test('Test that createUseProjectDocumentControlBar hides the strip when disableDocumentControlBar is on', () => {
  const api = mountUseProjectDocumentControlBar({ disableDocumentControlBar: true })

  expect(api.showDocumentControlBar.value).toBe(false)
})

test('Test that createUseProjectDocumentControlBar keeps header tabs visible when disableDocumentControlBar is on', () => {
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: true,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      hasUnsavedChanges: false,
      editState: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showDocumentControlBar.value).toBe(false)
  expect(api.showDocumentTabs.value).toBe(true)
})

test('Test that createUseProjectDocumentControlBar keeps the strip visible without tabs when the setting is off', () => {
  const api = mountUseProjectDocumentControlBar({ disableDocumentControlBar: false })

  expect(api.showDocumentControlBar.value).toBe(true)
  expect(api.showDocumentTabs.value).toBe(false)
})

test('Test that activeDocumentTabName mirrors the store active document when that tab is open', () => {
  const settings = ref({ disableDocumentControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      displayNameDraft: 'A',
      hasUnsavedChanges: false,
      editState: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>('doc-a')
  const api = createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
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
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs
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

test('Test that createUseProjectDocumentControlBar exposes edit and save button visibility from editState', () => {
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showEditDocumentButton.value).toBe(true)
  expect(api.showSaveDocumentButtons.value).toBe(false)
  expect(api.showDeleteDocumentButton.value).toBe(true)
})

test('Test that createUseProjectDocumentControlBar shows delete button in edit mode on document routes', () => {
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: true,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.showDeleteDocumentButton.value).toBe(true)
})

test('Test that onDeleteCurrentDocumentClick delegates to requestDeleteDocument', () => {
  const requestDeleteDocument = vi.fn()
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    requestDeleteDocument,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  api.onDeleteCurrentDocumentClick()
  expect(requestDeleteDocument).toHaveBeenCalledWith('doc-a')
})

test('Test that saveDocumentButtonColor reflects active tab unsaved state in edit mode', () => {
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'Draft',
      editState: true,
      hasUnsavedChanges: true,
      savedDisplayName: 'Saved',
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
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    enterDocumentEditMode,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  api.onEnterEditModeClick()
  expect(enterDocumentEditMode).toHaveBeenCalledWith('doc-a')
})

test('Test that onTabAuxClick requests close on middle button only', () => {
  const requestCloseTab = vi.fn()
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
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
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    runFaAction,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: true,
      hasUnsavedChanges: true,
      savedDisplayName: 'A',
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

test('Test that edit and save handlers no-op when no active document is selected', () => {
  const enterDocumentEditMode = vi.fn()
  const runFaAction = vi.fn()
  const settings = ref({ disableDocumentControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>(null)
  const api = createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => null,
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
    }),
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
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs
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
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    requestCloseTab,
    tabSeed: [{
      documentId: 'doc-a',
      displayNameDraft: ' Draft ',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }]
  })

  expect(api.resolveDocumentTabRoute('doc-a')).toBe('/home/document/doc-a')
  expect(api.resolveDocumentTabLabel({
    documentId: 'doc-a',
    displayNameDraft: ' Draft ',
    editState: false,
    hasUnsavedChanges: false,
    savedDisplayName: 'A',
    tabLabel: 'Character',
    templateIcon: 'mdi-account'
  })).toBe('Draft')
  api.onTabCloseClick('doc-a')
  expect(requestCloseTab).toHaveBeenCalledWith('doc-a')
})

test('Test that activeDocumentTab is null when the active id does not match an open tab', () => {
  const settings = ref({ disableDocumentControlBar: false })
  const tabs = ref([
    {
      documentId: 'doc-a',
      displayNameDraft: 'A',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'A',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }
  ])
  const activeDocumentId = ref<string | null>('doc-missing')
  const api = createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-missing',
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
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
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: (store: unknown) => {
      if (store === undefined) {
        return { settings } as never
      }
      return {
        activeDocumentId,
        settings,
        tabs
      } as never
    },
    useRoute: () => ({
      path: '/home/document/doc-missing'
    })
  })()

  expect(api.activeDocumentTab.value).toBeNull()
  expect(api.saveDocumentButtonColor.value).toBe('primary-bright')
})

test('Test that createUseProjectDocumentControlBar exposes keybind tooltip labels from the keybind snapshot', () => {
  const api = createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
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
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
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
    S_FaUserSettings: () => ({}) as never,
    storeToRefs: () => ({
      activeDocumentId: ref(null),
      settings: ref({ disableDocumentControlBar: false }),
      tabs: ref([])
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

  const api = createUseProjectDocumentControlBar({
    assembleProjectDocumentControlBarApi,
    buildProjectDocumentControlBarAssembleInput,
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: (routePathValue: string) => {
      const match = /^\/home\/document\/([^/]+)$/.exec(routePathValue)
      return match?.[1] ?? null
    },
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarDeleteButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    formatFaKeybindCommandLabelFromSnapshot: () => null,
    getKeybindsSnapshot: () => null,
    copyToClipboard: vi.fn(async () => undefined),
    notifyCreate: vi.fn(),
    useI18n: () => ({
      t: (key: string) => key
    }),
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: vi.fn(),
      findTabByDocumentId: (documentId: string) => {
        return documentId === 'doc-a'
          ? {
              documentId: 'doc-a',
              displayNameDraft: 'A',
              editState: false,
              hasUnsavedChanges: false,
              savedDisplayName: 'A',
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
    S_FaUserSettings: () => ({} as never),
    storeToRefs: ((store: unknown) => {
      if (store !== null && typeof store === 'object' && 'closeAllTabsWithoutChanges' in store) {
        return {
          activeDocumentId: ref('doc-a'),
          tabs: ref([{
            documentId: 'doc-a',
            displayNameDraft: 'A',
            editState: false,
            hasUnsavedChanges: false,
            savedDisplayName: 'A',
            tabLabel: 'Character',
            templateIcon: 'mdi-account'
          }])
        } as never
      }
      return {
        settings: ref({ disableDocumentControlBar: false })
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
