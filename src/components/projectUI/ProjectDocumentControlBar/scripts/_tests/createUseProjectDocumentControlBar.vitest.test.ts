import { computed, ref } from 'vue'
import { expect, test, vi } from 'vitest'

import type { I_computedRef } from 'app/types/I_vueCompositionShims'

import { createUseProjectDocumentControlBar } from '../../functions/createUseProjectDocumentControlBar'
import {
  resolveProjectDocumentControlBarSaveButtonColor,
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
  saveDocumentDisplayName?: (
    documentId: string,
    options: { keepEditMode: boolean }
  ) => Promise<boolean>
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
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: input.enterDocumentEditMode ?? (() => undefined),
      requestCloseTab: input.requestCloseTab ?? (() => undefined),
      saveDocumentDisplayName: input.saveDocumentDisplayName ?? (async () => true)
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
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-a',
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: () => undefined,
      requestCloseTab: () => undefined,
      saveDocumentDisplayName: async () => true
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

test('Test that onSaveDocumentClick delegates keepEditMode to the opened documents store', async () => {
  const saveDocumentDisplayName = vi.fn(async () => true)
  const api = mountUseProjectDocumentControlBar({
    disableDocumentControlBar: false,
    saveDocumentDisplayName,
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
  await Promise.resolve()
  expect(saveDocumentDisplayName).toHaveBeenCalledWith('doc-a', { keepEditMode: true })

  saveDocumentDisplayName.mockClear()
  api.onSaveDocumentClick(false)
  await Promise.resolve()
  expect(saveDocumentDisplayName).toHaveBeenCalledWith('doc-a', { keepEditMode: false })
})

test('Test that edit and save handlers no-op when no active document is selected', () => {
  const enterDocumentEditMode = vi.fn()
  const saveDocumentDisplayName = vi.fn(async () => true)
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
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => null,
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode,
      requestCloseTab: () => undefined,
      saveDocumentDisplayName
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
  expect(saveDocumentDisplayName).not.toHaveBeenCalled()
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
    computed: computed as <T>(getter: () => T) => I_computedRef<T>,
    resolveActiveDocumentTabName,
    resolveDocumentTabLabelFromOpenedTab,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-missing',
    resolveShowDocumentControlBarStrip,
    resolveShowDocumentTabs,
    resolveShowProjectDocumentControlBarEditButton,
    resolveShowProjectDocumentControlBarSaveButtons,
    resolveProjectDocumentControlBarSaveButtonColor,
    S_FaOpenedDocuments: () => ({
      enterDocumentEditMode: () => undefined,
      requestCloseTab: () => undefined,
      saveDocumentDisplayName: async () => true
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
