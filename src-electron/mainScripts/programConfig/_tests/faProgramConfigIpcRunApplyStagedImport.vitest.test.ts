import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { faProgramConfigImportStagedSessions } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { runApplyStagedProgramConfigImport } from '../faProgramConfigIpcRunApplyStagedImport'

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
  appWindow: { webContents: { session: {} } }
}))

beforeEach(() => {
  faProgramConfigImportStagedSessions.clear()
  applySpellMock.mockReset()
  getFaUserSettingsMock.mockReturnValue({ store: {} })
  getFaKeybindsMock.mockReturnValue({ store: {} })
  getFaProgramStylingMock.mockReturnValue({ store: {} })
})

afterEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

test('Test runApplyStagedProgramConfigImport throws when no part selected', () => {
  expect(() =>
    runApplyStagedProgramConfigImport({
      applyKeybinds: false,
      applyProgramSettings: false,
      applyProgramStyling: false,
      sessionId: 'x'
    })
  ).toThrow(RangeError)
})

test('Test runApplyStagedProgramConfigImport throws when session missing', () => {
  expect(() =>
    runApplyStagedProgramConfigImport({
      applyKeybinds: true,
      applyProgramSettings: false,
      applyProgramStyling: false,
      sessionId: 'nope'
    })
  ).toThrow(/expired/i)
})

test('Test runApplyStagedProgramConfigImport applies program settings and clears session', () => {
  const sid = 's1'
  faProgramConfigImportStagedSessions.set(sid, {
    data: { programSettings: { ...FA_USER_SETTINGS_DEFAULTS } },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
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
  expect(faProgramConfigImportStagedSessions.has(sid)).toBe(false)
  expect(applySpellMock).toHaveBeenCalled()
})

test('Test runApplyStagedProgramConfigImport applies only keybinds from staged data', () => {
  const sid = 'kb'
  faProgramConfigImportStagedSessions.set(sid, {
    data: {
      keybinds: {
        overrides: {},
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  const r = runApplyStagedProgramConfigImport({
    applyKeybinds: true,
    applyProgramSettings: false,
    applyProgramStyling: false,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['keybinds'])
  expect(faProgramConfigImportStagedSessions.has(sid)).toBe(false)
  expect(applySpellMock).not.toHaveBeenCalled()
})

test('Test runApplyStagedProgramConfigImport applies only program styling from staged data', () => {
  const sid = 'st'
  faProgramConfigImportStagedSessions.set(sid, {
    data: {
      programStyling: {
        css: '',
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'ok'
    }
  })
  const r = runApplyStagedProgramConfigImport({
    applyKeybinds: false,
    applyProgramSettings: false,
    applyProgramStyling: true,
    sessionId: sid
  })
  expect(r.appliedParts).toEqual(['programStyling'])
  expect(faProgramConfigImportStagedSessions.has(sid)).toBe(false)
})

test('Test runApplyStagedProgramConfigImport throws when selected parts are absent from the session', () => {
  const sid = 'mismatch'
  faProgramConfigImportStagedSessions.set(sid, {
    data: {
      keybinds: {
        overrides: {},
        schemaVersion: 1
      }
    },
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'ok',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  expect(() =>
    runApplyStagedProgramConfigImport({
      applyKeybinds: false,
      applyProgramSettings: true,
      applyProgramStyling: false,
      sessionId: sid
    })
  ).toThrow(/no matching content/i)
})
