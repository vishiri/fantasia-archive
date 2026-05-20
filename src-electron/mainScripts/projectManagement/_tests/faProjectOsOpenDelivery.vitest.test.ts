import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_PROJECT_OS_OPEN_IPC } from 'app/src-electron/electron-ipc-bridge'

const existsSyncMock = vi.hoisted(() => vi.fn(() => true))
const webContentsSendMock = vi.hoisted(() => vi.fn())
const isDestroyedMock = vi.hoisted(() => vi.fn(() => false))

vi.mock('node:fs', () => {
  return {
    default: {
      existsSync: existsSyncMock
    },
    existsSync: existsSyncMock
  }
})

const appOnHandlers: Record<string, (...args: unknown[]) => void> = {}
const appWhenReadyMock = vi.hoisted(() => vi.fn(() => Promise.resolve()))
const appOnMock = vi.hoisted(() =>
  vi.fn((event: string, handler: (...args: unknown[]) => void) => {
    appOnHandlers[event] = handler
  })
)

vi.mock('electron', () => {
  return {
    app: {
      on: appOnMock,
      whenReady: appWhenReadyMock
    }
  }
})

function absFaProjectFixture (stem: string): string {
  if (process.platform === 'win32') {
    return `D:\\fa-os-${stem}.faproject`
  }
  return `/tmp/fa-os-${stem}.faproject`
}

beforeEach(() => {
  vi.resetModules()
  existsSyncMock.mockReset()
  existsSyncMock.mockReturnValue(true)
  webContentsSendMock.mockReset()
  isDestroyedMock.mockReset()
  isDestroyedMock.mockReturnValue(false)
  appWhenReadyMock.mockReset()
  appWhenReadyMock.mockImplementation(() => Promise.resolve())
  appOnMock.mockReset()
  for (const key of Object.keys(appOnHandlers)) {
    delete appOnHandlers[key]
  }
  vi.unstubAllEnvs()
  Reflect.deleteProperty(process.env, 'TEST_ENV')
  Reflect.deleteProperty(process.env, 'DEV')
  Reflect.deleteProperty(process.env, 'FA_DEV_OPEN_FAPROJECT')
  Reflect.deleteProperty(process.env, 'FA_E2E_OS_OPEN')
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: 'linux'
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * Flushes to the renderer after the window is registered, the path exists, and renderer reported ready.
 */
test('Test that enqueue and renderer ready sends openFromOsToRenderer once', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  const fp = absFaProjectFixture('foo')
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.enqueueFaProjectOsOpenPath(fp)
  expect(webContentsSendMock).not.toHaveBeenCalled()
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: fp }
  )
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * did-finish-load triggers tryFlush (renderer may not be ready yet).
 */
test('Test that did-finish-load handler runs tryFlush before renderer ready', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  const fp = absFaProjectFixture('did-finish')
  mod.registerFaProjectOsOpenMainWindow(win as never)
  const didFinishLoad = win.webContents.on.mock.calls.find(
    (call) => call[0] === 'did-finish-load'
  )?.[1] as () => void
  expect(didFinishLoad).toBeTypeOf('function')
  mod.enqueueFaProjectOsOpenPath(fp)
  didFinishLoad()
  expect(webContentsSendMock).not.toHaveBeenCalled()
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: fp }
  )
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * Skips send when webContents is destroyed.
 */
test('Test that flush no-ops when webContents is destroyed', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  isDestroyedMock.mockReturnValue(true)
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.enqueueFaProjectOsOpenPath(absFaProjectFixture('bar'))
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).not.toHaveBeenCalled()
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * Does not queue when the file is missing on disk.
 */
test('Test that enqueue ignores paths that fail existsSync', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  existsSyncMock.mockReturnValue(false)
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.enqueueFaProjectOsOpenPath(absFaProjectFixture('missing'))
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).not.toHaveBeenCalled()
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * Rejects paths that do not look like a project file before existsSync.
 */
test('Test that enqueue ignores paths that fail pathLooksLikeFaProjectFile', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  existsSyncMock.mockReturnValue(true)
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  if (process.platform === 'win32') {
    mod.enqueueFaProjectOsOpenPath('D:\\tmp\\notes.txt')
  } else {
    mod.enqueueFaProjectOsOpenPath('/tmp/notes.txt')
  }
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).not.toHaveBeenCalled()
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * Latest pending path wins when several arrive before flush.
 */
test('Test that two enqueues before flush deliver only the last file path', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.enqueueFaProjectOsOpenPath(absFaProjectFixture('first'))
  mod.enqueueFaProjectOsOpenPath(absFaProjectFixture('last'))
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: absFaProjectFixture('last') }
  )
})

/**
 * installFaProjectOsOpenListeners
 *
 * Skips registering listeners under component-test Playwright isolation.
 */
