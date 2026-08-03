import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import {
  getFaComponentTestingProjectContentOverrides,
  setFaComponentTestingProjectContentOverrides
} from '../faComponentTestingProjectContentOverridesWiring'
import { patchFaComponentTestingStores } from '../faComponentTestingStoreSeedPatchWiring'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
  setFaComponentTestingProjectContentOverrides(null)
  S_FaUserSettings().$patch({
    settings: {
      ...FA_USER_SETTINGS_DEFAULTS
    }
  })
})

/**
 * patchFaComponentTestingStores
 * Updates only the fields present on the seed payload.
 */
test('Test that patchFaComponentTestingStores merges partial user settings', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }
  const settings = S_FaUserSettings()
  const priorSettings = settings.settings
  if (priorSettings === null) {
    throw new Error('Expected user settings in test')
  }
  const priorHidePlushes = priorSettings.hidePlushes

  patchFaComponentTestingStores(pinia, {
    hideTooltipsProject: true
  })

  const mergedSettings = settings.settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.hideTooltipsProject).toBe(true)
  expect(mergedSettings.hidePlushes).toBe(priorHidePlushes)
})

/**
 * patchFaComponentTestingStores
 * Updates hidePlushes without touching hideTooltipsProject when only that flag is seeded.
 */
test('Test that patchFaComponentTestingStores merges hidePlushes only', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }
  const settings = S_FaUserSettings()
  const priorSettings = settings.settings
  if (priorSettings === null) {
    throw new Error('Expected user settings in test')
  }
  const priorHideTooltipsProject = priorSettings.hideTooltipsProject

  patchFaComponentTestingStores(pinia, {
    hidePlushes: false
  })

  const mergedSettings = settings.settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.hidePlushes).toBe(false)
  expect(mergedSettings.hideTooltipsProject).toBe(priorHideTooltipsProject)
})

test('Test that patchFaComponentTestingStores merges disableAppControlBar only', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }
  const settings = S_FaUserSettings()
  const priorSettings = settings.settings
  if (priorSettings === null) {
    throw new Error('Expected user settings in test')
  }
  const priorHideTooltipsProject = priorSettings.hideTooltipsProject

  patchFaComponentTestingStores(pinia, {
    disableAppControlBar: true
  })

  const mergedSettings = settings.settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.disableAppControlBar).toBe(true)
  expect(mergedSettings.hideTooltipsProject).toBe(priorHideTooltipsProject)
})

test('Test that patchFaComponentTestingStores merges hideTabCloseButton and appTheme', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  patchFaComponentTestingStores(pinia, {
    appTheme: 'lightThemeFlat',
    hideTabCloseButton: true
  })

  const mergedSettings = S_FaUserSettings().settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.hideTabCloseButton).toBe(true)
  expect(mergedSettings.appTheme).toBe('lightThemeFlat')
})

test('Test that patchFaComponentTestingStores merges control-bar function and content button flags', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  patchFaComponentTestingStores(pinia, {
    disableAppControlBarContentButtons: true,
    disableAppControlBarFunctionButtons: true
  })

  const mergedSettings = S_FaUserSettings().settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.disableAppControlBarContentButtons).toBe(true)
  expect(mergedSettings.disableAppControlBarFunctionButtons).toBe(true)
})

test('Test that patchFaComponentTestingStores merges showTabBarScrollButtons', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  patchFaComponentTestingStores(pinia, {
    showTabBarScrollButtons: true
  })

  const mergedSettings = S_FaUserSettings().settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.showTabBarScrollButtons).toBe(true)
})

test('Test that patchFaComponentTestingStores merges hierarchy tree icon hide flags', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  patchFaComponentTestingStores(pinia, {
    hideTreeIconAddUnder: true,
    hideTreeIconEdit: true,
    hideTreeIconView: true
  })

  const mergedSettings = S_FaUserSettings().settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.hideTreeIconAddUnder).toBe(true)
  expect(mergedSettings.hideTreeIconEdit).toBe(true)
  expect(mergedSettings.hideTreeIconView).toBe(true)
})

