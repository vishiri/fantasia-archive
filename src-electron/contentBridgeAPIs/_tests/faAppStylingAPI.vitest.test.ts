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

import { FA_APP_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/faAppStylingStoreDefaults'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'

import { faAppStylingAPI } from '../faAppStylingAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faAppStylingAPI
 * getAppStyling delegates to ipcRenderer.invoke on the get channel.
 */
test('faAppStylingAPI getAppStyling invokes IPC get channel', async () => {
  const snapshot: I_faAppStylingRoot = { ...FA_APP_STYLING_STORE_DEFAULTS }
  invokeMock.mockResolvedValueOnce(snapshot)

  await expect(faAppStylingAPI.getAppStyling()).resolves.toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_STYLING_IPC.getAsync)
})

/**
 * faAppStylingAPI
 * setAppStyling sends a structured-clone-safe plain object to IPC.
 */
test('faAppStylingAPI setAppStyling invokes IPC set channel with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  const patch = { css: 'body { color: red; }' }

  await faAppStylingAPI.setAppStyling(patch)

  expect(invokeMock).toHaveBeenCalledTimes(1)
  const [channel, sentPatch] = invokeMock.mock.calls[0] as [string, { css: string }]
  expect(channel).toBe(FA_APP_STYLING_IPC.setAsync)
  expect(sentPatch).toEqual(patch)
  expect(sentPatch).not.toBe(patch)
})

/**
 * faAppStylingAPI
 * getAppStyling propagates invoke rejection.
 */
test('faAppStylingAPI getAppStyling rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(faAppStylingAPI.getAppStyling()).rejects.toThrow('ipc failed')
})

/**
 * faAppStylingAPI
 * setAppStyling propagates invoke rejection.
 */
test('faAppStylingAPI setAppStyling rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(
    faAppStylingAPI.setAppStyling({ css: 'broken' })
  ).rejects.toThrow('ipc failed')
})
