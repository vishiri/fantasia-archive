import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faAppConfigImportStagedSessions } from 'app/src-electron/mainScripts/appConfig/faAppConfigImportStagedState'

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

vi.mock('app/src-electron/mainScripts/userSettings/userSettingsStore', () => ({
  cleanupFaUserSettings: vi.fn(),
  getFaUserSettings: getFaUserSettingsMock
}))

vi.mock('app/src-electron/mainScripts/keybinds/faKeybindsStore', () => ({
  cleanupFaKeybinds: vi.fn(),
  getFaKeybinds: getFaKeybindsMock
}))

vi.mock('app/src-electron/mainScripts/appNoteboard/faAppNoteboardStore', () => ({
  cleanupFaAppNoteboard: vi.fn(),
  getFaAppNoteboard: getFaAppNoteboardMock
}))

vi.mock('app/src-electron/mainScripts/appStyling/faAppStylingStore', () => ({
  cleanupFaAppStyling: vi.fn(),
  getFaAppStyling: getFaAppStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/faSpellCheckerSession', () => ({
  applyFaSpellCheckerLanguagesToSession: applySpellMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
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
  const { runApplyStagedAppConfigImport } = await import('../faAppConfigIpcRunApplyStagedImport')
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
