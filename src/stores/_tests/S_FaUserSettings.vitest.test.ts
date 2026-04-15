import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type * as S_FaUserSettingsStore from '../S_FaUserSettings'

const {
  applyLocaleMock,
  notifyCreateMock,
  tMock,
  getSettingsMock,
  setSettingsMock
} = vi.hoisted(() => {
  return {
    applyLocaleMock: vi.fn(),
    notifyCreateMock: vi.fn(),
    tMock: vi.fn((key: string) => key),
    getSettingsMock: vi.fn(async () => ({ ...FA_USER_SETTINGS_DEFAULTS })),
    setSettingsMock: vi.fn(async () => {})
  }
})

vi.mock('quasar', () => {
  return {
    Notify: { create: notifyCreateMock }
  }
})

vi.mock('app/src/scripts/appInternals/rendererAppInternals', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/appInternals/rendererAppInternals')>()
  return {
    ...actual,
    applyFaI18nLocaleFromLanguageCode: applyLocaleMock
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaUserSettingsStore.S_FaUserSettings>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
  applyLocaleMock.mockReset()
  notifyCreateMock.mockReset()
  tMock.mockReset()
  tMock.mockImplementation((key: string) => key)
  getSettingsMock.mockReset()
  getSettingsMock.mockResolvedValue({ ...FA_USER_SETTINGS_DEFAULTS })
  setSettingsMock.mockReset()

  Object.defineProperty(globalThis, 'window', {
    value: {
      faContentBridgeAPIs: {
        faUserSettings: {
          getSettings: getSettingsMock,
          setSettings: setSettingsMock
        }
      }
    },
    configurable: true,
    writable: true
  })

  const stores = await import('../S_FaUserSettings')
  store = stores.S_FaUserSettings()
})

/**
 * S_FaUserSettings / refreshSettings
 * Populates 'settings' from the bridge every time it is called.
 */
test('Test that refreshSettings populates settings from the IPC bridge', async () => {
  const snapshot = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  }
  getSettingsMock.mockResolvedValueOnce(snapshot)

  expect(store.settings).toBeNull()
  await store.refreshSettings()

  expect(getSettingsMock).toHaveBeenCalledOnce()
  expect(store.settings).toEqual(snapshot)
})

/**
 * S_FaUserSettings / refreshSettings
 * Each refresh replaces settings with the latest bridge payload.
 */
test('Test that refreshSettings replaces settings on each call', async () => {
  const firstSnapshot = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  }
  const secondSnapshot = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  }
  getSettingsMock.mockResolvedValueOnce(firstSnapshot).mockResolvedValueOnce(secondSnapshot)

  await store.refreshSettings()
  expect(store.settings).toEqual(firstSnapshot)
  await store.refreshSettings()
  expect(store.settings).toEqual(secondSnapshot)
  expect(getSettingsMock).toHaveBeenCalledTimes(2)
})

/**
 * S_FaUserSettings / updateSettings
 * On a successful save the retrieved settings match the update object, positive notify fires.
 */
test('Test that updateSettings shows positive notify when saved values match the update object', async () => {
  const updateObject = { darkMode: true }
  getSettingsMock.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  })

  await store.updateSettings(updateObject)

  expect(setSettingsMock).toHaveBeenCalledWith(updateObject)
  expect(store.settings?.darkMode).toBe(true)
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'positive',
    message: 'globalFunctionality.faUserSettings.saveSuccess'
  })
})

/**
 * S_FaUserSettings / updateSettings
 * When languageCode saves successfully, i18n switches before the positive notify so the toast string resolves in the new locale.
 */
test('Test that updateSettings applies i18n locale before positive notify when languageCode saves successfully', async () => {
  const callOrder: string[] = []
  applyLocaleMock.mockImplementation(() => {
    callOrder.push('locale')
  })
  notifyCreateMock.mockImplementation(() => {
    callOrder.push('notify')
  })

  const updateObject = { languageCode: 'fr' as const }
  getSettingsMock.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'fr'
  })

  await store.updateSettings(updateObject)

  expect(applyLocaleMock).toHaveBeenCalledWith('fr')
  expect(callOrder).toEqual(['locale', 'notify'])
})

