import { vi, expect, test, beforeEach } from 'vitest'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'

const { sendSyncMock } = vi.hoisted(() => {
  return {
    sendSyncMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      sendSync: sendSyncMock
    }
  }
})

const baseSnapshot = {
  COMPONENT_NAME: false,
  COMPONENT_PROPS: false,
  ELECTRON_MAIN_FILEPATH: '/snap/electron-main.js',
  FA_FRONTEND_RENDER_TIMER: 3000,
  TEST_ENV: false
} as const

beforeEach(() => {
  sendSyncMock.mockReset()
  sendSyncMock.mockReturnValue({ ...baseSnapshot })
})

/**
 * extraEnvVariablesAPI
 * Preload asks main for the snapshot on the canonical sync channel.
 */
test('Test that extraEnvVariablesAPI uses sendSync with FA_EXTRA_ENV_IPC.snapshotSync', async () => {
  vi.resetModules()
  const { extraEnvVariablesAPI } = await import('../extraEnvVariablesAPI')

  expect(sendSyncMock).toHaveBeenCalledWith(FA_EXTRA_ENV_IPC.snapshotSync)
  expect(extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH).toBe(baseSnapshot.ELECTRON_MAIN_FILEPATH)
  expect(extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER).toBe(3000)
  expect(extraEnvVariablesAPI.TEST_ENV).toBe(false)
  expect(extraEnvVariablesAPI.COMPONENT_NAME).toBe(false)
  expect(extraEnvVariablesAPI.COMPONENT_PROPS).toBe(false)
})

/**
 * extraEnvVariablesAPI
 * Return value from main is passed through as the exposed object shape.
 */
test('Test that extraEnvVariablesAPI reflects sendSync return payload', async () => {
  sendSyncMock.mockReturnValue({
    COMPONENT_NAME: 'X',
    COMPONENT_PROPS: {
      a: 1
    },
    ELECTRON_MAIN_FILEPATH: '/other/main.js',
    FA_FRONTEND_RENDER_TIMER: 3000,
    TEST_ENV: 'components'
  })
  vi.resetModules()
  const { extraEnvVariablesAPI: api } = await import('../extraEnvVariablesAPI')

  expect(api.ELECTRON_MAIN_FILEPATH).toBe('/other/main.js')
  expect(api.TEST_ENV).toBe('components')
  expect(api.COMPONENT_NAME).toBe('X')
  expect(api.COMPONENT_PROPS).toEqual({
    a: 1
  })
})
