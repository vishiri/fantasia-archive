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

import { FA_APP_NOTEBOARD_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_managerDefaults'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'

import { faAppNoteboardAPI } from '../faAppNoteboardAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faAppNoteboardAPI
 * getNoteboard delegates to ipcRenderer.invoke on the get channel.
 */
test('Test that faAppNoteboardAPI getNoteboard invokes IPC get channel', async () => {
  const snapshot: I_faAppNoteboardRoot = { ...FA_APP_NOTEBOARD_STORE_DEFAULTS }
  invokeMock.mockResolvedValueOnce(snapshot)

  await expect(faAppNoteboardAPI.getNoteboard()).resolves.toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_NOTEBOARD_IPC.getAsync)
})

/**
 * faAppNoteboardAPI
 * setNoteboard sends a structured-clone-safe plain object to IPC.
 */
test('Test that faAppNoteboardAPI setNoteboard invokes IPC set channel with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  const patch = { text: 'note ' }

  await faAppNoteboardAPI.setNoteboard(patch)

  expect(invokeMock).toHaveBeenCalledTimes(1)
  const [channel, sentPatch] = invokeMock.mock.calls[0]! as [string, { text: string }]
  expect(channel).toBe(FA_APP_NOTEBOARD_IPC.setAsync)
  expect(sentPatch).toEqual(patch)
  expect(sentPatch).not.toBe(patch)
})

/**
 * faAppNoteboardAPI
 * getNoteboard propagates invoke rejection.
 */
test('Test that faAppNoteboardAPI getNoteboard rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(faAppNoteboardAPI.getNoteboard()).rejects.toThrow('ipc failed')
})

/**
 * faAppNoteboardAPI
 * setNoteboard propagates invoke rejection.
 */
test('Test that faAppNoteboardAPI setNoteboard rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(
    faAppNoteboardAPI.setNoteboard({ text: 'broken' })
  ).rejects.toThrow('ipc failed')
})
