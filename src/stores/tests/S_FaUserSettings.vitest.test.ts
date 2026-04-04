import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/faUserSettingsDefaults'
import type * as S_FaUserSettingsStore from '../S_FaUserSettings'

const { notifyCreateMock, tMock, getSettingsMock, setSettingsMock } = vi.hoisted(() => {
  return {
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

vi.mock('app/src/i18n/externalFileLoader', () => {
  return {
    i18n: { global: { t: tMock } }
  }
})

let store: ReturnType<typeof S_FaUserSettingsStore.S_FaUserSettings>

beforeEach(async () => {
  setActivePinia(createPinia())
  vi.resetModules()
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
  const snapshot = { ...FA_USER_SETTINGS_DEFAULTS, darkMode: true }
  getSettingsMock.mockResolvedValueOnce(snapshot)

  expect(store.settings).toBeNull()
  await store.refreshSettings()

  expect(getSettingsMock).toHaveBeenCalledOnce()
  expect(store.settings).toEqual(snapshot)
})

/**
 * S_FaUserSettings / updateSettings
 * On a successful save the retrieved settings match the update object, positive notify fires.
 */
test('Test that updateSettings shows positive notify when saved values match the update object', async () => {
  const updateObject = { darkMode: true }
  getSettingsMock.mockResolvedValueOnce({ ...FA_USER_SETTINGS_DEFAULTS, darkMode: true })

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
 * When retrieved settings do not match the update object, negative notify fires and error is logged.
 */
test('Test that updateSettings shows negative notify when saved values do not match the update object', async () => {
  const updateObject = { darkMode: true }
  getSettingsMock.mockResolvedValueOnce({ ...FA_USER_SETTINGS_DEFAULTS, darkMode: false })

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings(updateObject)

  expect(notifyCreateMock).toHaveBeenCalledOnce()
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'negative',
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
  const retrievedSettings = { ...FA_USER_SETTINGS_DEFAULTS, darkMode: false }
  getSettingsMock.mockResolvedValueOnce(retrievedSettings)

  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  await store.updateSettings({ darkMode: true })
  consoleErrorSpy.mockRestore()

  expect(store.settings).toEqual(retrievedSettings)
})
