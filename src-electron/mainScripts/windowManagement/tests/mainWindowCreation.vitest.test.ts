import { test, expect, vi, beforeEach, afterEach } from 'vitest'

import {
  assignAppWindowRefForTesting,
  appWindow,
  mainWindowCreation,
  preventSecondaryAppInstance
} from '../mainWindowCreation'
import type { BrowserWindow } from 'electron'

const {
  BrowserWindowMock,
  appMock,
  getPrimaryDisplayMock,
  enableMock,
  setupSpellCheckerMock,
  appEventHandlers
} = vi.hoisted(() => {
  const handlers: Record<string, () => void> = {}
  return {
    BrowserWindowMock: vi.fn(),
    appEventHandlers: handlers,
    appMock: {
      requestSingleInstanceLock: vi.fn(() => true),
      quit: vi.fn(),
      on: vi.fn((eventName: string, handler: () => void) => {
        handlers[eventName] = handler
      })
    },
    getPrimaryDisplayMock: vi.fn(() => ({
      workAreaSize: {
        width: 1920,
        height: 1080
      }
    })),
    enableMock: vi.fn(),
    setupSpellCheckerMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    BrowserWindow: BrowserWindowMock,
    app: appMock,
    screen: {
      getPrimaryDisplay: getPrimaryDisplayMock
    }
  }
})

vi.mock('@electron/remote/main/index.js', () => {
  return {
    enable: enableMock
  }
})

vi.mock('src-electron/mainScripts/windowManagement/spellChecker', () => {
  return {
    setupSpellChecker: setupSpellCheckerMock
  }
})

