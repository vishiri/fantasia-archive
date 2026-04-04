import { vi, expect, test } from 'vitest'

const { exposeInMainWorldMock } = vi.hoisted(() => {
  return {
    exposeInMainWorldMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    contextBridge: {
      exposeInMainWorld: exposeInMainWorldMock
    },
    ipcRenderer: {
      invoke: vi.fn(),
      sendSync: vi.fn()
    },
    shell: {
      openExternal: vi.fn()
    }
  }
})

vi.mock('@electron/remote', () => {
  return {
    app: {
      getVersion: () => '0.0.0-preload-test'
    },
    getCurrentWindow: () => null,
    BrowserWindow: {
      getFocusedWindow: () => null
    }
  }
})

vi.mock('app-root-path', () => {
  return {
    default: '/electron-preload-test-root'
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
      'faUserSettings',
      'faWindowControl'
    ].sort()
  )
})
