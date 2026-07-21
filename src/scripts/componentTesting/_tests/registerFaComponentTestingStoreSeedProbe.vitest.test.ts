import { afterEach, beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { registerFaComponentTestingStoreSeedProbe } from '../registerFaComponentTestingStoreSeedProbe_manager'

beforeEach(() => {
  setActivePinia(createPinia())
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {} as Window & typeof globalThis
  })
  S_FaUserSettings().$patch({
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS
    }
  })
})

afterEach(() => {
  delete window.__faComponentTestingPatchStores
})

/**
 * registerFaComponentTestingStoreSeedProbe
 * Installs the window patch hook for Playwright component tests.
 */
test('Test that registerFaComponentTestingStoreSeedProbe installs the window patch hook', () => {
  registerFaComponentTestingStoreSeedProbe()
  expect(typeof window.__faComponentTestingPatchStores).toBe('function')
})

/**
 * registerFaComponentTestingStoreSeedProbe
 * Patches active project and user settings through the installed hook.
 */
test('Test that registerFaComponentTestingStoreSeedProbe patches Pinia stores from the hook', () => {
  registerFaComponentTestingStoreSeedProbe()

  window.__faComponentTestingPatchStores?.({
    activeProject: {
      filePath: 'C:\\Playwright\\overview.faproject',
      id: 'playwright-overview-id',
      name: 'Playwright Overview Project'
    },
    hidePlushes: true,
    hideTooltipsProject: true
  })

  const active = S_FaActiveProject()
  expect(active.activeProject?.name).toBe('Playwright Overview Project')

  const settings = S_FaUserSettings()
  const mergedSettings = settings.settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.hidePlushes).toBe(true)
  expect(mergedSettings.hideTooltipsProject).toBe(true)
})

/**
 * registerFaComponentTestingStoreSeedProbe
 * Clears the active project when the seed requests null.
 */
test('Test that registerFaComponentTestingStoreSeedProbe clears active project when seeded null', () => {
  registerFaComponentTestingStoreSeedProbe()
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\temp.faproject',
    id: 'temp',
    name: 'Temp'
  })

  window.__faComponentTestingPatchStores?.({
    activeProject: null
  })

  expect(S_FaActiveProject().activeProject).toBeNull()
})

/**
 * registerFaComponentTestingStoreSeedProbe
 * Patches opened document tabs when the seed includes openedDocuments.
 */
test('Test that registerFaComponentTestingStoreSeedProbe patches opened document tabs', () => {
  registerFaComponentTestingStoreSeedProbe()

  window.__faComponentTestingPatchStores?.({
    openedDocuments: {
      activeDocumentId: 'doc-1',
      tabs: [
        {
          documentId: 'doc-1',
          persistenceState: 'persisted',
          tabLabel: 'Hero',
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
          extraClassesDraft: '',
          savedExtraClasses: '',
          hasUnsavedChanges: false,
          editState: false
        }
      ]
    }
  })

  const openedDocuments = S_FaOpenedDocuments()
  expect(openedDocuments.tabs).toHaveLength(1)
  expect(openedDocuments.activeDocumentId).toBe('doc-1')
  expect(openedDocuments.hydrationComplete).toBe(true)
})
