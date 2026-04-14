import { beforeEach, expect, test, vi } from 'vitest'

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

import { FA_KEYBINDS_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import type { I_faKeybindsSnapshot } from 'app/types/I_faKeybindsDomain'

import { faKeybindsAPI } from '../faKeybindsAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faKeybindsAPI
 * getKeybinds delegates to ipcRenderer.invoke on the get channel.
 */
test('faKeybindsAPI getKeybinds invokes IPC get channel', async () => {
  const snapshot: I_faKeybindsSnapshot = {
    platform: 'win32',
    store: { ...FA_KEYBINDS_STORE_DEFAULTS }
  }
  invokeMock.mockResolvedValueOnce(snapshot)
  await expect(faKeybindsAPI.getKeybinds()).resolves.toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_KEYBINDS_IPC.getAsync)
})

/**
 * faKeybindsAPI
 * setKeybinds sends a structured-clone-safe plain object to IPC.
 */
test('faKeybindsAPI setKeybinds invokes IPC set channel with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  const patch = {
    overrides: {
      openProgramSettings: {
        code: 'KeyQ',
        mods: ['ctrl' as const]
      }
    },
    replaceAllOverrides: true
  }
  await faKeybindsAPI.setKeybinds(patch)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_KEYBINDS_IPC.setAsync,
    patch
  )
})

/**
 * faKeybindsAPI
 * getKeybinds propagates invoke rejection.
 */
test('faKeybindsAPI getKeybinds rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(faKeybindsAPI.getKeybinds()).rejects.toThrow('ipc failed')
})

/**
 * faKeybindsAPI
 * setKeybinds propagates invoke rejection.
 */
test('faKeybindsAPI setKeybinds rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(
    faKeybindsAPI.setKeybinds({
      replaceAllOverrides: true,
      overrides: {}
    })
  ).rejects.toThrow('ipc failed')
})
