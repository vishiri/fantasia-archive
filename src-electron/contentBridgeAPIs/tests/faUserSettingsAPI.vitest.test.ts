import { vi, expect, test, beforeEach } from 'vitest'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

import { FA_USER_SETTINGS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/faUserSettingsDefaults'

import { faUserSettingsAPI } from '../faUserSettingsAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faUserSettingsAPI
 * 'getSettings' delegates to 'ipcRenderer.invoke' with the get channel.
 */
test('faUserSettingsAPI getSettings invokes IPC get channel', async () => {
  const snapshot = {
    ...FA_USER_SETTINGS_DEFAULTS,
    darkMode: true
  }
  invokeMock.mockResolvedValueOnce(snapshot)
  await expect(faUserSettingsAPI.getSettings()).resolves.toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_USER_SETTINGS_IPC.getAsync)
})

/**
 * faUserSettingsAPI
 * 'setSettings' delegates to 'ipcRenderer.invoke' with the set channel and patch.
 */
test('faUserSettingsAPI setSettings invokes IPC set channel with patch', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  await faUserSettingsAPI.setSettings({ darkMode: false })
  expect(invokeMock).toHaveBeenCalledWith(FA_USER_SETTINGS_IPC.setAsync, { darkMode: false })
})
