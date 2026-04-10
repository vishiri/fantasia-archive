import { beforeEach, expect, test, vi } from 'vitest'

import { FA_DEVTOOLS_IPC } from 'app/src-electron/electron-ipc-bridge'

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
})

test('Test that checkDevToolsStatus returns false if invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.checkDevToolsStatus()).resolves.toBe(false)
})

test('Test that checkDevToolsStatus returns true when IPC reports dev tools are open', async () => {
  invokeMock.mockResolvedValue(true)
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.checkDevToolsStatus()).resolves.toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.statusAsync)
})

/**
 * invoke must return strict true; false means closed.
 */
test('Test that checkDevToolsStatus returns false when IPC reports dev tools are closed', async () => {
  invokeMock.mockResolvedValue(false)
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.checkDevToolsStatus()).resolves.toBe(false)
})

test('Test that checkDevToolsStatus returns false when invoke returns undefined', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.checkDevToolsStatus()).resolves.toBe(false)
})

test('Test that checkDevToolsStatus returns false when invoke returns a truthy string', async () => {
  invokeMock.mockResolvedValue('yes')
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.checkDevToolsStatus()).resolves.toBe(false)
})

test('Test that toggleDevTools calls IPC toggle channel', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await faDevToolsControlAPI.toggleDevTools()

  expect(invokeMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.toggleAsync)
})

/**
 * No-op when invoke rejects.
 */
test('Test that toggleDevTools does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.toggleDevTools()).resolves.toBeUndefined()
})

/**
 * No-op when invoke rejects.
 */
test('Test that openDevTools does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.openDevTools()).resolves.toBeUndefined()
})

/**
 * No-op when invoke rejects.
 */
test('Test that closeDevTools does not throw when invoke rejects', async () => {
  invokeMock.mockRejectedValue(new Error('ipc failed'))
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await expect(faDevToolsControlAPI.closeDevTools()).resolves.toBeUndefined()
})

test('Test that openDevTools and closeDevTools call IPC channels', async () => {
  invokeMock.mockResolvedValue(undefined)
  const { faDevToolsControlAPI } = await import('../faDevToolsControlAPI')

  await faDevToolsControlAPI.openDevTools()
  await faDevToolsControlAPI.closeDevTools()

  expect(invokeMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.openAsync)
  expect(invokeMock).toHaveBeenCalledWith(FA_DEVTOOLS_IPC.closeAsync)
})
