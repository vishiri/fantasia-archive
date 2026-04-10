import { beforeEach, expect, test, vi } from 'vitest'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'

const baseSnapshot = {
  COMPONENT_NAME: false,
  COMPONENT_PROPS: false,
  ELECTRON_MAIN_FILEPATH: '/preload-test/electron-main.js',
  FA_FRONTEND_RENDER_TIMER: 3000,
  TEST_ENV: false
}

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

beforeEach(async () => {
  vi.resetModules()
  invokeMock.mockReset()
  invokeMock.mockResolvedValue({ ...baseSnapshot })
})

/**
 * extraEnvVariablesAPI.getSnapshot uses invoke with FA_EXTRA_ENV_IPC.snapshotAsync.
 */
test('Test that extraEnvVariablesAPI getSnapshot uses invoke with FA_EXTRA_ENV_IPC.snapshotAsync', async () => {
  const { extraEnvVariablesAPI } = await import('../extraEnvVariablesAPI')
  const snap = await extraEnvVariablesAPI.getSnapshot()

  expect(invokeMock).toHaveBeenCalledWith(FA_EXTRA_ENV_IPC.snapshotAsync)
  expect(snap.ELECTRON_MAIN_FILEPATH).toBe(baseSnapshot.ELECTRON_MAIN_FILEPATH)
  expect(snap.FA_FRONTEND_RENDER_TIMER).toBe(3000)
  expect(snap.TEST_ENV).toBe(false)
  expect(snap.COMPONENT_NAME).toBe(false)
  expect(snap.COMPONENT_PROPS).toBe(false)
})

/**
 * extraEnvVariablesAPI.getSnapshot reflects invoke return payload.
 */
test('Test that extraEnvVariablesAPI getSnapshot reflects invoke return payload', async () => {
  invokeMock.mockResolvedValue({
    ...baseSnapshot,
    COMPONENT_NAME: 'X',
    COMPONENT_PROPS: {
      a: 1
    },
    TEST_ENV: 'components'
  })
  const { extraEnvVariablesAPI: api } = await import('../extraEnvVariablesAPI')
  const snap = await api.getSnapshot()

  expect(snap.TEST_ENV).toBe('components')
  expect(snap.COMPONENT_NAME).toBe('X')
  expect(snap.COMPONENT_PROPS).toEqual({
    a: 1
  })
})

/**
 * Second getSnapshot reuses the same memoized promise (single invoke for two awaits).
 */
test('Test that extraEnvVariablesAPI getSnapshot memoizes invoke', async () => {
  const { extraEnvVariablesAPI } = await import('../extraEnvVariablesAPI')

  await extraEnvVariablesAPI.getSnapshot()
  await extraEnvVariablesAPI.getSnapshot()

  expect(invokeMock).toHaveBeenCalledTimes(1)
})

/**
 * getCachedSnapshot is null before the first successful getSnapshot resolve.
 */
test('Test that extraEnvVariablesAPI getCachedSnapshot is null before getSnapshot', async () => {
  const { extraEnvVariablesAPI } = await import('../extraEnvVariablesAPI')

  expect(extraEnvVariablesAPI.getCachedSnapshot()).toBeNull()
})

/**
 * getCachedSnapshot returns the same payload as the last resolved getSnapshot.
 */
test('Test that extraEnvVariablesAPI getCachedSnapshot matches resolved getSnapshot', async () => {
  invokeMock.mockResolvedValue({
    ...baseSnapshot,
    TEST_ENV: 'e2e'
  })
  const { extraEnvVariablesAPI } = await import('../extraEnvVariablesAPI')

  const awaited = await extraEnvVariablesAPI.getSnapshot()

  expect(extraEnvVariablesAPI.getCachedSnapshot()).toEqual(awaited)
  expect(extraEnvVariablesAPI.getCachedSnapshot()?.TEST_ENV).toBe('e2e')
})
