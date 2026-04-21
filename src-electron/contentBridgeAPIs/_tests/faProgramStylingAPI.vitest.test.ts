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

import { FA_PROGRAM_STYLING_IPC } from 'app/src-electron/electron-ipc-bridge'
import { FA_PROGRAM_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/programStyling/faProgramStylingStoreDefaults'
import type { I_faProgramStylingRoot } from 'app/types/I_faProgramStylingDomain'

import { faProgramStylingAPI } from '../faProgramStylingAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faProgramStylingAPI
 * getProgramStyling delegates to ipcRenderer.invoke on the get channel.
 */
test('faProgramStylingAPI getProgramStyling invokes IPC get channel', async () => {
  const snapshot: I_faProgramStylingRoot = { ...FA_PROGRAM_STYLING_STORE_DEFAULTS }
  invokeMock.mockResolvedValueOnce(snapshot)

  await expect(faProgramStylingAPI.getProgramStyling()).resolves.toEqual(snapshot)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROGRAM_STYLING_IPC.getAsync)
})

/**
 * faProgramStylingAPI
 * setProgramStyling sends a structured-clone-safe plain object to IPC.
 */
test('faProgramStylingAPI setProgramStyling invokes IPC set channel with cloned patch', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  const patch = { css: 'body { color: red; }' }

  await faProgramStylingAPI.setProgramStyling(patch)

  expect(invokeMock).toHaveBeenCalledTimes(1)
  const [channel, sentPatch] = invokeMock.mock.calls[0] as [string, { css: string }]
  expect(channel).toBe(FA_PROGRAM_STYLING_IPC.setAsync)
  expect(sentPatch).toEqual(patch)
  expect(sentPatch).not.toBe(patch)
})

/**
 * faProgramStylingAPI
 * getProgramStyling propagates invoke rejection.
 */
test('faProgramStylingAPI getProgramStyling rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(faProgramStylingAPI.getProgramStyling()).rejects.toThrow('ipc failed')
})

/**
 * faProgramStylingAPI
 * setProgramStyling propagates invoke rejection.
 */
test('faProgramStylingAPI setProgramStyling rejects when invoke rejects', async () => {
  invokeMock.mockRejectedValueOnce(new Error('ipc failed'))
  await expect(
    faProgramStylingAPI.setProgramStyling({ css: 'broken' })
  ).rejects.toThrow('ipc failed')
})
