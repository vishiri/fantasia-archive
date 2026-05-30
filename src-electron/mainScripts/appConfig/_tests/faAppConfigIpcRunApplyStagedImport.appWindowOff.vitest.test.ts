import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faAppConfigImportStagedSessions } from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedStateWiring'

const {
  applySpellMock,
  getFaKeybindsMock,
  getFaAppNoteboardMock,
  getFaAppStylingMock,
  getFaUserSettingsMock
} = vi.hoisted(() => ({
  applySpellMock: vi.fn(),
  getFaKeybindsMock: vi.fn(),
  getFaAppNoteboardMock: vi.fn(),
  getFaAppStylingMock: vi.fn(),
  getFaUserSettingsMock: vi.fn()
}))

vi.mock('app/src-electron/mainScripts/userSettings/userSettings_manager', () => ({
  cleanupFaUserSettings: vi.fn(),
  getFaUserSettings: getFaUserSettingsMock
}))

vi.mock('app/src-electron/mainScripts/keybinds/keybinds_manager', () => ({
  cleanupFaKeybinds: vi.fn(),
  getFaKeybinds: getFaKeybindsMock
}))

vi.mock('app/src-electron/mainScripts/appNoteboard/appNoteboard_manager', () => ({
  cleanupFaAppNoteboard: vi.fn(),
  getFaAppNoteboard: getFaAppNoteboardMock
}))

vi.mock('app/src-electron/mainScripts/appStyling/appStyling_manager', () => ({
  cleanupFaAppStyling: vi.fn(),
  getFaAppStyling: getFaAppStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/faSpellCheckerSessionWiring', () => ({
  applyFaSpellCheckerLanguagesToSession: applySpellMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/windowManagement_manager', () => ({
  appWindow: undefined
}))

beforeEach(() => {
  faAppConfigImportStagedSessions.clear()
  getFaUserSettingsMock.mockReturnValue({ store: {} })
  getFaKeybindsMock.mockReturnValue({ store: {} })
  getFaAppNoteboardMock.mockReturnValue({ store: {} })
  getFaAppStylingMock.mockReturnValue({ store: {} })
})

afterEach(() => {
  faAppConfigImportStagedSessions.clear()
})

test('Test runApplyStagedAppConfigImport skips spell checker when there is no main window', async () => {
  const { runApplyStagedAppConfigImport } = await import('../faAppConfigIpcRunApplyStagedImportWiring')
  const sid = 'noWin'
  faAppConfigImportStagedSessions.set(sid, {
    data: { appSettings: { ...FA_USER_SETTINGS_DEFAULTS } },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'ok',
      appStyling: 'absent'
    }
  })
  const r = runApplyStagedAppConfigImport({
    applyKeybinds: false,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['appSettings'])
  expect(applySpellMock).not.toHaveBeenCalled()
})
