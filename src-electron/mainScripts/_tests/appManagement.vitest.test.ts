import { test, expect, vi, beforeEach } from 'vitest'
import { closeAppManager, openAppWindowManager, startApp } from '../appManagement'

const {
  getFaUserSettingsMock,
  mainWindowCreationMock,
  registerAllFaIpcMock,
  appMock,
  appOnHandlers
} = vi.hoisted(() => {
  const handlers: Record<string, () => void> = {}
  return {
    appOnHandlers: handlers,
    appMock: {
      whenReady: vi.fn(() => Promise.resolve()),
      on: vi.fn((eventName: string, handler: () => void) => {
        handlers[eventName] = handler
      }),
      quit: vi.fn()
    },
    getFaUserSettingsMock: vi.fn(),
    mainWindowCreationMock: vi.fn(),
    registerAllFaIpcMock: vi.fn()
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/windowManagement_manager', () => {
  return {
    mainWindowCreation: mainWindowCreationMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/ipcManagement_manager', () => {
  return {
    registerAllFaIpc: registerAllFaIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/appNoteboard/appNoteboard_manager', () => {
  return {
    getFaAppNoteboard: vi.fn()
  }
})

vi.mock('app/src-electron/mainScripts/appStyling/appStyling_manager', () => {
  return {
    getFaAppStyling: vi.fn()
  }
})

vi.mock('app/src-electron/mainScripts/userSettings/userSettings_manager', () => {
  return {
    getFaUserSettings: getFaUserSettingsMock
  }
})

vi.mock('app/src-electron/mainScripts/keybinds/keybinds_manager', () => {
  return {
    getFaKeybinds: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: appMock
  }
})

vi.mock('electron-store', () => ({
  default: class {}
}))

beforeEach(() => {
  getFaUserSettingsMock.mockReset()
  mainWindowCreationMock.mockReset()
  registerAllFaIpcMock.mockReset()
  appMock.whenReady.mockClear()
  appMock.on.mockClear()
  appMock.quit.mockReset()
  for (const key of Object.keys(appOnHandlers)) {
    delete appOnHandlers[key]
  }
})

/**
 * startApp
 * Registers IPC handlers without legacy remote initialization.
 */
test('Test that the electron app properly starts', () => {
  startApp()
  expect(registerAllFaIpcMock).toHaveBeenCalledOnce()
})

/**
 * openAppWindowManager
 * Test whenReady and activate event window creation wiring.
 */
test('Test that the electron app window opens properly after start-up', async () => {
  openAppWindowManager()
  await Promise.resolve()

  expect(appMock.whenReady).toHaveBeenCalledOnce()
  expect(getFaUserSettingsMock).toHaveBeenCalledOnce()
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
