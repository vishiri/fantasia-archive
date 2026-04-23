import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faProgramConfigImportStagedSessions } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'

const {
  applySpellMock,
  getFaKeybindsMock,
  getFaProgramStylingMock,
  getFaUserSettingsMock
} = vi.hoisted(() => ({
  applySpellMock: vi.fn(),
  getFaKeybindsMock: vi.fn(),
  getFaProgramStylingMock: vi.fn(),
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

vi.mock('app/src-electron/mainScripts/programStyling/faProgramStylingStore', () => ({
  cleanupFaProgramStyling: vi.fn(),
  getFaProgramStyling: getFaProgramStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/faSpellCheckerSession', () => ({
  applyFaSpellCheckerLanguagesToSession: applySpellMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
  appWindow: undefined
}))

beforeEach(() => {
  faProgramConfigImportStagedSessions.clear()
  getFaUserSettingsMock.mockReturnValue({ store: {} })
  getFaKeybindsMock.mockReturnValue({ store: {} })
  getFaProgramStylingMock.mockReturnValue({ store: {} })
})

afterEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

test('Test runApplyStagedProgramConfigImport skips spell checker when there is no main window', async () => {
  const { runApplyStagedProgramConfigImport } = await import('../faProgramConfigIpcRunApplyStagedImport')
  const sid = 'noWin'
  faProgramConfigImportStagedSessions.set(sid, {
    data: { programSettings: { ...FA_USER_SETTINGS_DEFAULTS } },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      programSettings: 'ok',
      programStyling: 'absent'
    }
  })
  const r = runApplyStagedProgramConfigImport({
    applyKeybinds: false,
    applyProgramSettings: true,
    applyProgramStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['programSettings'])
  expect(applySpellMock).not.toHaveBeenCalled()
})
