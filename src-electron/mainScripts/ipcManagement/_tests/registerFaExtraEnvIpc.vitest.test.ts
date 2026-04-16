import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_EXTRA_ENV_IPC } from 'app/src-electron/electron-ipc-bridge'

const mocks = vi.hoisted(() => {
  const ipcMainHandleMock = vi.fn()

  return {
    ipcMainHandleMock,
    resolveMainMock: vi.fn(() => '/unpackaged/electron-main.js')
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/resolveFaElectronMainJsPath', () => {
  return {
    resolveFaElectronMainJsPath: mocks.resolveMainMock
  }
})

vi.mock('electron', () => {
  return {
    ipcMain: {
      handle: mocks.ipcMainHandleMock
    }
  }
})

beforeEach(() => {
  vi.resetModules()
  mocks.ipcMainHandleMock.mockReset()
  mocks.resolveMainMock.mockClear()
  mocks.resolveMainMock.mockReturnValue('/unpackaged/electron-main.js')
  vi.unstubAllEnvs()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = mocks.ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()

  return call?.[1] as (...args: unknown[]) => unknown
}

/**
 * registerFaExtraEnvIpc
 * Subscribes snapshotAsync once.
 */
test('Test that registerFaExtraEnvIpc registers snapshotAsync channel once', async () => {
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  expect(mocks.ipcMainHandleMock).toHaveBeenCalledOnce()
  expect(mocks.ipcMainHandleMock.mock.calls[0][0]).toBe(FA_EXTRA_ENV_IPC.snapshotAsync)
})

/**
 * registerFaExtraEnvIpc
 * Second registration is a no-op.
 */
test('Test that registerFaExtraEnvIpc skips duplicate registration', async () => {
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()
  const afterFirst = mocks.ipcMainHandleMock.mock.calls.length
  registerFaExtraEnvIpc()
  expect(mocks.ipcMainHandleMock.mock.calls.length).toBe(afterFirst)
})

/**
 * registerFaExtraEnvIpc
 * Snapshot uses resolveFaElectronMainJsPath and default timer.
 */
test('Test that registerFaExtraEnvIpc snapshot sets path and timer', async () => {
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(mocks.resolveMainMock).toHaveBeenCalledOnce()
  expect(result).toEqual({
    COMPONENT_NAME: false,
    COMPONENT_PROPS: false,
    ELECTRON_MAIN_FILEPATH: '/unpackaged/electron-main.js',
    FA_FRONTEND_RENDER_TIMER: 3000,
    TEST_ENV: false
  })
})

/**
 * registerFaExtraEnvIpc
 * TEST_ENV and COMPONENT_NAME reflect process.env when set.
 */
test('Test that registerFaExtraEnvIpc snapshot reads TEST_ENV and COMPONENT_NAME', async () => {
  vi.stubEnv('TEST_ENV', 'components')
  vi.stubEnv('COMPONENT_NAME', 'MyComponent')
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(result).toMatchObject({
    COMPONENT_NAME: 'MyComponent',
    TEST_ENV: 'components'
  })
})

/**
 * registerFaExtraEnvIpc
 * Empty env strings map to false.
 */
test('Test that registerFaExtraEnvIpc snapshot treats empty env strings as false', async () => {
  vi.stubEnv('TEST_ENV', '')
  vi.stubEnv('COMPONENT_NAME', '')
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(result).toMatchObject({
    COMPONENT_NAME: false,
    TEST_ENV: false
  })
})

/**
 * registerFaExtraEnvIpc
 * Empty COMPONENT_PROPS skips JSON and yields false.
 */
test('Test that registerFaExtraEnvIpc snapshot treats empty COMPONENT_PROPS as false', async () => {
  vi.stubEnv('COMPONENT_PROPS', '')
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(result).toMatchObject({
    COMPONENT_PROPS: false
  })
})

/**
 * registerFaExtraEnvIpc
 * COMPONENT_PROPS parses valid JSON.
 */
test('Test that registerFaExtraEnvIpc snapshot parses COMPONENT_PROPS JSON', async () => {
  vi.stubEnv('COMPONENT_PROPS', '{"a":1,"b":"two"}')
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(result).toMatchObject({
    COMPONENT_PROPS: {
      a: 1,
      b: 'two'
    }
  })
})

/**
 * registerFaExtraEnvIpc
 * Invalid COMPONENT_PROPS JSON maps to false so the IPC handler stays stable.
 */
test('Test that registerFaExtraEnvIpc snapshot treats invalid COMPONENT_PROPS JSON as false', async () => {
  vi.stubEnv('COMPONENT_PROPS', 'not-valid-json{')
  const { registerFaExtraEnvIpc } = await import('../registerFaExtraEnvIpc')
  registerFaExtraEnvIpc()

  const result = handlerFor(FA_EXTRA_ENV_IPC.snapshotAsync)()

  expect(result).toMatchObject({
    COMPONENT_PROPS: false
  })
})
