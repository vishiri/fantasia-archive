import { vi, expect, test, beforeEach } from 'vitest'

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faUserSettings } from 'app/types/I_faUserSettings'

import { FA_USER_SETTINGS_DEFAULTS } from '../faUserSettingsDefaults'

const { ipcMainHandleMock, getFaUserSettingsMock, storeSetMock } = vi.hoisted(() => {
  return {
    ipcMainHandleMock: vi.fn(),
    getFaUserSettingsMock: vi.fn(),
    storeSetMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('app/src-electron/mainScripts/userSettingsStore', () => {
  return {
    getFaUserSettings: getFaUserSettingsMock
  }
})

beforeEach(async () => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  storeSetMock.mockReset()
  getFaUserSettingsMock.mockReset()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call?.[1] as (...args: unknown[]) => unknown
}

/**
 * registerFaUserSettingsIpc
 * Get handler returns a shallow snapshot of the full 'electron-store' object, not a manual key list.
 */
test('Test that user settings get handler returns all keys from the backing store', async () => {
  const store = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true,
    futureKey: true
  } as I_faUserSettings & Record<string, boolean>
  getFaUserSettingsMock.mockReturnValue({
    store,
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const getHandler = handlerFor(FA_USER_SETTINGS_IPC.getAsync)
  const snapshot = getHandler() as typeof store

  expect(snapshot).toEqual(store)
  expect(snapshot).not.toBe(store)
})

/**
 * registerFaUserSettingsIpc
 * Set handler merges the patch onto the current full snapshot before persisting.
 */
test('Test that user settings set handler writes merged store state', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: {
      ...FA_USER_SETTINGS_DEFAULTS,
      darkMode: true
    },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()

  const setHandler = handlerFor(FA_USER_SETTINGS_IPC.setAsync)
  setHandler({}, { darkMode: false })

  expect(storeSetMock).toHaveBeenCalledOnce()
  expect(storeSetMock).toHaveBeenCalledWith({
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: false
  })
})

/**
 * registerFaUserSettingsIpc
 * Second registration does not register duplicate IPC handlers.
 */
test('Test that registerFaUserSettingsIpc only wires handlers once', async () => {
  getFaUserSettingsMock.mockReturnValue({
    store: { ...FA_USER_SETTINGS_DEFAULTS },
    set: storeSetMock
  })

  const { registerFaUserSettingsIpc } = await import('../registerFaUserSettingsIpc')
  registerFaUserSettingsIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)

  registerFaUserSettingsIpc()
  expect(ipcMainHandleMock).toHaveBeenCalledTimes(2)
})
