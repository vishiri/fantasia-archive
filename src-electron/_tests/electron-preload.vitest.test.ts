import { expect, test, vi } from 'vitest'

const { exposeInMainWorldMock, invokeMock } = vi.hoisted(() => {
  return {
    exposeInMainWorldMock: vi.fn(),
    invokeMock: vi.fn(() => Promise.resolve())
  }
})

vi.mock('electron', () => {
  return {
    contextBridge: {
      exposeInMainWorld: exposeInMainWorldMock
    },
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

/**
 * electron-preload
 * contextBridge exposes faContentBridgeAPIs with the expected top-level API keys.
 */
test('Test that electron preload exposes faContentBridgeAPIs with expected API keys', async () => {
  await import('../electron-preload')

  expect(exposeInMainWorldMock).toHaveBeenCalledOnce()
  expect(exposeInMainWorldMock.mock.calls[0][0]).toBe('faContentBridgeAPIs')

  const apiObject = exposeInMainWorldMock.mock.calls[0][1]
  expect(Object.keys(apiObject).sort()).toEqual(
    [
      'appDetails',
      'extraEnvVariables',
      'faDevToolsControl',
      'faExternalLinksManager',
      'faKeybinds',
      'faProgramConfig',
      'faProgramStyling',
      'faUserSettings',
      'faWindowControl',
      'projectManagement'
    ].sort()
  )

  for (const key of Object.keys(apiObject) as Array<keyof typeof apiObject>) {
    expect(apiObject[key]).toBeTypeOf('object')
    expect(apiObject[key]).not.toBeNull()
  }
})