test('Test that patchFaComponentTestingStores merges hierarchy tree chrome flags', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  patchFaComponentTestingStores(pinia, {
    disableCategoryCount: true,
    disableDocumentCounts: true,
    doubleDashDocCount: true,
    forceSublevelCollapseInTree: true,
    hideDeadCrossThrough: true,
    hideHierarchyTree: true,
    hideTreeLines: true,
    hideTreeOrderNumbers: true,
    invertCategoryPosition: true,
    noProjectName: true
  })

  const mergedSettings = S_FaUserSettings().settings
  if (mergedSettings === null) {
    throw new Error('Expected user settings after patch')
  }
  expect(mergedSettings.disableCategoryCount).toBe(true)
  expect(mergedSettings.disableDocumentCounts).toBe(true)
  expect(mergedSettings.doubleDashDocCount).toBe(true)
  expect(mergedSettings.forceSublevelCollapseInTree).toBe(true)
  expect(mergedSettings.hideDeadCrossThrough).toBe(true)
  expect(mergedSettings.hideHierarchyTree).toBe(true)
  expect(mergedSettings.hideTreeLines).toBe(true)
  expect(mergedSettings.hideTreeOrderNumbers).toBe(true)
  expect(mergedSettings.invertCategoryPosition).toBe(true)
  expect(mergedSettings.noProjectName).toBe(true)
})

test('Test that patchFaComponentTestingStores replaces hierarchy tree session', async () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }
  const { S_FaProjectHierarchyTree } = await import('app/src/stores/S_FaProjectHierarchyTree')

  patchFaComponentTestingStores(pinia, {
    hierarchyTree: {
      uiState: {
        expandedNodeIds: ['world-1'],
        schemaVersion: 1,
        scrollTopPx: 12
      },
      worlds: [
        {
          color: '#ff0000',
          colorPalette: '',
          displayName: 'Seed World',
          groups: [],
          id: 'world-1',
          placements: [],
          sortOrder: 0
        }
      ]
    }
  })

  const hierarchyStore = S_FaProjectHierarchyTree()
  expect(hierarchyStore.worlds).toHaveLength(1)
  expect(hierarchyStore.worlds[0]?.displayName).toBe('Seed World')
  expect(hierarchyStore.uiState.expandedNodeIds).toEqual(['world-1'])
  expect(hierarchyStore.uiState.scrollTopPx).toBe(12)
})

test('Test that patchFaComponentTestingStores installs projectContentOverrides', () => {
  const pinia = getActivePinia()
  if (pinia === undefined) {
    throw new Error('Expected active Pinia in test')
  }

  const seedOverrides = {
    documentsById: {
      'doc-1': {
        createdAtMs: 1,
        displayName: 'Override Doc',
        documentBackgroundColor: null,
        documentTextColor: null,
        extraClasses: '',
        id: 'doc-1',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        parentDocumentId: null,
        placementId: null,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: Number.MIN_SAFE_INTEGER,
        updatedAtMs: 1,
        worldId: 'world-1'
      }
    }
  }

  patchFaComponentTestingStores(pinia, {
    projectContentOverrides: seedOverrides
  })

  const installed = getFaComponentTestingProjectContentOverrides()
  expect(installed?.documentsById?.['doc-1']?.displayName).toBe('Override Doc')
  expect(installed).not.toBe(seedOverrides)
  if (installed?.documentsById?.['doc-1'] !== undefined) {
    installed.documentsById['doc-1'].displayName = 'Mutated'
  }

  patchFaComponentTestingStores(pinia, {
    projectContentOverrides: seedOverrides
  })
  expect(getFaComponentTestingProjectContentOverrides()?.documentsById?.['doc-1']?.displayName)
    .toBe('Override Doc')

  patchFaComponentTestingStores(pinia, {
    projectContentOverrides: null
  })
  expect(getFaComponentTestingProjectContentOverrides()).toBeNull()
})