test('Test that installFaProjectOsOpenListeners is a no-op when TEST_ENV is components', async () => {
  vi.stubEnv('TEST_ENV', 'components')
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  expect(appOnMock).not.toHaveBeenCalled()
})

/**
 * installFaProjectOsOpenListeners
 *
 * Skips registering env listeners when TEST_ENV is e2e and FA_E2E_OS_OPEN is not set (normal Playwright E2E).
 */
test('Test that installFaProjectOsOpenListeners is a no-op under Playwright e2e env without flag', async () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  expect(appOnMock).not.toHaveBeenCalled()
})

/**
 * installFaProjectOsOpenListeners
 *
 * Playwright argv-open suite sets FA_E2E_OS_OPEN so cold-start replay matches installers.
 */
test('Test that installFaProjectOsOpenListeners registers when e2e and FA_E2E_OS_OPEN is 1', async () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  vi.stubEnv('FA_E2E_OS_OPEN', '1')
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  expect(appOnMock).toHaveBeenCalled()
})

/**
 * installFaProjectOsOpenListeners
 *
 * Registers second-instance handler that forwards a .faproject path from the command line.
 */
test('Test that second-instance handler enqueues a path from commandLine strings', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  const second = appOnHandlers['second-instance']
  expect(second).toBeTypeOf('function')
  second?.({} as never, ['C:\\app\\electron.exe', 'C:\\proj\\x.faproject'])
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: 'C:\\proj\\x.faproject' }
  )
})

/**
 * installFaProjectOsOpenListeners
 *
 * second-instance with no faproject path does not enqueue.
 */
test('Test that second-instance handler no-ops when commandLine has no faproject', async () => {
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  const second = appOnHandlers['second-instance']
  expect(second).toBeTypeOf('function')
  second?.({} as never, ['C:\\app\\electron.exe', '--flag'])
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).not.toHaveBeenCalled()
})

/**
 * installFaProjectOsOpenListeners
 *
 * macOS open-file registers when platform is darwin and enqueues the provided path.
 */
test('Test that open-file handler enqueues on darwin', async () => {
  Object.defineProperty(process, 'platform', {
    configurable: true,
    value: 'darwin'
  })
  const mod = await import('../faProjectOsOpenDelivery')
  const osPath = absFaProjectFixture('open-file')
  mod.installFaProjectOsOpenListeners()
  const openFile = appOnHandlers['open-file']
  expect(openFile).toBeTypeOf('function')
  const ev = { preventDefault: vi.fn() }
  openFile?.(ev, osPath)
  expect(ev.preventDefault).toHaveBeenCalledOnce()
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: osPath }
  )
})

/**
 * installFaProjectOsOpenListeners
 *
 * Cold start argv path is picked up after app.whenReady resolves.
 */
test('Test that whenReady handler enqueues argv .faproject path', async () => {
  const originalArgv = [...process.argv]
  const coldPath = absFaProjectFixture('cold')
  process.argv = ['electron', 'main.js', coldPath]
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  await Promise.resolve()
  await Promise.resolve()
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  process.argv = originalArgv
  expect(webContentsSendMock).toHaveBeenCalledWith(
    FA_PROJECT_OS_OPEN_IPC.openFromOsToRenderer,
    { filePath: coldPath }
  )
})

/**
 * installFaProjectOsOpenListeners
 *
 * Ignores dev-mode argv unless FA_DEV_OPEN_FAPROJECT is set.
 */
test('Test that cold argv is ignored in DEV without FA_DEV_OPEN_FAPROJECT', async () => {
  const originalArgv = [...process.argv]
  process.argv = ['electron', 'main.js', absFaProjectFixture('dev')]
  vi.stubEnv('DEV', true)
  const mod = await import('../faProjectOsOpenDelivery')
  mod.installFaProjectOsOpenListeners()
  await Promise.resolve()
  await Promise.resolve()
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  process.argv = originalArgv
  expect(webContentsSendMock).not.toHaveBeenCalled()
})

/**
 * enqueueFaProjectOsOpenPath
 *
 * No-ops in DEV when FA_DEV_OPEN_FAPROJECT is not set (direct enqueue).
 */
test('Test that direct enqueue is ignored in DEV without FA_DEV_OPEN_FAPROJECT', async () => {
  vi.stubEnv('DEV', true)
  Reflect.deleteProperty(process.env, 'FA_DEV_OPEN_FAPROJECT')
  const mod = await import('../faProjectOsOpenDelivery')
  mod.enqueueFaProjectOsOpenPath(absFaProjectFixture('dev-direct'))
  const win = {
    webContents: {
      isDestroyed: isDestroyedMock,
      on: vi.fn(),
      send: webContentsSendMock
    }
  }
  mod.registerFaProjectOsOpenMainWindow(win as never)
  mod.onFaProjectOsOpenRendererReady()
  expect(webContentsSendMock).not.toHaveBeenCalled()
})
