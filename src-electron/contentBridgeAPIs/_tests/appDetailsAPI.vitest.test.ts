import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn(() => Promise.resolve('1.0.0'))
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

beforeEach(async () => {
  vi.resetModules()
  invokeMock.mockReset()
  invokeMock.mockResolvedValue('1.0.0')
})

/**
 * getProjectVersion returns string from invoke.
 */
test('Test if appDetailsAPI getProjectVersion returns correct value', async () => {
  const { appDetailsAPI } = await import('../appDetailsAPI')
  const v = await appDetailsAPI.getProjectVersion()

  expect(v).toBeTypeOf('string')
  expect(v).toBe('1.0.0')
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_DETAILS_IPC.getVersionAsync)
})

/**
 * Fresh module load picks up a new invoke return value after resetModules.
 */
test('Test if appDetailsAPI getProjectVersion follows invoke on re-import', async () => {
  invokeMock.mockResolvedValue('9.8.7')
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')

  await expect(reloaded.getProjectVersion()).resolves.toBe('9.8.7')
})

/**
 * Non-string invoke result becomes empty string.
 */
test('Test that appDetailsAPI getProjectVersion is empty when invoke returns non-string', async () => {
  invokeMock.mockResolvedValue(123 as unknown as string)
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')

  await expect(reloaded.getProjectVersion()).resolves.toBe('')
})

/**
 * invoke reject yields empty string.
 */
test('Test that appDetailsAPI getProjectVersion is empty when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')

  await expect(reloaded.getProjectVersion()).resolves.toBe('')
})

/**
 * Second getProjectVersion reuses memoized promise (single invoke).
 */
test('Test that appDetailsAPI getProjectVersion memoizes invoke', async () => {
  const { appDetailsAPI } = await import('../appDetailsAPI')

  await appDetailsAPI.getProjectVersion()
  await appDetailsAPI.getProjectVersion()

  expect(invokeMock).toHaveBeenCalledTimes(1)
})
