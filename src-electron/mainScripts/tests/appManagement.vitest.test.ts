import { test, expect, vi, beforeEach } from 'vitest'
import { closeAppManager, openAppWindowManager, startApp } from '../appManagement'

const { initializeMock, mainWindowCreationMock, appMock, appOnHandlers } = vi.hoisted(() => {
  const handlers: Record<string, () => void> = {}
  return {
    initializeMock: vi.fn(),
    mainWindowCreationMock: vi.fn(),
    appOnHandlers: handlers,
    appMock: {
      whenReady: vi.fn(() => Promise.resolve()),
      on: vi.fn((eventName: string, handler: () => void) => {
        handlers[eventName] = handler
      }),
      quit: vi.fn()
    }
  }
})

vi.mock('@electron/remote/main', () => {
  return {
    initialize: initializeMock
  }
})

vi.mock('app/src-electron/mainScripts/mainWindowCreation', () => {
  return {
    mainWindowCreation: mainWindowCreationMock
  }
})

vi.mock('electron', () => {
  return {
    app: appMock
  }
})

beforeEach(() => {
  initializeMock.mockReset()
  mainWindowCreationMock.mockReset()
  appMock.whenReady.mockClear()
  appMock.on.mockClear()
  appMock.quit.mockReset()
  for (const key of Object.keys(appOnHandlers)) {
    delete appOnHandlers[key]
  }
})

/**
 * startApp
 * Test remote main initialization call.
 */
test('Test that the electron app properly starts', () => {
  startApp()
  expect(initializeMock).toHaveBeenCalledOnce()
})

/**
 * openAppWindowManager
 * Test whenReady and activate event window creation wiring.
 */
test('Test that the electron app window opens properly after start-up', async () => {
  openAppWindowManager()
  await Promise.resolve()

  expect(appMock.whenReady).toHaveBeenCalledOnce()
  expect(mainWindowCreationMock).toHaveBeenCalledTimes(1)
  expect(appOnHandlers.activate).toBeTypeOf('function')

  appOnHandlers.activate()
  expect(mainWindowCreationMock).toHaveBeenCalledTimes(2)
})

/**
 * closeAppManager
 * Test platform-aware app quit wiring.
 */
test('Test that the electron app properly closes', () => {
  closeAppManager('win32')
  expect(appOnHandlers['window-all-closed']).toBeTypeOf('function')

  appOnHandlers['window-all-closed']()
  expect(appMock.quit).toHaveBeenCalledOnce()

  appMock.quit.mockReset()
  closeAppManager('darwin')
  appOnHandlers['window-all-closed']()
  expect(appMock.quit).not.toHaveBeenCalled()
})
