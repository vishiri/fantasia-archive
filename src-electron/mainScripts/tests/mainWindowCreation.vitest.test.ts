import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import { appWindow, mainWindowCreation, preventSecondaryAppInstance } from '../mainWindowCreation'

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

vi.mock('@electron/remote/main', () => {
  return {
    enable: enableMock
  }
})

vi.mock('src-electron/mainScripts/spellChecker', () => {
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
  preventSecondaryAppInstance(appWindowMock as any)
  expect(appMock.requestSingleInstanceLock).not.toHaveBeenCalled()

  vi.unstubAllEnvs()
  appMock.requestSingleInstanceLock.mockReturnValueOnce(false)
  preventSecondaryAppInstance(appWindowMock as any)
  expect(appMock.quit).toHaveBeenCalledOnce()

  appMock.requestSingleInstanceLock.mockReturnValueOnce(true)
  preventSecondaryAppInstance(appWindowMock as any)
  expect(appEventHandlers['second-instance']).toBeTypeOf('function')

  appEventHandlers['second-instance']()
  expect(appWindowMock.restore).toHaveBeenCalledOnce()
  expect(appWindowMock.focus).toHaveBeenCalledOnce()
})

/**
 * mainWindowCreation
 * Test BrowserWindow construction, event handlers, and delayed maximize flow.
 */
test('Test that the main window is created successfully', () => {
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
    loadURL: vi.fn(),
    show: vi.fn(),
    focus: vi.fn(),
    maximize: vi.fn()
  }
  BrowserWindowMock.mockImplementation(() => browserWindowInstance as any)

  vi.stubEnv('APP_URL', 'http://localhost:9000')
  vi.stubEnv('QUASAR_ELECTRON_PRELOAD', 'electron-preload.js')
  vi.stubEnv('DEBUGGING', 'DEBUGGING')
  vi.useFakeTimers()

  mainWindowCreation()

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
