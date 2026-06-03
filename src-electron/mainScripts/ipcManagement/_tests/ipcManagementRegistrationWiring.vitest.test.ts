import { beforeEach, expect, test, vi } from 'vitest'

const {
  installFaProjectFailsafePathReplyListenerMock,
  registerFaAppConfigIpcMock,
  registerFaAppDetailsIpcMock,
  registerFaAppNoteboardIpcMock,
  registerFaAppStylingIpcMock,
  registerFaDevToolsIpcMock,
  registerFaExtraEnvIpcMock,
  registerFaExternalLinksIpcMock,
  registerFaKeybindsIpcMock,
  registerFaProjectContentIpcMock,
  registerFaProjectManagementIpcMock,
  registerFaProjectOsOpenIpcMock,
  registerFaUserSettingsIpcMock,
  registerFaWindowControlIpcMock
} = vi.hoisted(() => ({
  installFaProjectFailsafePathReplyListenerMock: vi.fn(),
  registerFaAppConfigIpcMock: vi.fn(),
  registerFaAppDetailsIpcMock: vi.fn(),
  registerFaAppNoteboardIpcMock: vi.fn(),
  registerFaAppStylingIpcMock: vi.fn(),
  registerFaDevToolsIpcMock: vi.fn(),
  registerFaExtraEnvIpcMock: vi.fn(),
  registerFaExternalLinksIpcMock: vi.fn(),
  registerFaKeybindsIpcMock: vi.fn(),
  registerFaProjectContentIpcMock: vi.fn(),
  registerFaProjectManagementIpcMock: vi.fn(),
  registerFaProjectOsOpenIpcMock: vi.fn(),
  registerFaUserSettingsIpcMock: vi.fn(),
  registerFaWindowControlIpcMock: vi.fn()
}))

vi.mock('../registerFaAppDetailsIpc', () => ({
  registerFaAppDetailsIpc: registerFaAppDetailsIpcMock
}))

vi.mock('../registerFaAppConfigIpc', () => ({
  registerFaAppConfigIpc: registerFaAppConfigIpcMock
}))

vi.mock('../registerFaAppNoteboardIpc', () => ({
  registerFaAppNoteboardIpc: registerFaAppNoteboardIpcMock
}))

vi.mock('../registerFaAppStylingIpc', () => ({
  registerFaAppStylingIpc: registerFaAppStylingIpcMock
}))

vi.mock('../registerFaDevToolsIpc', () => ({
  registerFaDevToolsIpc: registerFaDevToolsIpcMock
}))

vi.mock('../registerFaExtraEnvIpc', () => ({
  registerFaExtraEnvIpc: registerFaExtraEnvIpcMock
}))

vi.mock('../registerFaExternalLinksIpc', () => ({
  registerFaExternalLinksIpc: registerFaExternalLinksIpcMock
}))

vi.mock('../registerFaKeybindsIpc', () => ({
  registerFaKeybindsIpc: registerFaKeybindsIpcMock
}))

vi.mock('../registerFaProjectContentIpc', () => ({
  registerFaProjectContentIpc: registerFaProjectContentIpcMock
}))

vi.mock('../registerFaProjectManagementIpc', () => ({
  registerFaProjectManagementIpc: registerFaProjectManagementIpcMock
}))

vi.mock('../registerFaProjectOsOpenIpc', () => ({
  registerFaProjectOsOpenIpc: registerFaProjectOsOpenIpcMock
}))

vi.mock('../registerFaUserSettingsIpc', () => ({
  registerFaUserSettingsIpc: registerFaUserSettingsIpcMock
}))

vi.mock('../registerFaWindowControlIpc', () => ({
  registerFaWindowControlIpc: registerFaWindowControlIpcMock
}))

vi.mock('../faProjectFailsafePathFromRendererWiring', () => ({
  installFaProjectFailsafePathReplyListener: installFaProjectFailsafePathReplyListenerMock
}))

import { registerAllFaIpc } from '../ipcManagementRegistrationWiring'

beforeEach(() => {
  registerFaAppConfigIpcMock.mockReset()
  registerFaAppDetailsIpcMock.mockReset()
  registerFaAppNoteboardIpcMock.mockReset()
  registerFaAppStylingIpcMock.mockReset()
  registerFaDevToolsIpcMock.mockReset()
  registerFaExtraEnvIpcMock.mockReset()
  registerFaExternalLinksIpcMock.mockReset()
  registerFaKeybindsIpcMock.mockReset()
  registerFaProjectContentIpcMock.mockReset()
  registerFaProjectManagementIpcMock.mockReset()
  registerFaProjectOsOpenIpcMock.mockReset()
  registerFaUserSettingsIpcMock.mockReset()
  registerFaWindowControlIpcMock.mockReset()
  installFaProjectFailsafePathReplyListenerMock.mockReset()
})

/**
 * registerAllFaIpc
 * Invokes every ipcMain registrar and the failsafe path listener installer.
 */
test('Test that registerAllFaIpc registers every IPC surface once', () => {
  registerAllFaIpc()
  expect(registerFaDevToolsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaExtraEnvIpcMock).toHaveBeenCalledOnce()
  expect(registerFaExternalLinksIpcMock).toHaveBeenCalledOnce()
  expect(registerFaKeybindsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaAppConfigIpcMock).toHaveBeenCalledOnce()
  expect(installFaProjectFailsafePathReplyListenerMock).toHaveBeenCalledOnce()
  expect(registerFaProjectOsOpenIpcMock).toHaveBeenCalledOnce()
  expect(registerFaProjectManagementIpcMock).toHaveBeenCalledOnce()
  expect(registerFaProjectContentIpcMock).toHaveBeenCalledOnce()
  expect(registerFaAppNoteboardIpcMock).toHaveBeenCalledOnce()
  expect(registerFaAppStylingIpcMock).toHaveBeenCalledOnce()
  expect(registerFaUserSettingsIpcMock).toHaveBeenCalledOnce()
  expect(registerFaWindowControlIpcMock).toHaveBeenCalledOnce()
  expect(registerFaAppDetailsIpcMock).toHaveBeenCalledOnce()
})
