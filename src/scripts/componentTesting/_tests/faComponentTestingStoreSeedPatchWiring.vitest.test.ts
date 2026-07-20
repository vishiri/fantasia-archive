import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { patchFaComponentTestingStores } from '../faComponentTestingStoreSeedPatchWiring'

beforeEach(() => {
  const pinia = createPinia()
  setActivePinia(pinia)
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