beforeEach(() => {
  BrowserWindowMock.mockReset()
  appMock.requestSingleInstanceLock.mockReset()
  appMock.requestSingleInstanceLock.mockReturnValue(true)
  appMock.quit.mockReset()
  appMock.on.mockClear()
  enableMock.mockReset()
  setupSpellCheckerMock.mockReset()
  for (const key of Object.keys(appEventHandlers)) {
    delete appEventHandlers[key]
  }
  vi.useRealTimers()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

/**
 * preventSecondaryAppInstance
 * Test single-instance guard branches and callback behavior.
 */
test('Test that app window does not start if another instance is already running', () => {
  const appWindowMock = {
    isMinimized: vi.fn(() => true),
    restore: vi.fn(),
    focus: vi.fn()
  }

  vi.stubEnv('TEST_ENV', 'components')
  preventSecondaryAppInstance(appWindowMock as unknown as BrowserWindow)
  expect(appMock.requestSingleInstanceLock).not.toHaveBeenCalled()

  vi.unstubAllEnvs()
  appMock.requestSingleInstanceLock.mockReturnValueOnce(false)
  preventSecondaryAppInstance(appWindowMock as unknown as BrowserWindow)
  expect(appMock.quit).toHaveBeenCalledOnce()

  appMock.requestSingleInstanceLock.mockReturnValueOnce(true)
  preventSecondaryAppInstance(appWindowMock as unknown as BrowserWindow)
  expect(appEventHandlers['second-instance']).toBeTypeOf('function')

  appEventHandlers['second-instance']()
  expect(appWindowMock.restore).toHaveBeenCalledOnce()
  expect(appWindowMock.focus).toHaveBeenCalledOnce()
})

/**
 * preventSecondaryAppInstance
 * e2e TEST_ENV skips single-instance lock like components mode.
 */
test('Test that preventSecondaryAppInstance skips lock when TEST_ENV is e2e', () => {
  vi.stubEnv('TEST_ENV', 'e2e')
  preventSecondaryAppInstance({} as unknown as BrowserWindow)
  expect(appMock.requestSingleInstanceLock).not.toHaveBeenCalled()
})

/**
 * preventSecondaryAppInstance
 * second-instance handler restores only when minimized; always focuses.
 */
test('Test that second-instance focuses without restore when window is not minimized', () => {
  const appWindowMock = {
    isMinimized: vi.fn(() => false),
    restore: vi.fn(),
    focus: vi.fn()
  }
  preventSecondaryAppInstance(appWindowMock as unknown as BrowserWindow)
  expect(appEventHandlers['second-instance']).toBeTypeOf('function')
  appEventHandlers['second-instance']()
  expect(appWindowMock.restore).not.toHaveBeenCalled()
  expect(appWindowMock.focus).toHaveBeenCalledOnce()
})

/**
 * preventSecondaryAppInstance
 * second-instance handler does nothing when the registered window reference was undefined.
 */
test('Test that second-instance handler no-ops when preventSecondaryAppInstance was given undefined', () => {
  preventSecondaryAppInstance(undefined)
  expect(appEventHandlers['second-instance']).toBeTypeOf('function')
  expect(() => appEventHandlers['second-instance']()).not.toThrow()
})

/**
 * mainWindowCreation
 * Test BrowserWindow construction, event handlers, and delayed maximize flow.
 */
test('Test that the main window is created successfully', async () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, () => void> = {}
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn((eventName: string, handler: () => void) => {
      onceHandlers[eventName] = handler
    }),
    on: vi.fn((eventName: string, handler: () => void) => {
      onHandlers[eventName] = handler
    }),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('APP_URL', 'http://localhost:9000')
  vi.stubEnv('DEV', true)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')
  vi.stubEnv('DEBUGGING', 'DEBUGGING')
  vi.useFakeTimers()

  await mainWindowCreation()

  expect(BrowserWindowMock).toHaveBeenCalledOnce()
  expect(BrowserWindowMock.mock.calls[0][0]).toMatchObject({
    width: 1920,
    height: 1080,
    frame: false,
    show: false
  })
  expect(enableMock).toHaveBeenCalledWith(browserWindowInstance.webContents)
  expect(browserWindowInstance.setMenu).toHaveBeenCalledWith(null)
  expect(browserWindowInstance.loadURL).toHaveBeenCalledWith('http://localhost:9000')
  expect(browserWindowInstance.webContents.openDevTools).toHaveBeenCalledOnce()
  expect(setupSpellCheckerMock).toHaveBeenCalledWith(expect.anything())

  onceHandlers['ready-to-show']()
  expect(browserWindowInstance.show).toHaveBeenCalledOnce()
  expect(browserWindowInstance.focus).toHaveBeenCalledTimes(1)
  expect(browserWindowInstance.maximize).toHaveBeenCalledTimes(1)

  vi.runAllTimers()
  expect(browserWindowInstance.maximize).toHaveBeenCalledTimes(2)

  onHandlers.closed()
  expect(appWindow).toBeUndefined()
})

/**
 * mainWindowCreation
 * DevTools are not opened when DEBUGGING is unset.
 */
test('Test that main window creation does not open DevTools when DEBUGGING is unset', async () => {
  const onceHandlers: Record<string, () => void> = {}
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn((eventName: string, handler: () => void) => {
      onceHandlers[eventName] = handler
    }),
    on: vi.fn(),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('APP_URL', 'http://localhost:9000')
  vi.stubEnv('DEV', true)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')
  vi.stubEnv('DEBUGGING', undefined)

  await mainWindowCreation()

  expect(browserWindowInstance.webContents.openDevTools).not.toHaveBeenCalled()
})

/**
 * mainWindowCreation
 * Dev mode requires APP_URL so loadURL has a concrete dev server target.
 */
test('Test that main window creation throws when DEV is set but APP_URL is missing', async () => {
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn(),
    on: vi.fn(),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('DEV', true)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')
  Reflect.deleteProperty(process.env, 'APP_URL')

  await expect(mainWindowCreation()).rejects.toThrow('APP_URL must be set when DEV is set')
})

/**
 * mainWindowCreation
 * Production build loads index.html from the packaged app.
 */
test('Test that production window uses loadFile for index.html', async () => {
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn(),
    on: vi.fn(),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('DEV', false)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')

  await mainWindowCreation()

  expect(browserWindowInstance.loadFile).toHaveBeenCalledWith('index.html')
  expect(browserWindowInstance.loadURL).not.toHaveBeenCalled()
})

/**
 * mainWindowCreation
 * QUASAR_ELECTRON_PRELOAD_FOLDER and QUASAR_ELECTRON_PRELOAD_EXTENSION default to parent folder and .js when unset.
 */
test('Test that main window preload path uses Quasar defaults when preload env vars are missing', async () => {
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn(),
    on: vi.fn(),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  Reflect.deleteProperty(process.env, 'QUASAR_ELECTRON_PRELOAD_FOLDER')
  Reflect.deleteProperty(process.env, 'QUASAR_ELECTRON_PRELOAD_EXTENSION')
  vi.stubEnv('DEV', false)

  await mainWindowCreation()

  const windowOpts = BrowserWindowMock.mock.calls[0][0] as {
    webPreferences: { preload: string }
  }
  expect(windowOpts.webPreferences.preload).toMatch(/electron-preload\.js$/)
})

/**
 * mainWindowCreation
 * ready-to-show and delayed maximize callbacks skip work after the window closed and cleared the module ref.
 */
test('Test that ready-to-show and delayed maximize no-op after closed when appWindow is cleared', async () => {
  const onceHandlers: Record<string, () => void> = {}
  const onHandlers: Record<string, () => void> = {}
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn((eventName: string, handler: () => void) => {
      onceHandlers[eventName] = handler
    }),
    on: vi.fn((eventName: string, handler: () => void) => {
      onHandlers[eventName] = handler
    }),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('DEV', false)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')

  vi.useFakeTimers()
  await mainWindowCreation()

  onceHandlers['ready-to-show']()
  expect(browserWindowInstance.maximize).toHaveBeenCalledTimes(1)

  onHandlers.closed()
  onceHandlers['ready-to-show']()
  expect(browserWindowInstance.show).toHaveBeenCalledTimes(1)

  vi.runAllTimers()
  expect(browserWindowInstance.maximize).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
})

/**
 * mainWindowCreation
 * ready-to-show inner block is skipped when the exported appWindow ref is cleared before the event runs.
 */
test('Test that ready-to-show no-ops when appWindow is undefined before the handler runs', async () => {
  const onceHandlers: Record<string, () => void> = {}
  const browserWindowInstance = {
    webContents: {
      openDevTools: vi.fn()
    },
    once: vi.fn((eventName: string, handler: () => void) => {
      onceHandlers[eventName] = handler
    }),
    on: vi.fn(),
    setMenu: vi.fn(),
    loadURL: vi.fn(() => Promise.resolve()),
    loadFile: vi.fn(() => Promise.resolve()),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(function () {
    return browserWindowInstance as unknown as BrowserWindow
  })

  vi.stubEnv('DEV', false)
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_FOLDER', '.')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD_EXTENSION', '.js')

  await mainWindowCreation()

  assignAppWindowRefForTesting(undefined)
  onceHandlers['ready-to-show']()

  expect(browserWindowInstance.show).not.toHaveBeenCalled()
  expect(browserWindowInstance.maximize).not.toHaveBeenCalled()
})
