import { vi, expect, test, beforeEach } from 'vitest'

import { FA_APP_DETAILS_IPC } from 'app/src-electron/electron-ipc-bridge'

const { sendSyncMock } = vi.hoisted(() => {
  return {
    sendSyncMock: vi.fn(() => '1.0.0')
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      sendSync: sendSyncMock
    }
  }
})

beforeEach(() => {
  sendSyncMock.mockReset()
})

/**
 * appDetailsAPI
 * PROJECT_VERSION reflects sendSync at module load.
 */
test('Test if appDetailsAPI is returning correct value - PROJECT_VERSION', async () => {
  sendSyncMock.mockReturnValue('1.0.0')
  vi.resetModules()
  const { appDetailsAPI } = await import('../appDetailsAPI')

  expect(appDetailsAPI.PROJECT_VERSION).toBeTypeOf('string')
  expect(appDetailsAPI.PROJECT_VERSION).toBe('1.0.0')
  expect(sendSyncMock).toHaveBeenCalledWith(FA_APP_DETAILS_IPC.getVersionSync)
})

/**
 * appDetailsAPI
 * Fresh module load picks up a new sendSync return value after resetModules.
 */
test('Test if appDetailsAPI PROJECT_VERSION follows sendSync on re-import', async () => {
  sendSyncMock.mockReturnValue('9.8.7')
  vi.resetModules()
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')
  expect(reloaded.PROJECT_VERSION).toBe('9.8.7')
})

/**
 * appDetailsAPI
 * Non-string sendSync result becomes empty PROJECT_VERSION.
 */
test('Test that appDetailsAPI PROJECT_VERSION is empty when sendSync returns non-string', async () => {
  sendSyncMock.mockReturnValue(123 as unknown as string)
  vi.resetModules()
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')
  expect(reloaded.PROJECT_VERSION).toBe('')
})

/**
 * appDetailsAPI
 * sendSync throw yields empty PROJECT_VERSION on re-import.
 */
test('Test that appDetailsAPI PROJECT_VERSION is empty when sendSync throws', async () => {
  sendSyncMock.mockImplementation(() => {
    throw new Error('no ipc')
  })
  vi.resetModules()
  const { appDetailsAPI: reloaded } = await import('../appDetailsAPI')
  expect(reloaded.PROJECT_VERSION).toBe('')
})
