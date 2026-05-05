import { test, expect, vi, beforeEach } from 'vitest'
import { closeAppManager, openAppWindowManager, startApp } from '../appManagement'

const {
  getFaUserSettingsMock,
  mainWindowCreationMock,
  registerFaAppDetailsIpcMock,
  registerFaDevToolsIpcMock,
  registerFaExtraEnvIpcMock,
  registerFaExternalLinksIpcMock,
  registerFaKeybindsIpcMock,
  registerFaProgramConfigIpcMock,
  registerFaProjectManagementIpcMock,
  registerFaProgramStylingIpcMock,
  registerFaUserSettingsIpcMock,
  registerFaWindowControlIpcMock,
  appMock,
  appOnHandlers,
  ipcMainHandleMock
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
    ipcMainHandleMock: vi.fn(),
    mainWindowCreationMock: vi.fn(),
    registerFaAppDetailsIpcMock: vi.fn(),
    registerFaDevToolsIpcMock: vi.fn(),
    registerFaExtraEnvIpcMock: vi.fn(),
    registerFaExternalLinksIpcMock: vi.fn(),
    registerFaKeybindsIpcMock: vi.fn(),
    registerFaProgramConfigIpcMock: vi.fn(),
    registerFaProjectManagementIpcMock: vi.fn(),
    registerFaProgramStylingIpcMock: vi.fn(),
    registerFaUserSettingsIpcMock: vi.fn(),
    registerFaWindowControlIpcMock: vi.fn()
  }
})

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => {
  return {
    mainWindowCreation: mainWindowCreationMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaDevToolsIpc', () => {
  return {
    registerFaDevToolsIpc: registerFaDevToolsIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaExtraEnvIpc', () => {
  return {
    registerFaExtraEnvIpc: registerFaExtraEnvIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaExternalLinksIpc', () => {
  return {
    registerFaExternalLinksIpc: registerFaExternalLinksIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaKeybindsIpc', () => {
  return {
    registerFaKeybindsIpc: registerFaKeybindsIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaProgramConfigIpc', () => {
  return {
    registerFaProgramConfigIpc: registerFaProgramConfigIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaProjectManagementIpc', () => {
  return {
    registerFaProjectManagementIpc: registerFaProjectManagementIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaProgramStylingIpc', () => {
  return {
    registerFaProgramStylingIpc: registerFaProgramStylingIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/programStyling/faProgramStylingStore', () => {
  return {
    getFaProgramStyling: vi.fn()
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaUserSettingsIpc', () => {
  return {
    registerFaUserSettingsIpc: registerFaUserSettingsIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => {
  return {
    registerFaWindowControlIpc: registerFaWindowControlIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaAppDetailsIpc', () => {
  return {
    registerFaAppDetailsIpc: registerFaAppDetailsIpcMock
  }
})

vi.mock('app/src-electron/mainScripts/userSettings/userSettingsStore', () => {
  return {
    getFaUserSettings: getFaUserSettingsMock
  }
})

vi.mock('app/src-electron/mainScripts/keybinds/faKeybindsStore', () => {
  return {
    getFaKeybinds: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    app: appMock,
    ipcMain: {
      handle: ipcMainHandleMock
    }
  }
})

vi.mock('electron-store', () => ({
  default: class {}
}))

beforeEach(() => {
  getFaUserSettingsMock.mockReset()
  mainWindowCreationMock.mockReset()
  registerFaAppDetailsIpcMock.mockReset()
  registerFaDevToolsIpcMock.mockReset()
  registerFaExtraEnvIpcMock.mockReset()
  registerFaExternalLinksIpcMock.mockReset()
  registerFaKeybindsIpcMock.mockReset()
  registerFaProgramConfigIpcMock.mockReset()
  registerFaProjectManagementIpcMock.mockReset()
  registerFaProgramStylingIpcMock.mockReset()
  registerFaUserSettingsIpcMock.mockReset()
  registerFaWindowControlIpcMock.mockReset()
  ipcMainHandleMock.mockReset()
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
  expect(registerFaDevToolsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaExtraEnvIpcMock).toHaveBeenCalledOnce()
  expect(registerFaExternalLinksIpcMock).toHaveBeenCalledOnce()
  expect(registerFaKeybindsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaProgramConfigIpcMock).toHaveBeenCalledOnce()
  expect(registerFaProjectManagementIpcMock).toHaveBeenCalledOnce()
  expect(registerFaProgramStylingIpcMock).toHaveBeenCalledOnce()
  expect(registerFaUserSettingsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaWindowControlIpcMock).toHaveBeenCalledOnce()
  expect(registerFaAppDetailsIpcMock).toHaveBeenCalledOnce()
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
