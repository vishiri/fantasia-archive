import { afterEach, beforeEach, expect, test } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
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
  S_FaActiveProject().$patch({
    activeProject: {
      filePath: 'C:\\temp.faproject',
      id: 'temp',
      name: 'Temp'
    }
  })

  window.__faComponentTestingPatchStores?.({
    activeProject: null
  })

  expect(S_FaActiveProject().activeProject).toBeNull()
})