/**
 * S_FaUserSettings / updateSettings
 * When languageCode is patched but the bridge returns a different code, skip locale switch and show save error.
 */
test('Test that updateSettings does not apply i18n locale when languageCode patch mismatches', async () => {
  const updateObject = { languageCode: 'fr' as const }
  getSettingsMock.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    languageCode: 'de'
  })

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings(updateObject)
  consoleErrorSpy.mockRestore()

  expect(applyLocaleMock).not.toHaveBeenCalled()
})

/**
 * S_FaUserSettings / updateSettings
 * When retrieved settings do not match the update object, negative notify fires and error is logged.
 */
test('Test that updateSettings shows negative notify when saved values do not match the update object', async () => {
  const updateObject = { darkMode: true }
  getSettingsMock.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  })

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings(updateObject)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'negative',
    timeout: 0,
    message: 'globalFunctionality.faUserSettings.saveError'
  })
  expect(consoleErrorSpy).toHaveBeenCalledOnce()
  expect(consoleErrorSpy.mock.calls[0][0]).toContain('globalFunctionality.faUserSettings.saveMismatchLog')
  consoleErrorSpy.mockRestore()
})

/**
 * S_FaUserSettings / updateSettings
 * 'settings' is always updated to the retrieved value regardless of update success.
 */
test('Test that updateSettings always replaces settings with the retrieved value from the bridge', async () => {
  const retrievedSettings = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  }
  getSettingsMock.mockResolvedValueOnce(retrievedSettings)

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings({ darkMode: true })
  consoleErrorSpy.mockRestore()

  expect(store.settings).toEqual(retrievedSettings)
})

/**
 * S_FaUserSettings / updateSettings
 * Empty patch uses vacuous key equality so a positive notify still fires after set and get.
 */
test('Test that updateSettings with an empty object shows positive notify and still calls the bridge', async () => {
  getSettingsMock.mockResolvedValueOnce({ ...FA_USER_SETTINGS_DEFAULTS })

  await store.updateSettings({})

  expect(setSettingsMock).toHaveBeenCalledWith({})
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'positive',
    message: 'globalFunctionality.faUserSettings.saveSuccess'
  })
  expect(store.settings).toEqual({ ...FA_USER_SETTINGS_DEFAULTS })
})

/**
 * S_FaUserSettings / updateSettings
 * Mismatch on any updated key triggers the negative path even when other keys match.
 */
test('Test that updateSettings shows negative notify when one of several keys mismatches', async () => {
  const updateObject = {
    darkMode: true,
    compactTags: true
  }
  getSettingsMock.mockResolvedValueOnce({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true,
    compactTags: false
  })

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings(updateObject)
  consoleErrorSpy.mockRestore()

  expect(setSettingsMock).toHaveBeenCalledWith(updateObject)
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'negative',
    timeout: 0,
    message: 'globalFunctionality.faUserSettings.saveError'
  })
})

/**
 * S_FaUserSettings / updateSettings
 * When setSettings rejects, show save error notify, log, skip getSettings, leave settings unchanged.
 */
test('Test that updateSettings shows negative notify when setSettings rejects', async () => {
  setSettingsMock.mockRejectedValueOnce(new Error('ipc failed'))

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings({ darkMode: true })

  expect(setSettingsMock).toHaveBeenCalledOnce()
  expect(getSettingsMock).not.toHaveBeenCalled()
  expect(store.settings).toBeNull()
  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'negative',
    timeout: 0,
    message: 'globalFunctionality.faUserSettings.saveError'
  })
  expect(consoleErrorSpy).toHaveBeenCalledOnce()
  expect(consoleErrorSpy.mock.calls[0][0]).toContain('[S_FaUserSettings] setSettings failed')
  consoleErrorSpy.mockRestore()
})
